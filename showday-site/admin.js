import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true } });

const S = { user: null, admin: false, tab: 'concerts', pending: [], reported: [], loaded: false, armed: null, note: null };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const money = (n) => '£' + Number(n).toFixed(2).replace(/\.00$/, '');
const noteHtml = () => S.note ? `<p class="note ${S.note.kind}" role="${S.note.kind === 'err' ? 'alert' : 'status'}">${esc(S.note.text)}</p>` : '';
const setNote = (text, kind = 'ok') => { S.note = { text, kind }; };

// ---------- Data ----------
async function load() {
  const [ev, rep] = await Promise.all([
    sb.from('events').select('id, artist, venue, event_date, created_at').eq('status', 'pending').order('created_at', { ascending: true }),
    sb.from('reports').select('listing_id')
  ]);
  S.pending = ev.data || [];
  const counts = {};
  (rep.data || []).forEach((r) => { counts[r.listing_id] = (counts[r.listing_id] || 0) + 1; });
  const { data: hiddenRows } = await sb.from('listings').select('id').eq('hidden', true);
  const ids = [...new Set([...Object.keys(counts), ...(hiddenRows || []).map((r) => r.id)])];
  S.reported = [];
  if (ids.length) {
    const { data } = await sb.from('listings')
      .select('id, kind, section, price, original_price, meet_point, hidden, created_at, events(artist, venue, event_date)')
      .in('id', ids);
    S.reported = (data || []).map((l) => ({ ...l, reports: counts[l.id] || 0 }))
      .sort((a, b) => (b.hidden - a.hidden) || (b.reports - a.reports));
  }
  // Seat swaps, buddies and merch (needs supabase/002_tabs.sql)
  S.items = [];
  const ir = await sb.from('item_reports').select('item_type, item_id');
  if (!ir.error) {
    const ic = {};
    (ir.data || []).forEach((r) => { const k = r.item_type + ':' + r.item_id; ic[k] = (ic[k] || 0) + 1; });
    const TBL = { swap: 'swaps', buddy: 'buddies', merch: 'merch' };
    for (const type of Object.keys(TBL)) {
      const cols = type === 'merch' ? 'id, title, details, price, contact, hidden, created_at' : type === 'swap'
        ? 'id, have, want, contact, hidden, created_at, events(artist, venue, event_date)' : 'id, note, contact, hidden, created_at, events(artist, venue, event_date)';
      const reportedIds = Object.keys(ic).filter((k) => k.startsWith(type + ':')).map((k) => k.slice(type.length + 1));
      const [a, b] = await Promise.all([
        reportedIds.length ? sb.from(TBL[type]).select(cols).in('id', reportedIds) : Promise.resolve({ data: [] }),
        sb.from(TBL[type]).select(cols).eq('hidden', true)
      ]);
      const seen = new Set();
      [...(a.data || []), ...(b.data || [])].forEach((x) => {
        if (seen.has(x.id)) return; seen.add(x.id);
        S.items.push({ ...x, type, reports: ic[type + ':' + x.id] || 0 });
      });
    }
    S.items.sort((a, b) => (b.hidden - a.hidden) || (b.reports - a.reports));
  }
  S.loaded = true;
}

// ---------- Views ----------
function render() {
  const app = document.getElementById('app');
  let body;
  if (!S.user) {
    body = `<form data-form="login" class="panel">
      <h1>Admin</h1>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="email" required>
      <label for="pw">Password</label>
      <input id="pw" name="password" type="password" autocomplete="current-password" required>
      ${noteHtml()}
      <button type="submit" class="primary big">Log in</button>
      <a class="small" href="./">No password yet, or forgot it? Use "Forgot password?" on the main site.</a>
    </form>`;
  } else if (!S.admin) {
    body = `<section class="panel"><h1>Not allowed</h1>
      <p class="muted">${esc(S.user.email)} is not an admin. Run <code>supabase/001_admin.sql</code> with this email in Supabase.</p>
      <button type="button" class="outline" data-act="logout">Log out</button></section>`;
  } else {
    const nC = S.pending.length, nR = S.reported.length + (S.items || []).length;
    const seg = (k, label, n) => `<button type="button" class="${S.tab === k ? 'on' : ''}" aria-pressed="${S.tab === k}" data-act="tab" data-id="${k}">${label}${n ? ` (${n})` : ''}</button>`;
    body = `<div class="row between">
        <h1>Admin</h1>
        <div class="row tight">
          <button type="button" class="text" data-act="refresh">Refresh</button>
          <button type="button" class="text" data-act="logout">Log out</button>
        </div>
      </div>
      <div class="seg" role="group">${seg('concerts', 'New concerts', nC)}${seg('reports', 'Reported posts', nR)}</div>
      ${noteHtml()}
      <div class="list">${!S.loaded ? '<p class="muted">Loading…</p>' : S.tab === 'concerts' ? concerts() : reports()}</div>`;
  }
  app.innerHTML = `<header class="topbar"><a class="brand" href="./" style="text-decoration:none;color:inherit">Show Day</a></header>${body}`;
}

function concerts() {
  if (!S.pending.length) return '<p class="muted empty">Nothing to review.</p>';
  return S.pending.map((e) => `
    <form data-form="approve" data-id="${e.id}" class="listing">
      <div class="grid3">
        <div class="field"><label for="a-${e.id}">Artist</label><input id="a-${e.id}" name="artist" maxlength="80" required value="${esc(e.artist)}"></div>
        <div class="field"><label for="v-${e.id}">Venue</label><input id="v-${e.id}" name="venue" maxlength="80" required value="${esc(e.venue)}"></div>
        <div class="field"><label for="d-${e.id}">Date</label><input id="d-${e.id}" name="date" type="date" required value="${esc(e.event_date)}"></div>
      </div>
      <p class="small muted">${esc(fmtDate(e.event_date))} · submitted ${esc(new Date(e.created_at).toLocaleString('en-GB'))}</p>
      <div class="row">
        <button type="submit" class="primary">Approve</button>
        <button type="button" class="text danger" data-act="delEvent" data-id="${e.id}">${S.armed === e.id ? 'Tap again to delete' : 'Delete'}</button>
      </div>
    </form>`).join('');
}

function reports() {
  if (!S.reported.length && !(S.items || []).length) return '<p class="muted empty">No reported posts.</p>';
  return (S.items || []).map(itemCard).join('') + S.reported.map((l) => {
    const ev = l.events || {};
    return `<article class="listing">
      <div class="listing-top">
        <div class="listing-info">
          <div class="row tight">
            <span class="chip ${l.kind === 'sell' ? 'sell' : 'buy'}">${l.kind === 'sell' ? 'Selling' : 'Looking'}</span>
            ${l.hidden ? '<span class="chip meeting">Hidden</span>' : ''}
            <span class="chip done">${l.reports} report${l.reports === 1 ? '' : 's'}</span>
          </div>
          <h3>${esc(l.section)}</h3>
          <p class="small muted">${esc(ev.artist)} · ${esc(ev.venue)} · ${ev.event_date ? esc(fmtDate(ev.event_date)) : ''}</p>
          <p class="small muted">Meet: ${esc(l.meet_point)}${l.original_price ? ` · face value ${money(l.original_price)}` : ''}</p>
        </div>
        <div class="price">${money(l.price)}</div>
      </div>
      <div class="row">
        <button type="button" class="outline" data-act="${l.hidden ? 'restore' : 'hide'}" data-id="${l.id}">${l.hidden ? 'Restore' : 'Hide'}</button>
        <button type="button" class="text danger" data-act="delListing" data-id="${l.id}">${S.armed === l.id ? 'Tap again to delete' : 'Delete'}</button>
      </div>
    </article>`;
  }).join('');
}

function itemCard(x) {
  const label = { swap: 'Seat swap', buddy: 'Buddy', merch: 'Merch' }[x.type];
  const text = x.type === 'swap' ? `${x.have} → ${x.want}` : x.type === 'buddy' ? x.note : `${x.title}${x.price != null ? ' · ' + money(x.price) : ''}`;
  const ev = x.events ? `${x.events.artist} · ${x.events.venue}` : (x.details || '');
  const key = x.type + ':' + x.id;
  return `<article class="listing">
    <div class="row tight"><span class="chip buy">${label}</span>${x.hidden ? '<span class="chip meeting">Hidden</span>' : ''}<span class="chip done">${x.reports} report${x.reports === 1 ? '' : 's'}</span></div>
    <h3>${esc(text)}</h3>
    <p class="small muted">${esc(ev)}${ev ? ' · ' : ''}contact ${esc(x.contact)}</p>
    <div class="row">
      <button type="button" class="outline" data-act="${x.hidden ? 'itemRestore' : 'itemHide'}" data-id="${key}">${x.hidden ? 'Restore' : 'Hide'}</button>
      <button type="button" class="text danger" data-act="itemDel" data-id="${key}">${S.armed === key ? 'Tap again to delete' : 'Delete'}</button>
    </div>
  </article>`;
}

// ---------- Actions ----------
const actions = {
  tab(id) { S.tab = id; S.note = null; S.armed = null; render(); },
  async refresh() { S.note = null; S.loaded = false; render(); await load(); render(); },
  async logout() { await sb.auth.signOut(); location.reload(); },
  async delEvent(id) {
    if (S.armed !== id) { S.armed = id; render(); return; }
    S.armed = null;
    const { error } = await sb.from('events').delete().eq('id', id);
    if (error) setNote('Could not delete: ' + error.message, 'err');
    else { S.pending = S.pending.filter((e) => e.id !== id); setNote('Concert deleted.'); }
    render();
  },
  async itemHide(key) { await setItemHidden(key, true); },
  async itemRestore(key) { await setItemHidden(key, false); },
  async itemDel(key) {
    if (S.armed !== key) { S.armed = key; render(); return; }
    S.armed = null;
    const [type, id] = key.split(':');
    const { error } = await sb.from({ swap: 'swaps', buddy: 'buddies', merch: 'merch' }[type]).delete().eq('id', id);
    if (error) setNote('Could not delete: ' + error.message, 'err');
    else { S.items = S.items.filter((x) => !(x.type === type && x.id === id)); setNote('Post deleted.'); }
    render();
  },
  async hide(id) { await setHidden(id, true); },
  async restore(id) { await setHidden(id, false); },
  async delListing(id) {
    if (S.armed !== id) { S.armed = id; render(); return; }
    S.armed = null;
    const { error } = await sb.from('listings').delete().eq('id', id);
    if (error) setNote('Could not delete: ' + error.message, 'err');
    else { S.reported = S.reported.filter((l) => l.id !== id); setNote('Post deleted.'); }
    render();
  }
};
async function setItemHidden(key, hidden) {
  S.armed = null;
  const [type, id] = key.split(':');
  const { error } = await sb.rpc('admin_set_item_hidden', { p_type: type, p_id: id, p_hidden: hidden });
  if (error) { setNote('Could not update: ' + error.message, 'err'); render(); return; }
  setNote(hidden ? 'Post hidden.' : 'Post restored and its reports cleared.');
  await load(); render();
}
async function setHidden(id, hidden) {
  S.armed = null;
  const { error } = await sb.rpc('admin_set_hidden', { p_listing: id, p_hidden: hidden });
  if (error) { setNote('Could not update: ' + error.message, 'err'); render(); return; }
  setNote(hidden ? 'Post hidden.' : 'Post restored and its reports cleared.');
  await load(); render();
}

const forms = {
  async login(f) {
    const d = new FormData(f);
    const email = String(d.get('email') || '').trim();
    const { error } = await sb.auth.signInWithPassword({ email, password: String(d.get('password') || '') });
    if (!error) { location.reload(); return; }
    setNote(/invalid/i.test(error.message) ? 'Wrong email or password.' : error.message, 'err');
    render();
    const el = document.getElementById('email'); if (el) el.value = email;
  },
  async approve(f) {
    const id = f.dataset.id;
    const d = new FormData(f);
    const row = { artist: String(d.get('artist')).trim(), venue: String(d.get('venue')).trim(), event_date: d.get('date'), status: 'approved' };
    if (!row.artist || !row.venue || !row.event_date) return;
    const { error } = await sb.from('events').update(row).eq('id', id);
    if (error) {
      setNote(error.code === '23505' ? 'This concert already exists. Delete this one instead.' : 'Could not approve: ' + error.message, 'err');
    } else {
      S.pending = S.pending.filter((e) => e.id !== id);
      setNote(`Approved: ${row.artist}.`);
    }
    S.armed = null;
    render();
  }
};

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) { if (S.armed) { S.armed = null; render(); } return; }
  const fn = actions[b.dataset.act];
  if (fn) fn(b.dataset.id);
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-form]');
  if (!f) return;
  e.preventDefault();
  const fn = forms[f.dataset.form];
  if (fn) fn(f);
});

async function start() {
  const { data } = await sb.auth.getSession();
  S.user = data.session ? data.session.user : null;
  if (S.user) {
    const { data: ok } = await sb.rpc('is_admin');
    S.admin = ok === true;
  }
  render();
  if (S.admin) { await load(); render(); }
  sb.auth.onAuthStateChange((_evt, session) => {
    const was = S.user && S.user.id;
    if ((session && session.user.id) !== was) location.reload();
  });
}
start();
