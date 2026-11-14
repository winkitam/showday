import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
const TBL = { swap: 'swaps', buddy: 'buddies', merch: 'merch', free: 'freebies' };

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true } });

const S = { user: null, admin: false, tab: 'concerts', pending: [], reported: [], loaded: false, armed: null, note: null,
  shows: [], showQ: '', editShow: null, mergeFrom: null, artists: null, editArtist: null, ratings: null };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const CURRENCIES = ['GBP', 'HKD', 'KRW', 'JPY', 'TWD', 'SGD', 'MYR', 'THB', 'USD', 'EUR', 'AUD'];
const place = (e) => { if (!e) return ''; const v = (e.venue || '').trim(), c = (e.city || '').trim(); return v && c && v.toLowerCase() !== c.toLowerCase() ? `${v}, ${c}` : (c || v); };
const money = (n) => '£' + Number(n).toFixed(2).replace(/\.00$/, '');
const noteHtml = () => S.note ? `<p class="note ${S.note.kind}" role="${S.note.kind === 'err' ? 'alert' : 'status'}">${esc(S.note.text)}</p>` : '';
const setNote = (text, kind = 'ok') => { S.note = { text, kind }; };
const todayISO = () => new Date().toLocaleDateString('en-CA');
const norm = (s) => String(s || '').trim().toLowerCase();
const HEX = /^#[0-9a-f]{6}$/i;
const artistFor = (name) => (S.artists || []).find((a) => [a.name_en, a.name_zh, a.name_ko, ...(a.aliases || [])].some((n) => n && norm(n) === norm(name)));
const fanTag = (name) => { const a = artistFor(name); const c1 = a && a.color1, c2 = a && a.color2;
  return `<span class="fan-name" ${c1 && c2 ? `style="--c1:${c1};--c2:${c2}"` : ''}>${esc(name)}</span>`; };
const postCount = (e) => ['listings', 'swaps', 'buddies', 'freebies'].reduce((n, k) => n + ((e[k] && e[k][0] && e[k][0].count) || 0), 0);

// ---------- Data ----------
async function load() {
  const [ev, rep] = await Promise.all([
    sb.from('events').select('id, artist, city, venue, currency, event_date, created_at').eq('status', 'pending').order('created_at', { ascending: true }),
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
      .select('id, kind, section, price, original_price, meet_point, hidden, created_at, events(artist, city, venue, event_date)')
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
    for (const type of Object.keys(TBL)) {
      const cols = type === 'free' ? 'id, what, details, place, hidden, created_at, events(artist, city, venue, event_date)' : type === 'merch' ? 'id, title, details, price, contact, hidden, created_at' : type === 'swap'
        ? 'id, have, want, contact, hidden, created_at, events(artist, city, venue, event_date)' : 'id, note, contact, hidden, created_at, events(artist, city, venue, event_date)';
      const reportedIds = Object.keys(ic).filter((k) => k.startsWith(type + ':')).map((k) => k.slice(type.length + 1));
      const [a, b] = await Promise.all([
        reportedIds.length ? sb.from(TBL[type]).select(cols).in('id', reportedIds) : Promise.resolve({ data: [] }),
        sb.from(TBL[type]).select(cols).eq('hidden', true)
      ]);
      if (a.error && b.error) continue; // table not created yet
      const seen = new Set();
      [...(a.data || []), ...(b.data || [])].forEach((x) => {
        if (seen.has(x.id)) return; seen.add(x.id);
        S.items.push({ ...x, type, reports: ic[type + ':' + x.id] || 0 });
      });
    }
    S.items.sort((a, b) => (b.hidden - a.hidden) || (b.reports - a.reports));
  }
  await loadExtra();
  const fb = await sb.from('feedback').select('id, reply_email, message, page, is_read, created_at').order('created_at', { ascending: false }).limit(200);
  S.feedback = fb.error ? null : fb.data;
  S.loaded = true;
}

async function loadExtra() {
  const since = new Date(Date.now() - 180 * 864e5).toLocaleDateString('en-CA');
  const base = 'id, artist, city, venue, currency, event_date, created_at';
  let sh = await sb.from('events').select(base + ', listings(count), swaps(count), buddies(count), freebies(count)')
    .eq('status', 'approved').gte('event_date', since).order('event_date', { ascending: true }).limit(1000);
  if (sh.error) sh = await sb.from('events').select(base).eq('status', 'approved').gte('event_date', since).order('event_date', { ascending: true }).limit(1000);
  S.shows = sh.data || [];
  const ar = await sb.from('artists').select('id, name_en, name_zh, name_ko, aliases, color1, color2').order('name_en');
  S.artists = ar.error ? null : ar.data;
  const ra = await sb.from('ratings').select('id, rater, ratee, item_type, score, comment, hidden, created_at').order('created_at', { ascending: false }).limit(100);
  S.ratings = ra.error ? null : ra.data;
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
          <button type="button" class="text" data-act="cleanPhotos">${S.cleaning ? 'Cleaning…' : 'Clean up old photos'}</button>
          <button type="button" class="text" data-act="logout">Log out</button>
        </div>
      </div>
      <div class="seg seg-scroll" role="group">${seg('concerts', 'New concerts', nC)}${seg('shows', 'All shows')}${seg('artists', 'Artists')}${seg('reports', 'Reported posts', nR)}${seg('ratings', 'Ratings')}${seg('feedback', 'Feedback', (S.feedback || []).filter((x) => !x.is_read).length)}</div>
      ${noteHtml()}
      <div class="list">${!S.loaded ? '<p class="muted">Loading…</p>' : S.tab === 'concerts' ? concerts() : S.tab === 'shows' ? allShows() : S.tab === 'artists' ? artistsView() : S.tab === 'ratings' ? ratingsView() : S.tab === 'feedback' ? feedbackList() : reports()}</div>`;
  }
  app.innerHTML = `<header class="topbar"><a class="brand" href="./" style="text-decoration:none;color:inherit">Show Day</a></header>${body}`;
}

function concerts() {
  if (!S.pending.length) return '<p class="muted empty">Nothing to review.</p>';
  return S.pending.map((e) => `
    <form data-form="approve" data-id="${e.id}" class="listing">
      <div class="grid3">
        <div class="field"><label for="a-${e.id}">Artist</label><input id="a-${e.id}" name="artist" maxlength="80" required value="${esc(e.artist)}"></div>
        <div class="field"><label for="c-${e.id}">City</label><input id="c-${e.id}" name="city" maxlength="60" required value="${esc(e.city || '')}"></div>
        <div class="field"><label for="v-${e.id}">Venue (optional)</label><input id="v-${e.id}" name="venue" maxlength="80" value="${esc(e.venue || '')}"></div>
        <div class="field"><label for="cur-${e.id}">Currency</label><select id="cur-${e.id}" name="currency">${CURRENCIES.map((c) => `<option ${c === (e.currency || 'GBP') ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="field"><label for="d-${e.id}">Date</label><input id="d-${e.id}" name="date" type="date" required value="${esc(e.event_date)}"></div>
      </div>
      <p class="small muted">${esc(fmtDate(e.event_date))} · submitted ${esc(new Date(e.created_at).toLocaleString('en-GB'))}</p>
      <div class="row">
        <button type="submit" class="primary">Approve</button>
        <button type="button" class="text danger" data-act="delEvent" data-id="${e.id}">${S.armed === e.id ? 'Tap again to delete' : 'Delete'}</button>
      </div>
    </form>`).join('');
}

function showForm(e) {
  return `<form data-form="saveShow" data-id="${e.id}" class="stack">
      <div class="grid3">
        <div class="field"><label for="sa-${e.id}">Artist</label><input id="sa-${e.id}" name="artist" maxlength="80" required value="${esc(e.artist)}"></div>
        <div class="field"><label for="sc-${e.id}">City</label><input id="sc-${e.id}" name="city" maxlength="60" required value="${esc(e.city || '')}"></div>
        <div class="field"><label for="sv-${e.id}">Venue (optional)</label><input id="sv-${e.id}" name="venue" maxlength="80" value="${esc(e.venue || '')}"></div>
        <div class="field"><label for="scur-${e.id}">Currency</label><select id="scur-${e.id}" name="currency">${CURRENCIES.map((c) => `<option ${c === (e.currency || 'GBP') ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="field"><label for="sd-${e.id}">Date</label><input id="sd-${e.id}" name="date" type="date" required value="${esc(e.event_date)}"></div>
      </div>
      <div class="row">
        <button type="submit" class="primary">Save</button>
        <button type="button" class="text" data-act="editShow" data-id="">Cancel</button>
        <button type="button" class="text danger" data-act="delShow" data-id="${e.id}">${S.armed === 'del:' + e.id ? 'Tap again: delete show and all its posts' : 'Delete show'}</button>
      </div>
    </form>`;
}

function allShows() {
  const q = norm(S.showQ);
  const from = S.mergeFrom && S.shows.find((e) => e.id === S.mergeFrom);
  const list = S.shows.filter((e) => !q || norm([e.artist, e.city, e.venue, e.event_date, (artistFor(e.artist) || {}).name_zh, (artistFor(e.artist) || {}).name_ko].join(' ')).includes(q));
  const today = todayISO();
  const banner = from ? `<div class="note warn" role="status">Merging <b>${esc(from.artist)} · ${esc(place(from))} · ${esc(fmtDate(from.event_date))}</b>. Pick the show to keep; its posts move there and this one is deleted.
      <button type="button" class="text" data-act="mergeCancel">Cancel</button></div>` : '';
  const rows = list.map((e) => {
    const n = postCount(e);
    const past = e.event_date < today;
    const isFrom = S.mergeFrom === e.id;
    const mergeBtn = from && !isFrom
      ? `<button type="button" class="outline" data-act="mergeInto" data-id="${e.id}">${S.armed === 'merge:' + e.id ? 'Tap again to merge' : 'Keep this one'}</button>`
      : !from ? `<button type="button" class="text" data-act="mergeStart" data-id="${e.id}">Merge…</button>` : '';
    return `<article class="listing ${past ? 'is-done' : ''} ${isFrom ? 'merge-from' : ''}">
      <div class="row between">
        <div><b>${fanTag(e.artist)}</b>
          <p class="small muted">${esc(place(e))} · ${esc(fmtDate(e.event_date))} · ${esc(e.currency || 'GBP')}${e.listings ? ` · ${n} post${n === 1 ? '' : 's'}` : ''}${past ? ' · past' : ''}</p></div>
        <div class="row tight">
          <a class="text small" href="./?e=${e.id}" target="_blank" rel="noopener">Open page</a>
          ${from ? '' : `<button type="button" class="text" data-act="editShow" data-id="${e.id}">Edit</button>`}
          ${mergeBtn}
        </div>
      </div>
      ${S.editShow === e.id ? showForm(e) : ''}
    </article>`;
  }).join('');
  return `${banner}<input id="show-q" class="search" type="search" placeholder="Search artist, city, venue, date" value="${esc(S.showQ)}" aria-label="Search shows">
    <p class="small muted">${list.length} show${list.length === 1 ? '' : 's'} (upcoming and last 6 months)</p>
    ${rows || '<p class="muted empty">No shows match.</p>'}`;
}

function artistForm(a) {
  const id = a ? a.id : 'new';
  const has = a && a.color1 && a.color2;
  return `<form data-form="saveArtist" data-id="${id}" class="stack">
      <div class="grid3">
        <div class="field"><label for="ae-${id}">English name</label><input id="ae-${id}" name="name_en" maxlength="80" required value="${esc(a ? a.name_en : '')}"></div>
        <div class="field"><label for="az-${id}">Chinese name (optional)</label><input id="az-${id}" name="name_zh" maxlength="80" value="${esc(a ? a.name_zh : '')}"></div>
        <div class="field"><label for="ak-${id}">Korean name (optional)</label><input id="ak-${id}" name="name_ko" maxlength="80" value="${esc(a ? a.name_ko : '')}"></div>
      </div>
      <div class="field"><label for="aa-${id}">Other names fans search for, comma separated</label><input id="aa-${id}" name="aliases" maxlength="400" value="${esc(a ? (a.aliases || []).join(', ') : '')}" placeholder="skz, 스키즈"></div>
      <div class="row">
        <label class="row tight"><input type="checkbox" name="custom" ${has ? 'checked' : ''}> Fandom colours</label>
        <input type="color" name="color1" value="${esc(has ? a.color1 : '#ffb3d1')}" aria-label="Colour 1">
        <input type="color" name="color2" value="${esc(has ? a.color2 : '#c9a7ff')}" aria-label="Colour 2">
      </div>
      <div class="row">
        <button type="submit" class="primary">${a ? 'Save' : 'Add artist'}</button>
        ${a ? `<button type="button" class="text" data-act="editArtist" data-id="">Cancel</button>
        <button type="button" class="text danger" data-act="delArtist" data-id="${a.id}">${S.armed === 'art:' + a.id ? 'Tap again to delete' : 'Delete'}</button>` : ''}
      </div>
    </form>`;
}

function artistsView() {
  if (S.artists === null) return '<p class="muted empty">Run supabase/011_artists_ratings.sql first.</p>';
  const missing = [...new Set(S.shows.map((e) => e.artist.trim()))].filter((n) => !artistFor(n)).sort();
  const rows = S.artists.map((a) => `<article class="listing">
      <div class="row between">
        <div><b>${fanTag(a.name_en)}</b>
          <p class="small muted">${[a.name_zh, a.name_ko].filter(Boolean).map(esc).join(' · ') || 'English name only'}${(a.aliases || []).length ? ` · also: ${esc(a.aliases.join(', '))}` : ''}</p></div>
        <button type="button" class="text" data-act="editArtist" data-id="${a.id}">Edit</button>
      </div>
      ${S.editArtist === a.id ? artistForm(a) : ''}
    </article>`).join('');
  return `<details class="listing" ${S.editArtist === 'new' ? 'open' : ''}><summary><b>Add an artist</b></summary>${artistForm(null)}</details>
    ${missing.length ? `<p class="small muted">On the board without names or colours: ${missing.map((n) => `<button type="button" class="chip" data-act="newArtist" data-id="${esc(n)}">+ ${esc(n)}</button>`).join(' ')}</p>` : ''}
    <p class="small muted">The site shows the name in the visitor's language and falls back to English. Search finds every name.</p>
    ${rows || '<p class="muted empty">No artists yet.</p>'}`;
}

function ratingsView() {
  if (S.ratings === null) return '<p class="muted empty">Run supabase/011_artists_ratings.sql first.</p>';
  if (!S.ratings.length) return '<p class="muted empty">No ratings yet.</p>';
  return S.ratings.map((r) => `<article class="listing ${r.hidden ? 'is-done' : ''}">
      <div class="row tight"><span class="chip sell">${'★'.repeat(r.score)}${'☆'.repeat(5 - r.score)}</span>${r.hidden ? '<span class="chip meeting">Hidden</span>' : ''}
        <span class="small muted">${esc(new Date(r.created_at).toLocaleString('en-GB'))} · ${esc(r.item_type)}</span></div>
      ${r.comment ? `<p>${esc(r.comment)}</p>` : ''}
      <p class="small muted"><a href="./?v=u&id=${r.ratee}" target="_blank" rel="noopener">Rated user</a> · <a href="./?v=u&id=${r.rater}" target="_blank" rel="noopener">Rated by</a></p>
      <div class="row">
        <button type="button" class="outline" data-act="rateHide" data-id="${r.id}">${r.hidden ? 'Restore' : 'Hide'}</button>
        <button type="button" class="text danger" data-act="rateDel" data-id="${r.id}">${S.armed === 'r:' + r.id ? 'Tap again to delete' : 'Delete'}</button>
      </div>
    </article>`).join('');
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
          <p class="small muted">${esc(ev.artist)} · ${esc(place(ev))} · ${ev.event_date ? esc(fmtDate(ev.event_date)) : ''}</p>
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
  const label = { swap: 'Seat swap', buddy: 'Buddy', merch: 'Merch', free: 'Freebie' }[x.type];
  const text = x.type === 'swap' ? `${x.have} → ${x.want}` : x.type === 'buddy' ? x.note : x.type === 'free' ? `${x.what}${x.place ? ' · ' + x.place : ''}` : `${x.title}${x.price != null ? ' · ' + money(x.price) : ''}`;
  const ev = x.events ? `${x.events.artist} · ${place(x.events)}` : (x.details || '');
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

function feedbackList() {
  if (S.feedback === null) return '<p class="muted empty">Feedback is not set up yet. Run supabase/004_feedback.sql.</p>';
  if (!S.feedback.length) return '<p class="muted empty">No feedback yet.</p>';
  return S.feedback.map((x) => `<article class="listing ${x.is_read ? 'is-done' : ''}">
    <div class="row tight">${x.is_read ? '<span class="chip done">Read</span>' : '<span class="chip sell">New</span>'}<span class="small muted">${esc(new Date(x.created_at).toLocaleString('en-GB'))}</span></div>
    <p style="white-space:pre-wrap">${esc(x.message)}</p>
    <p class="small muted">${x.reply_email ? `Reply to <a href="mailto:${esc(x.reply_email)}">${esc(x.reply_email)}</a>` : 'No reply email'}${x.page ? ' · from ' + esc(x.page) : ''}</p>
    <div class="row">
      ${x.is_read ? '' : `<button type="button" class="outline" data-act="fbRead" data-id="${x.id}">Mark as read</button>`}
      <button type="button" class="text danger" data-act="fbDel" data-id="${x.id}">${S.armed === x.id ? 'Tap again to delete' : 'Delete'}</button>
    </div>
  </article>`).join('');
}

// ---------- Actions ----------
const actions = {
  tab(id) { S.tab = id; S.note = null; S.armed = null; render(); },
  async refresh() { S.note = null; S.loaded = false; render(); await load(); render(); },
  async logout() { await sb.auth.signOut(); location.reload(); },
  async cleanPhotos() {
    if (S.cleaning) return;
    S.cleaning = true; S.note = null; render();
    let removed = 0;
    try {
      for (let round = 0; round < 20; round++) {
        const { data, error } = await sb.rpc('orphan_photos');
        if (error) throw error;
        if (!data || !data.length) break;
        const names = data.map((r) => (typeof r === 'string' ? r : r.orphan_photos));
        for (let i = 0; i < names.length; i += 100) {
          const { error: e2 } = await sb.storage.from('photos').remove(names.slice(i, i + 100));
          if (e2) throw e2;
        }
        removed += names.length;
        if (names.length < 1000) break;
      }
      setNote(removed ? `Removed ${removed} unused photo${removed === 1 ? '' : 's'}.` : 'No unused photos to remove.');
    } catch (err) {
      setNote(/orphan_photos|function/i.test(err.message || '') ? 'Run supabase/010_cleanup.sql first.' : `Could not clean up: ${err.message}`, 'err');
    }
    S.cleaning = false; render();
  },
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
    const { error } = await sb.from(TBL[type]).delete().eq('id', id);
    if (error) setNote('Could not delete: ' + error.message, 'err');
    else { S.items = S.items.filter((x) => !(x.type === type && x.id === id)); setNote('Post deleted.'); }
    render();
  },
  async fbRead(id) {
    const { error } = await sb.from('feedback').update({ is_read: true }).eq('id', id);
    if (error) setNote('Could not update: ' + error.message, 'err'); else { const x = S.feedback.find((f) => f.id === id); if (x) x.is_read = true; S.note = null; }
    render();
  },
  async fbDel(id) {
    if (S.armed !== id) { S.armed = id; render(); return; }
    S.armed = null;
    const { error } = await sb.from('feedback').delete().eq('id', id);
    if (error) setNote('Could not delete: ' + error.message, 'err'); else { S.feedback = S.feedback.filter((f) => f.id !== id); setNote('Feedback deleted.'); }
    render();
  },
  editShow(id) { S.editShow = id || null; S.armed = null; S.note = null; render(); },
  async delShow(id) {
    if (S.armed !== 'del:' + id) { S.armed = 'del:' + id; render(); return; }
    S.armed = null;
    const { error } = await sb.from('events').delete().eq('id', id);
    if (error) setNote('Could not delete: ' + error.message, 'err');
    else { S.shows = S.shows.filter((e) => e.id !== id); S.editShow = null; setNote('Show deleted.'); }
    render();
  },
  mergeStart(id) { S.mergeFrom = id; S.editShow = null; S.armed = null; S.note = null; render(); },
  mergeCancel() { S.mergeFrom = null; S.armed = null; render(); },
  async mergeInto(id) {
    if (S.armed !== 'merge:' + id) { S.armed = 'merge:' + id; render(); return; }
    S.armed = null;
    const { data, error } = await sb.rpc('merge_events', { keep_id: id, dup_id: S.mergeFrom });
    if (error) setNote(/merge_events|function/i.test(error.message) ? 'Run supabase/011_artists_ratings.sql first.' : 'Could not merge: ' + error.message, 'err');
    else { S.mergeFrom = null; setNote(`Merged. ${data && data.moved ? data.moved : 0} post(s) moved.`); await loadExtra(); }
    render();
  },
  editArtist(id) { S.editArtist = id || null; S.armed = null; S.note = null; render(); },
  newArtist(name) {
    S.editArtist = 'new'; render();
    const el = document.getElementById('ae-new'); if (el) { el.value = name; el.focus(); }
  },
  async delArtist(id) {
    if (S.armed !== 'art:' + id) { S.armed = 'art:' + id; render(); return; }
    S.armed = null;
    const { error } = await sb.from('artists').delete().eq('id', id);
    if (error) setNote('Could not delete: ' + error.message, 'err');
    else { S.artists = S.artists.filter((a) => a.id !== id); S.editArtist = null; setNote('Artist deleted. Their shows stay.'); }
    render();
  },
  async rateHide(id) {
    const r = S.ratings.find((x) => x.id === id); if (!r) return;
    const { error } = await sb.from('ratings').update({ hidden: !r.hidden }).eq('id', id);
    if (error) setNote('Could not update: ' + error.message, 'err'); else { r.hidden = !r.hidden; setNote(r.hidden ? 'Rating hidden.' : 'Rating restored.'); }
    render();
  },
  async rateDel(id) {
    if (S.armed !== 'r:' + id) { S.armed = 'r:' + id; render(); return; }
    S.armed = null;
    const { error } = await sb.from('ratings').delete().eq('id', id);
    if (error) setNote('Could not delete: ' + error.message, 'err'); else { S.ratings = S.ratings.filter((x) => x.id !== id); setNote('Rating deleted.'); }
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
  async saveShow(f) {
    const id = f.dataset.id;
    const d = new FormData(f);
    const row = { artist: String(d.get('artist')).trim(), city: String(d.get('city')).trim(), venue: String(d.get('venue') || '').trim() || null,
      currency: d.get('currency') || 'GBP', event_date: d.get('date') };
    if (!row.artist || !row.city || !row.event_date) return;
    const { error } = await sb.from('events').update(row).eq('id', id);
    if (error) setNote(error.code === '23505' ? 'Another show already has these details. Use Merge instead.' : 'Could not save: ' + error.message, 'err');
    else { Object.assign(S.shows.find((e) => e.id === id) || {}, row); S.editShow = null; setNote('Saved.'); }
    render();
  },
  async saveArtist(f) {
    const id = f.dataset.id;
    const d = new FormData(f);
    const opt = (k) => String(d.get(k) || '').trim() || null;
    const custom = d.get('custom') === 'on';
    const c1 = String(d.get('color1') || ''), c2 = String(d.get('color2') || '');
    const row = { name_en: opt('name_en'), name_zh: opt('name_zh'), name_ko: opt('name_ko'),
      aliases: String(d.get('aliases') || '').split(/[,，、]/).map((x) => x.trim()).filter(Boolean).slice(0, 12),
      color1: custom && HEX.test(c1) ? c1 : null, color2: custom && HEX.test(c2) ? c2 : null, updated_at: new Date().toISOString() };
    if (!row.name_en) return;
    const q = id === 'new' ? sb.from('artists').insert(row).select().single() : sb.from('artists').update(row).eq('id', id).select().single();
    const { data, error } = await q;
    if (error) { setNote(error.code === '23505' ? 'That artist is already in the list.' : 'Could not save: ' + error.message, 'err'); render(); return; }
    if (id === 'new') S.artists.push(data); else Object.assign(S.artists.find((a) => a.id === id) || {}, data);
    S.artists.sort((a, b) => a.name_en.localeCompare(b.name_en));
    S.editArtist = null; setNote(`Saved ${row.name_en}.`);
    render();
  },
  async approve(f) {
    const id = f.dataset.id;
    const d = new FormData(f);
    const row = { artist: String(d.get('artist')).trim(), city: String(d.get('city')).trim(), venue: String(d.get('venue') || '').trim() || null,
      currency: d.get('currency') || 'GBP', event_date: d.get('date'), status: 'approved' };
    if (!row.artist || !row.city || !row.event_date) return;
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
document.addEventListener('input', (e) => {
  if (e.target.id !== 'show-q') return;
  S.showQ = e.target.value;
  const pos = e.target.selectionStart;
  render();
  const el = document.getElementById('show-q'); if (el) { el.focus(); el.setSelectionRange(pos, pos); }
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
