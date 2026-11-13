import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, CONTACT_EMAIL } from './config.js';

const CONFIGURED = SUPABASE_URL.startsWith('https://') && !SUPABASE_ANON_KEY.startsWith('YOUR_');
// Captured before the client reads the URL, so a password-reset link is recognised.
const RECOVERY = /type=recovery/.test(location.hash);
const sb = CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true } }) : null;

// ---------- Text: [English, 繁體中文, 한국어] ----------
const T = {
  brand: ['Show Day', 'Show Day', 'Show Day'],
  hero: ['Same-day tickets at face value', '當日演出票，原價轉讓', '공연 당일 티켓, 정가 거래'],
  searchPh: ['Search artist or venue', '搜尋藝人或場館', '아티스트 또는 공연장 검색'],
  login: ['Log in', '登入', '로그인'], logout: ['Log out', '登出', '로그아웃'],
  loginTitle: ['Log in', '登入', '로그인'],
  signupTitle: ['Create an account', '建立帳號', '계정 만들기'],
  resetTitle: ['Reset your password', '重設密碼', '비밀번호 재설정'],
  newPwTitle: ['Set a new password', '設定新密碼', '새 비밀번호 설정'],
  password: ['Password', '密碼', '비밀번호'], pwHint: ['At least 8 characters', '最少 8 個字元', '8자 이상'],
  createAccount: ['Create account', '建立帳號', '계정 만들기'],
  toSignup: ['New here? Create an account', '新用戶？建立帳號', '처음이세요? 계정 만들기'],
  toLogin: ['Have an account? Log in', '已有帳號？登入', '계정이 있나요? 로그인'],
  forgot: ['Forgot password?', '忘記密碼？', '비밀번호를 잊으셨나요?'],
  sendReset: ['Send reset link', '發送重設連結', '재설정 링크 보내기'],
  resetSent: ['Check your email for a reset link.', '請查看電郵中的重設連結。', '메일에서 재설정 링크를 확인하세요.'],
  savePw: ['Save password', '儲存密碼', '비밀번호 저장'],
  pwSaved: ['Password saved. You are logged in.', '密碼已儲存，你已登入。', '비밀번호가 저장되었어요. 로그인되었어요.'],
  errCreds: ['Wrong email or password.', '電郵或密碼錯誤。', '이메일 또는 비밀번호가 틀렸어요.'],
  errConfirm: ['Confirm your email first. Check your inbox.', '請先到電郵確認帳號。', '먼저 이메일에서 계정을 확인해 주세요.'],
  errShortPw: ['Password must be at least 8 characters.', '密碼最少要 8 個字元。', '비밀번호는 8자 이상이어야 해요.'],
  errEmailLimit: ['Too many emails sent. Wait a few minutes and try again.', '寄出的電郵太多，請等幾分鐘再試。', '이메일을 너무 많이 보냈어요. 몇 분 후 다시 시도해 주세요.'],
  errExists: ['This email already has an account. Log in, or reset your password.', '此電郵已有帳號，請登入或重設密碼。', '이미 가입된 이메일이에요. 로그인하거나 비밀번호를 재설정하세요.'],
  signupSent: ['Almost done. Tap the confirmation link in your email, then you are logged in.', '快完成了。請按電郵中的確認連結，之後就會登入。', '거의 다 됐어요. 이메일의 확인 링크를 누르면 로그인돼요.'],
  email: ['Email', '電郵', '이메일'], sendLink: ['Send login link', '發送登入連結', '로그인 링크 보내기'],
  linkSent: ['Check your inbox and tap the link.', '請查看電郵並按下連結。', '메일함에서 링크를 눌러 주세요.'],
  cancel: ['Cancel', '取消', '취소'],
  noResults: ['No match for "{q}".', '找不到「{q}」。', '"{q}" 결과 없음.'],
  noEvents: ['No upcoming concerts yet.', '暫時沒有演出。', '예정된 공연이 없어요.'],
  loading: ['Loading…', '載入中…', '불러오는 중…'],
  addMissing: ['Add a missing concert', '新增演出', '공연 추가'],
  fArtist: ['Artist', '藝人', '아티스트'], fVenue: ['Venue', '場館', '공연장'], fDate: ['Date', '日期', '날짜'],
  createBtn: ['Add concert', '新增演出', '공연 추가'],
  dupWarn: ['Already listed. Search for it instead.', '此演出已存在，請直接搜尋。', '이미 있어요. 검색해 주세요.'],
  pendingReview: ['Pending review', '待審核', '검토 대기'],
  tonight: ['Tonight', '今晚', '오늘 밤'],
  back: ['All concerts', '所有演出', '전체 공연'],
  copyLink: ['Copy link', '複製連結', '링크 복사'], copied: ['Link copied', '已複製連結', '링크 복사됨'],
  statsLine: ['{a} available · {m} meeting · {d} done', '{a} 可交易 · {m} 面交中 · {d} 已完成', '거래 가능 {a} · 만나는 중 {m} · 완료 {d}'],
  all: ['All', '全部', '전체'], has: ['Selling', '有票', '판매'], needs: ['Looking', '求票', '구함'],
  empty: ['No listings yet.', '暫時沒有貼文。', '아직 게시글이 없어요.'],
  stMeeting: ['Meeting now', '面交中', '만나는 중'], stDone: ['Handed over', '已完成', '양도 완료'],
  upTo: ['up to', '最高', '최대'],
  qty1: ['{n} ticket', '{n} 張', '{n}장'], qtyN: ['{n} tickets', '{n} 張', '{n}장'],
  contact: ['Contact', '聯絡', '연락하기'], hide: ['Hide', '隱藏', '숨기기'],
  more: ['More actions', '更多操作', '더보기'],
  report: ['Report', '舉報', '신고'], reported: ['Reported', '已舉報', '신고됨'], block: ['Block user', '封鎖用戶', '사용자 차단'],
  del: ['Delete', '刪除', '삭제'], yours: ['Yours', '你的', '내 글'],
  markMeeting: ['Mark as meeting', '標記為面交中', '만나는 중으로 표시'], confirmTransfer: ['Transfer confirmed', '確認已轉讓', '양도 확인'],
  payAfter: ['Pay only after the ticket is in your official app.', '票轉到官方 App 後才付款。', '티켓이 공식 앱에 도착한 뒤에 결제하세요.'],
  postCta: ['Post a listing', '發佈貼文', '글 올리기'],
  iHave: ['Selling', '我有票', '판매'], iNeed: ['Looking', '求票', '구함'],
  fSection: ['Section or standing', '區域或企位', '구역 또는 스탠딩'], fQty: ['Qty', '數量', '수량'],
  fOriginal: ['Face value (£)', '原價（£）', '정가 (£)'],
  askSell: ['Your price (£)', '要價（£）', '희망 가격 (£)'], askBuy: ['Max you pay (£)', '最高願付（£）', '최대 지불 (£)'],
  over: ['Above face value. Lower the price.', '高於原價，請調低價格。', '정가 초과. 가격을 낮춰 주세요.'],
  fMeet: ['Meeting point', '面交地點', '만날 장소'], fHandle: ['Your contact', '你的聯絡方式', '연락처'],
  phHandle: ['@instagram or WhatsApp', '@IG 或 WhatsApp', '@인스타그램 또는 WhatsApp'],
  confirmSell: ['I bought it myself, the price is at or below face value, and I will transfer it through the official app.', '票是我自己買的，價格不高於原價，並會透過官方 App 轉讓。', '직접 구매했고 정가 이하이며 공식 앱으로 양도합니다.'],
  confirmBuy: ['I will not pay above face value, and only after the transfer.', '我不會付高於原價，並在轉讓後才付款。', '정가 이하로, 양도 후에만 결제합니다.'],
  submit: ['Post', '發佈', '올리기'], posted: ['Posted.', '已發佈。', '게시됨.'],
  fillAll: ['Fill in every field and tick the box.', '請填寫所有欄位並勾選。', '모든 항목을 입력하고 체크해 주세요.'],
  errGeneric: ['Something went wrong. Try again.', '出現問題，請再試。', '문제가 생겼어요. 다시 시도해 주세요.'],
  errRate: ['Too many posts. Try later.', '發佈太頻繁，請稍後再試。', '너무 많아요. 나중에 시도해 주세요.'],
  footRule: ['Face value only. Meet in person. Never pay in advance.', '只限原價。當面交易。切勿預付。', '정가 거래만. 직접 만나서. 선결제 금지.'],
  install: ['Add to Home Screen', '加入主畫面', '홈 화면에 추가'],
  iosHint: ['In Safari, tap Share, then Add to Home Screen.', '在 Safari 按「分享」，再選「加入主畫面」。', 'Safari에서 공유 → 홈 화면에 추가.'],
  privacy: ['Privacy', '私隱政策', '개인정보'], contactUs: ['Contact us', '聯絡我們', '문의']
};
const LOCALES = ['en-GB', 'zh-HK', 'ko-KR'];
const HTML_LANG = ['en', 'zh-Hant', 'ko'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// ---------- Helpers ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (k, vars) => {
  const a = T[k] || [k];
  let s = a[S.lang] ?? a[0];
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, v) => vars[v]);
  return s;
};
const todayISO = () => new Date().toLocaleDateString('en-CA');
const fmtMoney = (n) => '£' + Number(n).toFixed(2).replace(/\.00$/, '');
const fmtDate = (iso) => iso === todayISO() ? t('tonight')
  : new Date(iso + 'T12:00:00').toLocaleDateString(LOCALES[S.lang], { weekday: 'short', day: 'numeric', month: 'short' });
const ago = (ts) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
  const f = new Intl.RelativeTimeFormat(LOCALES[S.lang], { numeric: 'auto' });
  return m < 60 ? f.format(-m, 'minute') : f.format(-Math.floor(m / 60), 'hour');
};
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
const icon = {
  search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  link: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  dots: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
};

// ---------- State ----------
const S = {
  lang: store.get('lang', guessLang()),
  user: null,
  events: [], eventsLoaded: false,
  q: '',
  selEv: null,
  listings: [], listingsLoaded: false,
  tab: 'all',
  formKind: 'sell',
  posting: false,
  creating: false,
  showLogin: false,
  authMode: 'login',
  recovery: RECOVERY,
  contacts: {},
  reported: store.get('reported', {}),
  blocked: store.get('blocked', []),
  flash: null,
  installPrompt: null,
  channel: null
};
function guessLang() {
  const l = (navigator.language || 'en').toLowerCase();
  return l.startsWith('zh') ? 1 : l.startsWith('ko') ? 2 : 0;
}
const flash = (area, key, kind = 'err') => { S.flash = { area, text: t(key), kind }; };
const flashFor = (area) => S.flash && S.flash.area === area
  ? `<p class="note ${S.flash.kind}" role="${S.flash.kind === 'err' ? 'alert' : 'status'}">${esc(S.flash.text)}</p>` : '';

// ---------- Data ----------
async function loadEvents() {
  const { data, error } = await sb.from('events')
    .select('id, artist, venue, event_date, status, created_by')
    .gte('event_date', todayISO())
    .order('event_date', { ascending: true })
    .limit(300);
  if (!error) S.events = data;
  S.eventsLoaded = true;
}
async function loadListings() {
  if (!S.selEv) return;
  const { data, error } = await sb.from('listings')
    .select('id, event_id, user_id, kind, section, qty, original_price, price, meet_point, status, hidden, created_at')
    .eq('event_id', S.selEv)
    .order('created_at', { ascending: false })
    .limit(200);
  if (!error) S.listings = data.filter((l) => !l.hidden || (S.user && l.user_id === S.user.id));
  S.listingsLoaded = true;
}
function subscribe() {
  if (S.channel) { sb.removeChannel(S.channel); S.channel = null; }
  if (!S.selEv) return;
  S.channel = sb.channel('listings-' + S.selEv)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'listings', filter: 'event_id=eq.' + S.selEv },
      async () => { await loadListings(); renderMain(); })
    .subscribe();
}
async function openEvent(id, push = true) {
  S.selEv = id; S.listings = []; S.listingsLoaded = false; S.contacts = {};
  S.tab = 'all'; S.posting = false; S.creating = false;
  if (push) history.pushState({ ev: id }, '', location.pathname + '?e=' + id);
  render(); window.scrollTo(0, 0);
  await loadListings(); subscribe(); renderMain();
}
function goHome(push = true) {
  S.selEv = null; S.posting = false; S.flash = null;
  if (S.channel) { sb.removeChannel(S.channel); S.channel = null; }
  if (push) history.pushState({}, '', location.pathname);
  render(); window.scrollTo(0, 0);
}

// ---------- Views ----------
function topBar() {
  const opts = ['EN', '繁中', '한국어'].map((l, i) => `<option value="${i}" ${S.lang === i ? 'selected' : ''}>${l}</option>`).join('');
  return `<header class="topbar">
    <button type="button" class="brand" data-act="home">${t('brand')}</button>
    <div class="row">
      <select id="lang" class="lang" aria-label="Language">${opts}</select>
      <button type="button" class="text" data-act="${S.user ? 'logout' : 'toggleLogin'}">${S.user ? t('logout') : t('login')}</button>
    </div>
  </header>`;
}

function loginPanel() {
  if (S.recovery && S.user) {
    return `<form data-form="newpw" class="panel" aria-label="${t('newPwTitle')}">
      <label for="new-pw">${t('newPwTitle')}</label>
      <input id="new-pw" name="password" type="password" autocomplete="new-password" minlength="8" placeholder="${t('pwHint')}" required>
      ${flashFor('login')}
      <button type="submit" class="primary">${t('savePw')}</button>
    </form>`;
  }
  if (S.user || !S.showLogin) return '';
  const m = S.authMode;
  const title = m === 'signup' ? t('signupTitle') : m === 'reset' ? t('resetTitle') : t('loginTitle');
  const submit = m === 'signup' ? t('createAccount') : m === 'reset' ? t('sendReset') : t('loginTitle');
  const pw = m === 'reset' ? '' : `<label for="login-pw" class="sr-only">${t('password')}</label>
      <input id="login-pw" name="password" type="password" autocomplete="${m === 'signup' ? 'new-password' : 'current-password'}" minlength="8" placeholder="${m === 'signup' ? t('pwHint') : t('password')}" required>`;
  const links = m === 'login'
    ? `<button type="button" class="text" data-act="authMode" data-id="signup">${t('toSignup')}</button><button type="button" class="text" data-act="authMode" data-id="reset">${t('forgot')}</button>`
    : `<button type="button" class="text" data-act="authMode" data-id="login">${t('toLogin')}</button>`;
  return `<form data-form="login" class="panel" aria-label="${title}">
    <h2>${title}</h2>
    <label for="login-email" class="sr-only">${t('email')}</label>
    <input id="login-email" name="email" type="email" autocomplete="email" placeholder="${t('email')}" required>
    ${pw}
    ${flashFor('login')}
    <button type="submit" class="primary">${submit}</button>
    <div class="row tight">${links}<button type="button" class="text" data-act="toggleLogin">${t('cancel')}</button></div>
  </form>`;
}

function homeView() {
  const create = S.creating ? `
    <form data-form="create" class="panel">
      <div class="grid3">
        <div class="field"><label for="new-artist">${t('fArtist')}</label><input id="new-artist" name="artist" maxlength="80" required value="${esc(S.q)}"></div>
        <div class="field"><label for="new-venue">${t('fVenue')}</label><input id="new-venue" name="venue" maxlength="80" required></div>
        <div class="field"><label for="new-date">${t('fDate')}</label><input id="new-date" name="date" type="date" min="${todayISO()}" required></div>
      </div>
      ${flashFor('create')}
      <div class="row"><button type="submit" class="primary">${t('createBtn')}</button><button type="button" class="text" data-act="cancelCreate">${t('cancel')}</button></div>
    </form>`
    : `<button type="button" class="text" data-act="openCreate">+ ${t('addMissing')}</button>`;
  return `<section class="hero">
      <h1>${t('hero')}</h1>
      <div class="searchbox">${icon.search}<input id="q" type="search" aria-label="${t('searchPh')}" placeholder="${t('searchPh')}" value="${esc(S.q)}" autocomplete="off"></div>
    </section>
    <div id="results" class="list"></div>
    ${create}`;
}

function renderResults() {
  const box = document.getElementById('results');
  if (!box) return;
  if (!S.eventsLoaded) { box.innerHTML = `<p class="muted">${t('loading')}</p>`; return; }
  const q = S.q.trim().toLowerCase();
  const matches = S.events.filter((e) => !q || (e.artist + ' ' + e.venue + ' ' + e.event_date).toLowerCase().includes(q));
  if (!matches.length) {
    box.innerHTML = `<p class="muted">${q ? esc(t('noResults', { q: S.q.trim() })) : t('noEvents')}</p>`;
    return;
  }
  box.innerHTML = matches.slice(0, 30).map((e) => `
    <button type="button" class="item" data-act="pick" data-id="${e.id}">
      <span class="item-main"><b>${esc(e.artist)}</b><span class="muted">${esc(e.venue)} · ${esc(fmtDate(e.event_date))}${e.status === 'pending' ? ` · <span class="warn-text">${t('pendingReview')}</span>` : ''}</span></span>
      ${icon.chev}
    </button>`).join('');
}

function visibleListings() {
  return S.listings.filter((l) => !S.blocked.includes(l.user_id) || (S.user && l.user_id === S.user.id));
}

function eventView(e) {
  const vis = visibleListings();
  const c = (s) => vis.filter((l) => l.status === s).length;
  const shown = vis.filter((l) => S.tab === 'all' || l.kind === S.tab);
  const seg = (k, label) => `<button type="button" class="${S.tab === k ? 'on' : ''}" aria-pressed="${S.tab === k}" data-act="tab" data-id="${k}">${label}</button>`;
  const list = !S.listingsLoaded ? `<p class="muted">${t('loading')}</p>`
    : shown.length ? shown.map(listingCard).join('') : `<p class="muted empty">${t('empty')}</p>`;
  return `<div class="row between">
      <button type="button" class="text back" data-act="back">${icon.back}${t('back')}</button>
      <button type="button" class="icon-btn" data-act="share" aria-label="${t('copyLink')}" title="${t('copyLink')}">${icon.link}</button>
    </div>
    <section class="event-head">
      <h1>${esc(e.artist)}</h1>
      <p class="muted">${esc(e.venue)} · ${esc(fmtDate(e.event_date))}${e.status === 'pending' ? ` · <span class="warn-text">${t('pendingReview')}</span>` : ''}</p>
      <p class="small muted">${esc(t('statsLine', { a: c('open'), m: c('meeting'), d: c('done') }))}</p>
      ${flashFor('share')}
    </section>
    <div class="seg" role="group">${seg('all', t('all'))}${seg('sell', t('has'))}${seg('buy', t('needs'))}</div>
    ${flashFor('list')}
    <div class="list">${list}</div>
    ${postArea(e)}`;
}

function listingCard(l) {
  const sell = l.kind === 'sell';
  const mine = S.user && l.user_id === S.user.id;
  const contact = S.contacts[l.id];
  const n = String(l.qty);
  const status = l.status === 'meeting' ? `<span class="chip meeting">${t('stMeeting')}</span>` : l.status === 'done' ? `<span class="chip done">${t('stDone')}</span>` : '';
  let main = '', menu = '';
  if (mine) {
    if (l.status !== 'done') main = `<button type="button" class="outline" data-act="advance" data-id="${l.id}">${l.status === 'open' ? t('markMeeting') : t('confirmTransfer')}</button>`;
    menu = `<button type="button" class="menu-item danger" data-act="del" data-id="${l.id}">${t('del')}</button>`;
  } else {
    main = S.user
      ? `<button type="button" class="outline" data-act="contact" data-id="${l.id}" aria-expanded="${!!contact}">${contact ? t('hide') : t('contact')}</button>`
      : `<button type="button" class="outline" data-act="toggleLogin">${t('contact')}</button>`;
    menu = `<button type="button" class="menu-item" data-act="report" data-id="${l.id}" ${S.reported[l.id] ? 'disabled' : ''}>${S.reported[l.id] ? t('reported') : t('report')}</button>`
      + (S.user ? `<button type="button" class="menu-item danger" data-act="block" data-id="${l.user_id}">${t('block')}</button>` : '');
  }
  return `<article class="listing ${l.status === 'done' ? 'is-done' : ''}">
    <div class="listing-top">
      <div class="listing-info">
        <div class="row tight"><span class="chip ${sell ? 'sell' : 'buy'}">${sell ? t('has') : t('needs')}</span>${status}${mine ? `<span class="chip mine">${t('yours')}</span>` : ''}</div>
        <h3>${esc(l.section)}</h3>
        <p class="muted small">${esc(t(n === '1' ? 'qty1' : 'qtyN', { n }))} · ${esc(l.meet_point)} · ${esc(ago(l.created_at))}</p>
      </div>
      <div class="price">${sell ? '' : `<span class="small muted">${t('upTo')} </span>`}${fmtMoney(l.price)}</div>
    </div>
    <div class="row">
      ${main}
      <details class="menu"><summary aria-label="${t('more')}" title="${t('more')}">${icon.dots}</summary><div class="menu-pop">${menu}</div></details>
    </div>
    ${contact ? `<p class="note info"><b>${esc(contact)}</b><br>${t('payAfter')}</p>` : ''}
  </article>`;
}

function postArea(e) {
  if (!S.posting) {
    return `<div class="cta-bar">${flashFor('posted')}<button type="button" class="primary big" data-act="openPost">${t('postCta')}</button></div>`;
  }
  const sell = S.formKind === 'sell';
  return `<form data-form="post" class="panel" aria-label="${t('postCta')}">
    <div class="row between"><h2>${t('postCta')}</h2><button type="button" class="text" data-act="closePost">${t('cancel')}</button></div>
    <div class="seg" role="group">
      <button type="button" class="${sell ? 'on' : ''}" aria-pressed="${sell}" data-act="kind" data-id="sell">${t('iHave')}</button>
      <button type="button" class="${!sell ? 'on' : ''}" aria-pressed="${!sell}" data-act="kind" data-id="buy">${t('iNeed')}</button>
    </div>
    <div class="grid2">
      <div class="field"><label for="p-section">${t('fSection')}</label><input id="p-section" name="section" maxlength="80" required></div>
      <div class="field narrow"><label for="p-qty">${t('fQty')}</label><select id="p-qty" name="qty"><option>1</option><option>2</option><option>3</option><option>4</option></select></div>
    </div>
    <div class="grid2">
      ${sell ? `<div class="field"><label for="p-original">${t('fOriginal')}</label><input id="p-original" name="original" inputmode="decimal" required></div>` : ''}
      <div class="field"><label for="p-price">${sell ? t('askSell') : t('askBuy')}</label><input id="p-price" name="price" inputmode="decimal" required></div>
    </div>
    <p id="over-warning" class="note err hidden" role="alert">${t('over')}</p>
    <div class="grid2">
      <div class="field"><label for="p-meet">${t('fMeet')}</label><input id="p-meet" name="meet" maxlength="80" required></div>
      <div class="field"><label for="p-contact">${t('fHandle')}</label><input id="p-contact" name="contact" maxlength="60" placeholder="${t('phHandle')}" required></div>
    </div>
    <div class="check"><input id="p-confirm" name="confirm" type="checkbox" required><label for="p-confirm">${sell ? t('confirmSell') : t('confirmBuy')}</label></div>
    ${flashFor('post')}
    <button type="submit" class="primary big">${t('submit')}</button>
  </form>`;
}

function footer() {
  const mail = CONTACT_EMAIL.startsWith('YOUR_') ? '' : `<a href="mailto:${esc(CONTACT_EMAIL)}">${t('contactUs')}</a>`;
  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const install = standalone ? '' : S.installPrompt ? `<button type="button" class="text small" data-act="install">${t('install')}</button>`
    : isIOS ? `<span>${t('iosHint')}</span>` : '';
  return `<footer>
    <p>${t('footRule')}</p>
    <p class="row tight">${install}<a href="privacy.html">${t('privacy')}</a>${mail}</p>
  </footer>`;
}

function render() {
  const app = document.getElementById('app');
  document.documentElement.lang = HTML_LANG[S.lang];
  if (!CONFIGURED) {
    app.innerHTML = `<section class="panel"><h1>Setup needed</h1><p>Open <code>config.js</code> and paste your Supabase URL and key. See README.md, step 3.</p></section>`;
    return;
  }
  const e = S.events.find((x) => x.id === S.selEv);
  document.title = e ? `${e.artist} · ${t('brand')}` : `${t('brand')} · ${t('hero')}`;
  app.innerHTML = topBar() + loginPanel() + flashFor('top') + `<div id="main" class="stack"></div>` + footer();
  renderMain();
}

function renderMain() {
  const main = document.getElementById('main');
  if (!main) return;
  const e = S.events.find((x) => x.id === S.selEv);
  if (!e) { main.innerHTML = homeView(); renderResults(); return; }
  // Keep what the user is typing in the post form across live refreshes.
  const form = main.querySelector('form[data-form="post"]');
  const saved = form ? Object.fromEntries(new FormData(form)) : null;
  main.innerHTML = eventView(e);
  if (saved) {
    const f = main.querySelector('form[data-form="post"]');
    if (f) for (const [k, v] of Object.entries(saved)) {
      const el = f.elements[k];
      if (!el) continue;
      if (el.type === 'checkbox') el.checked = v === 'on'; else el.value = v;
    }
  }
  checkOver();
}

function checkOver() {
  const o = document.getElementById('p-original');
  const p = document.getElementById('p-price');
  const w = document.getElementById('over-warning');
  if (!w) return false;
  const over = !!(o && p && parseFloat(p.value) > parseFloat(o.value));
  w.classList.toggle('hidden', !over);
  return over;
}

// ---------- Actions ----------
const isRateLimit = (e) => e && (e.status === 429 || /rate limit|security purposes|seconds/i.test(e.message || ''));
const keepEmail = (email) => { const el = document.getElementById('login-email'); if (el && email) el.value = email; };
const closeMenus = () => document.querySelectorAll('details.menu[open]').forEach((d) => d.removeAttribute('open'));
const actions = {
  home() { if (S.selEv) goHome(); },
  back() { if (history.state && history.state.ev) history.back(); else goHome(); },
  authMode(id) {
    const email = document.getElementById('login-email')?.value || '';
    S.authMode = id; S.flash = null; render(); keepEmail(email);
  },
  toggleLogin() {
    S.showLogin = !S.showLogin; S.flash = null; S.authMode = 'login'; render();
    if (S.showLogin) { window.scrollTo(0, 0); document.getElementById('login-email')?.focus(); }
  },
  async logout() { await sb.auth.signOut(); },
  async install() { if (!S.installPrompt) return; S.installPrompt.prompt(); await S.installPrompt.userChoice; S.installPrompt = null; render(); },
  pick(id) { S.flash = null; openEvent(id); },
  openCreate() {
    S.flash = null;
    if (!S.user) { actions.toggleLogin(); return; }
    S.creating = true; renderMain(); document.getElementById('new-venue')?.focus();
  },
  cancelCreate() { S.creating = false; S.flash = null; renderMain(); },
  tab(id) { S.tab = id; renderMain(); },
  kind(id) { S.formKind = id; S.flash = null; renderMain(); },
  openPost() {
    S.flash = null;
    if (!S.user) { actions.toggleLogin(); return; }
    S.posting = true; renderMain(); document.getElementById('p-section')?.focus();
  },
  closePost() { S.posting = false; S.flash = null; renderMain(); },
  async share() {
    const link = location.origin + location.pathname + '?e=' + S.selEv;
    try { await navigator.clipboard.writeText(link); flash('share', 'copied', 'ok'); }
    catch (e) { S.flash = { area: 'share', text: link, kind: 'info' }; }
    renderMain();
  },
  async contact(id) {
    if (S.contacts[id]) { delete S.contacts[id]; renderMain(); return; }
    const { data, error } = await sb.from('listing_contacts').select('contact').eq('listing_id', id).maybeSingle();
    if (error || !data) flash('list', 'errGeneric'); else { S.contacts[id] = data.contact; S.flash = null; }
    renderMain();
  },
  async report(id) {
    if (!S.user) { actions.toggleLogin(); return; }
    const { error } = await sb.from('reports').insert({ listing_id: id });
    if (error && error.code !== '23505') flash('list', 'errGeneric');
    else { S.reported[id] = true; store.set('reported', S.reported); }
    renderMain();
  },
  block(uid) { if (!S.blocked.includes(uid)) S.blocked.push(uid); store.set('blocked', S.blocked); renderMain(); },
  async advance(id) {
    const l = S.listings.find((x) => x.id === id); if (!l) return;
    const next = l.status === 'open' ? 'meeting' : 'done';
    const { error } = await sb.from('listings').update({ status: next }).eq('id', id);
    if (error) flash('list', 'errGeneric'); else l.status = next;
    renderMain();
  },
  async del(id) {
    const { error } = await sb.from('listings').delete().eq('id', id);
    if (error) flash('list', 'errGeneric'); else S.listings = S.listings.filter((x) => x.id !== id);
    renderMain();
  }
};

const forms = {
  async login(f) {
    const d = new FormData(f);
    const email = String(d.get('email') || '').trim();
    const password = String(d.get('password') || '');
    const back = location.origin + location.pathname + (S.selEv ? '?e=' + S.selEv : '');
    if (S.authMode !== 'reset' && password.length < 8) { flash('login', 'errShortPw'); render(); keepEmail(email); return; }
    if (S.authMode === 'login') {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (!error) return; // onAuthStateChange re-renders
      flash('login', isRateLimit(error) ? 'errEmailLimit' : /confirm/i.test(error.message) ? 'errConfirm' : /invalid/i.test(error.message) ? 'errCreds' : 'errGeneric');
    } else if (S.authMode === 'signup') {
      const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: back } });
      if (error) flash('login', isRateLimit(error) ? 'errEmailLimit' : /registered|exists/i.test(error.message) ? 'errExists' : 'errGeneric');
      else if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) flash('login', 'errExists', 'warn');
      else if (data.session) return; // confirmation is off: already logged in
      else flash('login', 'signupSent', 'ok');
    } else {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
      if (error) flash('login', isRateLimit(error) ? 'errEmailLimit' : 'errGeneric'); else flash('login', 'resetSent', 'ok');
    }
    render(); keepEmail(email);
  },
  async newpw(f) {
    const password = String(new FormData(f).get('password') || '');
    if (password.length < 8) { flash('login', 'errShortPw'); render(); return; }
    const { error } = await sb.auth.updateUser({ password });
    if (error) { flash('login', 'errGeneric'); render(); return; }
    S.recovery = false;
    history.replaceState(history.state, '', location.pathname + location.search);
    flash('top', 'pwSaved', 'ok');
    render();
  },
  async create(f) {
    const d = new FormData(f);
    const row = { artist: String(d.get('artist')).trim(), venue: String(d.get('venue')).trim(), event_date: d.get('date') };
    if (!row.artist || !row.venue || !row.event_date) return;
    const { data, error } = await sb.from('events').insert(row).select('id, artist, venue, event_date, status, created_by').single();
    if (error) {
      const dup = error.code === '23505';
      flash('create', dup ? 'dupWarn' : /Too many/.test(error.message) ? 'errRate' : 'errGeneric', dup ? 'warn' : 'err');
      renderMain(); return;
    }
    S.events.push(data);
    S.events.sort((a, b) => a.event_date.localeCompare(b.event_date));
    S.creating = false; S.q = ''; S.flash = null;
    openEvent(data.id);
  },
  async post(f) {
    const d = new FormData(f);
    const sell = S.formKind === 'sell';
    const original = sell ? parseFloat(d.get('original')) : null;
    const price = parseFloat(d.get('price'));
    const section = String(d.get('section') || '').trim();
    const meet = String(d.get('meet') || '').trim();
    const contact = String(d.get('contact') || '').trim();
    if (!section || !meet || !contact || !(price > 0) || (sell && !(original > 0)) || d.get('confirm') !== 'on') { flash('post', 'fillAll'); renderMain(); return; }
    if (sell && price > original) { checkOver(); return; }
    const { error } = await sb.rpc('create_listing', {
      p_event: S.selEv, p_kind: S.formKind, p_section: section, p_qty: Number(d.get('qty')),
      p_original: original, p_price: price, p_meet: meet, p_contact: contact
    });
    if (error) {
      flash('post', error.code === '23514' ? 'over' : /Too many/.test(error.message) ? 'errRate' : 'errGeneric');
      renderMain(); return;
    }
    S.posting = false;
    flash('posted', 'posted', 'ok');
    await loadListings();
    renderMain();
  }
};

// ---------- Wiring ----------
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!e.target.closest('details.menu')) closeMenus();
  if (!b || b.disabled) return;
  closeMenus();
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
document.addEventListener('input', (e) => {
  if (e.target.id === 'q') { S.q = e.target.value; renderResults(); }
  if (e.target.id === 'p-price' || e.target.id === 'p-original') checkOver();
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'lang') { S.lang = Number(e.target.value); store.set('lang', S.lang); render(); }
});
window.addEventListener('popstate', () => {
  const id = new URLSearchParams(location.search).get('e');
  if (id && S.events.some((x) => x.id === id)) openEvent(id, false); else goHome(false);
});
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); S.installPrompt = e; render(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

async function start() {
  render();
  if (!CONFIGURED) return;
  const { data } = await sb.auth.getSession();
  S.user = data.session ? data.session.user : null;
  sb.auth.onAuthStateChange(async (evt, session) => {
    if (evt === 'PASSWORD_RECOVERY') { S.recovery = true; S.showLogin = false; }
    const before = S.user && S.user.id;
    S.user = session ? session.user : null;
    if ((S.user && S.user.id) !== before) {
      S.showLogin = false; S.contacts = {};
      await loadEvents(); await loadListings(); render();
    }
  });
  await loadEvents();
  const wanted = new URLSearchParams(location.search).get('e');
  if (wanted && UUID.test(wanted) && S.events.some((x) => x.id === wanted)) {
    history.replaceState({ ev: wanted }, '', location.pathname + '?e=' + wanted);
    await openEvent(wanted, false);
  } else {
    render();
  }
}
start();
