import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, CONTACT_EMAIL } from './config.js';

const CONFIGURED = SUPABASE_URL.startsWith('https://') && !SUPABASE_ANON_KEY.startsWith('YOUR_');
const sb = CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true } }) : null;

// ---------- Text in three languages: [English, 繁體中文, 한국어] ----------
const T = {
  brand: ['Show Day Board', '當日演出票板', '공연 당일 티켓 게시판'],
  badge: ['Fan to fan, face value only', '粉絲對粉絲，只限原價', '팬끼리, 정가 거래만'],
  login: ['Log in', '登入', '로그인'], logout: ['Log out', '登出', '로그아웃'],
  loginTitle: ['Log in with email', '以電郵登入', '이메일로 로그인'],
  loginBody: ['We email you a one-time link. No password needed.', '我們會寄一條一次性連結給你，不需要密碼。', '일회용 링크를 이메일로 보내드려요. 비밀번호는 필요 없어요.'],
  email: ['Email', '電郵', '이메일'], sendLink: ['Send link', '發送連結', '링크 보내기'],
  linkSent: ['Check your inbox and tap the link to log in.', '請查看電郵並按下連結登入。', '메일함을 확인하고 링크를 눌러 로그인하세요.'],
  install: ['Add to Home Screen', '加入主畫面', '홈 화면에 추가'],
  installBody: ['Open the board in one tap on show day.', '演出當天一按即開。', '공연 당일 한 번에 열 수 있어요.'],
  iosHint: ['Tap the Share button, then "Add to Home Screen".', '按「分享」按鈕，再選「加入主畫面」。', '공유 버튼을 누른 뒤 "홈 화면에 추가"를 선택하세요.'],
  add: ['Add', '加入', '추가'], later: ['Later', '稍後', '나중에'],
  searchTitle: ['Find your concert', '搜尋演出', '공연 찾기'],
  searchPh: ['Search artist, venue or date', '搜尋藝人、場館或日期', '아티스트, 공연장, 날짜 검색'],
  open: ['Open', '開啟', '열기'], viewing: ['Viewing', '正在查看', '보는 중'],
  noResults: ['No concert matches "{q}".', '找不到「{q}」的演出。', '"{q}"와 일치하는 공연이 없어요.'],
  noEvents: ['No upcoming concerts yet.', '暫時沒有即將舉行的演出。', '아직 예정된 공연이 없어요.'],
  cantFind: ['Can’t find your concert? Add it', '找不到演出？新增一個', '공연이 없나요? 직접 추가하기'],
  newTitle: ['Add a concert', '新增演出', '공연 추가'],
  fArtist: ['Artist', '藝人', '아티스트'], fVenue: ['Venue', '場館', '공연장'], fDate: ['Date', '日期', '날짜'],
  newNote: ['New concerts are checked before everyone can see them.', '新增的演出會先經審核，才會公開顯示。', '새 공연은 확인 후 모두에게 공개돼요.'],
  createBtn: ['Add concert', '新增演出', '공연 추가'], cancel: ['Cancel', '取消', '취소'],
  created: ['Concert added. You can post to it now.', '已新增演出，現在可以發佈貼文。', '공연이 추가됐어요. 이제 글을 올릴 수 있어요.'],
  dupWarn: ['This concert already exists. Search for it above.', '此演出已存在，請在上方搜尋。', '이미 있는 공연이에요. 위에서 검색해 주세요.'],
  pendingReview: ['Pending review', '待審核', '검토 대기'],
  loginToCreate: ['Log in to add a concert.', '登入後才可新增演出。', '로그인하면 공연을 추가할 수 있어요.'],
  tonight: ['Tonight', '今晚', '오늘 밤'],
  sdLive: ['SHOW DAY', '今日演出', '오늘 공연'], upcoming: ['UPCOMING', '即將舉行', '예정'],
  shareLink: ['Copy link to this concert', '複製此演出連結', '이 공연 링크 복사'], copied: ['Link copied', '已複製連結', '링크 복사됨'],
  stOpen: ['Available', '可交易', '거래 가능'], stMeeting: ['Meeting now', '面交中', '만나는 중'], stDone: ['Handed over', '已完成', '양도 완료'],
  listingsTitle: ['Live listings', '最新貼文', '실시간 게시글'],
  all: ['All', '全部', '전체'], has: ['Has ticket', '有票', '티켓 있음'], needs: ['Needs ticket', '求票', '티켓 구함'],
  empty: ['Nothing here yet. Be the first to post.', '暫時沒有貼文，成為第一個發佈的人。', '아직 게시글이 없어요. 첫 글을 올려 보세요.'],
  loading: ['Loading…', '載入中…', '불러오는 중…'],
  priceSell: ['Asking per ticket', '每張要價', '장당 희망 가격'], priceBuy: ['Will pay up to, per ticket', '每張最高願付', '장당 최대 지불 가격'],
  meetLabel: ['Meeting point', '面交地點', '만날 장소'],
  qty1: ['{n} ticket', '{n} 張', '{n}장'], qtyN: ['{n} tickets', '{n} 張', '{n}장'],
  showContact: ['Show contact', '顯示聯絡方式', '연락처 보기'], hideContact: ['Hide contact', '隱藏聯絡方式', '연락처 숨기기'],
  loginToContact: ['Log in to see contact', '登入後查看聯絡方式', '로그인 후 연락처 보기'],
  report: ['Report', '舉報', '신고'], reported: ['Reported', '已舉報', '신고됨'], block: ['Block', '封鎖', '차단'],
  del: ['Delete', '刪除', '삭제'], yours: ['Your post', '你的貼文', '내 게시글'],
  markMeeting: ['We are meeting', '正在面交', '만나는 중으로 표시'], confirmTransfer: ['Transfer confirmed', '確認已轉讓', '양도 확인'],
  contactPrefix: ['Contact:', '聯絡：', '연락처:'],
  payAfter: ['Pay only after the ticket arrives in your official app.', '請在票出現在官方 App 後才付款。', '티켓이 공식 앱에 도착한 뒤에만 결제하세요.'],
  postTitle: ['Post a listing', '發佈貼文', '게시글 올리기'], postingTo: ['Posting to', '發佈到', '게시 대상'],
  iHave: ['I have a ticket', '我有票', '티켓이 있어요'], iNeed: ['I need a ticket', '我要買票', '티켓이 필요해요'],
  fSection: ['Section, row, seat (or standing)', '區域、排、座位（或企位）', '구역, 열, 좌석 (또는 스탠딩)'],
  phSection: ['Block 105, Row 12', '105 區 12 排', '105구역 12열'], fQty: ['Quantity', '數量', '수량'],
  fOriginal: ['Original price per ticket (£)', '每張原價（£）', '장당 정가 (£)'],
  phOriginal: ['From your purchase email', '見購票確認電郵', '구매 확인 이메일 기준'],
  askSell: ['Asking price per ticket (£)', '每張要價（£）', '장당 희망 가격 (£)'],
  askBuy: ['Highest you will pay per ticket (£)', '每張最高願付（£）', '장당 최대 지불 가격 (£)'],
  over: ['This is above face value. Only the original price plus unavoidable fees is allowed.', '價格高於原價。只允許原價加不可避免的費用。', '정가를 초과했어요. 원래 가격에 불가피한 수수료만 허용돼요.'],
  fMeet: ['Meeting point near the venue', '場館附近的面交地點', '공연장 근처 만날 장소'], phMeet: ['e.g. by the main entrance', '例如：正門旁', '예: 정문 옆'],
  fHandle: ['How to reach you', '聯絡方式', '연락 방법'], phHandle: ['@instagram or WhatsApp', '@IG 或 WhatsApp', '@인스타그램 또는 WhatsApp'],
  confirmSell: ['I bought this ticket myself, the price is not higher than face value, and I will only hand it over through the official app.', '我自己購買了這張票，價格沒有高於原價，並且只會透過官方 App 轉讓。', '이 티켓은 제가 직접 구매했고, 가격은 정가를 넘지 않으며, 공식 앱으로만 양도하겠습니다.'],
  confirmBuy: ['I will not offer more than face value, and I will only pay after the ticket arrives in my official app.', '我不會出價高於原價，並且只會在票出現在官方 App 後才付款。', '정가보다 높게 제시하지 않으며, 티켓이 공식 앱에 도착한 뒤에만 결제하겠습니다.'],
  submit: ['Post to the board', '發佈到票板', '게시판에 올리기'], posted: ['Posted. Your listing is live.', '已發佈，你的貼文已上線。', '게시되었어요.'],
  loginToPost: ['Log in to post a listing.', '登入後才可發佈貼文。', '로그인하면 글을 올릴 수 있어요.'],
  fillAll: ['Please fill in every field and tick the box.', '請填寫所有欄位並勾選確認。', '모든 항목을 입력하고 확인란을 체크해 주세요.'],
  errGeneric: ['Something went wrong. Please try again.', '出現問題，請再試一次。', '문제가 생겼어요. 다시 시도해 주세요.'],
  errRate: ['Too many posts. Please try again later.', '發佈太頻繁，請稍後再試。', '게시가 너무 많아요. 나중에 다시 시도해 주세요.'],
  selectEvent: ['Pick a concert above to see its listings.', '請在上方選擇演出查看貼文。', '위에서 공연을 선택하면 게시글을 볼 수 있어요.'],
  safetyTitle: ['Staying safe.', '安全提示。', '안전 수칙.'],
  safetyBody: ['Meet somewhere busy and well lit near the venue. Check the transfer in the official ticketing app before any money changes hands. Never pay in advance. This board only connects fans and does not hold tickets or payments.', '請在場館附近人多、光線充足的地方面交。付款前先在官方售票 App 確認轉讓成功。切勿預付。本票板只負責連結粉絲，不持有票或款項。', '공연장 근처의 사람이 많고 밝은 곳에서 만나세요. 돈을 주고받기 전에 공식 앱에서 양도를 확인하세요. 선결제는 하지 마세요. 이 게시판은 팬을 연결할 뿐 티켓이나 결제를 보관하지 않아요.'],
  privacy: ['Privacy', '私隱政策', '개인정보'], contactUs: ['Contact', '聯絡我們', '문의']
};
const LOCALES = ['en-GB', 'zh-HK', 'ko-KR'];
const HTML_LANG = ['en', 'zh-Hant', 'ko'];

// ---------- Small helpers ----------
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
const evLabel = (e) => `${e.artist} / ${e.venue}, ${fmtDate(e.event_date)}`;
const ago = (ts) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
  const f = new Intl.RelativeTimeFormat(LOCALES[S.lang], { numeric: 'auto' });
  return m < 60 ? f.format(-m, 'minute') : f.format(-Math.floor(m / 60), 'hour');
};
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;

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
  creating: false,
  showLogin: false,
  contacts: {},
  reported: store.get('reported', {}),
  blocked: store.get('blocked', []),
  flash: null,
  installPrompt: null,
  installDismissed: store.get('installDismissed', false),
  channel: null
};
function guessLang() {
  const l = (navigator.language || 'en').toLowerCase();
  return l.startsWith('zh') ? 1 : l.startsWith('ko') ? 2 : 0;
}
const flash = (area, key, kind = 'err') => { S.flash = { area, text: t(key), kind }; };
const flashFor = (area) => S.flash && S.flash.area === area
  ? `<div class="note ${S.flash.kind}" role="${S.flash.kind === 'err' ? 'alert' : 'status'}">${esc(S.flash.text)}</div>` : '';

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
      async () => { await loadListings(); renderBoard(); })
    .subscribe();
}
async function selectEvent(id) {
  S.selEv = id; S.listings = []; S.listingsLoaded = false; S.contacts = {}; S.tab = 'all';
  history.replaceState(null, '', location.pathname + '?e=' + id);
  store.set('lastEvent', id);
  render();
  await loadListings(); subscribe(); renderBoard();
}

// ---------- Views ----------
function header() {
  const langs = ['EN', '繁中', '한국어'].map((l, i) =>
    `<button type="button" class="${S.lang === i ? 'on' : ''}" lang="${HTML_LANG[i]}" aria-pressed="${S.lang === i}" data-act="lang" data-id="${i}">${l}</button>`).join('');
  return `<header class="row between">
    <div class="stack" style="gap:4px">
      <div class="brand">${t('brand')}</div>
      <span class="badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>${t('badge')}</span>
    </div>
    <div class="row">
      <div class="row" role="group" aria-label="Language" style="gap:4px">${langs}</div>
      ${S.user
        ? `<button type="button" data-act="logout">${t('logout')}</button>`
        : `<button type="button" class="primary" data-act="toggleLogin">${t('login')}</button>`}
    </div>
  </header>`;
}

function installBanner() {
  if (S.installDismissed || window.matchMedia('(display-mode: standalone)').matches) return '';
  if (!S.installPrompt && !isIOS) return '';
  return `<div class="card row" style="flex-direction:row">
    <img src="icon.svg" width="40" height="40" alt="" style="border-radius:10px">
    <div style="flex:1 1 200px"><b>${t('install')}</b><p class="muted">${isIOS ? t('iosHint') : t('installBody')}</p></div>
    <div class="row">
      ${S.installPrompt ? `<button type="button" class="primary" data-act="install">${t('add')}</button>` : ''}
      <button type="button" data-act="installLater">${t('later')}</button>
    </div>
  </div>`;
}

function loginPanel() {
  if (S.user || !S.showLogin) return '';
  return `<section class="card" aria-label="${t('loginTitle')}">
    <h2>${t('loginTitle')}</h2>
    <p class="muted">${t('loginBody')}</p>
    <form data-form="login" class="row" style="align-items:flex-end">
      <div class="field"><label for="login-email">${t('email')}</label><input id="login-email" name="email" type="email" autocomplete="email" required></div>
      <button type="submit" class="primary">${t('sendLink')}</button>
    </form>
    ${flashFor('login')}
  </section>`;
}

function searchSection() {
  const createForm = S.creating ? `
    <form data-form="create" class="stack" style="border-top:1px solid #EAECF0;padding-top:14px">
      <h3>${t('newTitle')}</h3>
      <div class="row" style="align-items:flex-start">
        <div class="field"><label for="new-artist">${t('fArtist')}</label><input id="new-artist" name="artist" maxlength="80" required value="${esc(S.q)}"></div>
        <div class="field"><label for="new-venue">${t('fVenue')}</label><input id="new-venue" name="venue" maxlength="80" required></div>
        <div class="field"><label for="new-date">${t('fDate')}</label><input id="new-date" name="date" type="date" min="${todayISO()}" required></div>
      </div>
      <p class="muted small">${t('newNote')}</p>
      ${flashFor('create')}
      <div class="row"><button type="submit" class="primary">${t('createBtn')}</button><button type="button" data-act="cancelCreate">${t('cancel')}</button></div>
    </form>` : `
    <button type="button" class="dashed" style="align-self:flex-start" data-act="openCreate">+ ${t('cantFind')}</button>
    ${flashFor('created')}`;
  return `<section class="card" aria-label="${t('searchTitle')}">
    <label for="q" class="display" style="font-size:18px;font-weight:700">${t('searchTitle')}</label>
    <div class="searchbox">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475467" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input id="q" type="search" placeholder="${t('searchPh')}" value="${esc(S.q)}" autocomplete="off">
    </div>
    <div id="results" class="stack" style="gap:8px"></div>
    ${createForm}
  </section>`;
}

function renderResults() {
  const box = document.getElementById('results');
  if (!box) return;
  if (!S.eventsLoaded) { box.innerHTML = `<p class="muted">${t('loading')}</p>`; return; }
  const q = S.q.trim().toLowerCase();
  const matches = S.events.filter((e) => !q || (e.artist + ' ' + e.venue + ' ' + fmtDate(e.event_date) + ' ' + e.event_date).toLowerCase().includes(q));
  if (!matches.length) {
    box.innerHTML = `<p class="muted">${q ? esc(t('noResults', { q: S.q.trim() })) : t('noEvents')}</p>`;
    return;
  }
  box.innerHTML = matches.slice(0, 20).map((e) => {
    const sel = e.id === S.selEv;
    return `<div class="result ${sel ? 'sel' : ''}">
      <div class="info"><b>${esc(evLabel(e))}</b>
        ${e.status === 'pending' ? `<div class="small" style="color:#93370D;font-weight:600">${t('pendingReview')}</div>` : ''}</div>
      <button type="button" class="${sel ? 'primary' : ''}" aria-pressed="${sel}" data-act="pick" data-id="${e.id}">${sel ? t('viewing') : t('open')}</button>
    </div>`;
  }).join('');
}

function showDay(e) {
  const vis = visibleListings();
  const c = (s) => vis.filter((l) => l.status === s).length;
  return `<section class="card dark" aria-label="${esc(evLabel(e))}">
    <div class="row between">
      <span class="live">● ${e.event_date === todayISO() ? t('sdLive') : t('upcoming')}</span>
      <button type="button" class="ghost-dark" data-act="share">${t('shareLink')}</button>
    </div>
    <div><h1>${esc(e.artist)}</h1><p class="muted" style="font-size:15px">${esc(e.venue)} · ${esc(fmtDate(e.event_date))}</p>
      ${e.status === 'pending' ? `<p class="small" style="color:#FDB022;font-weight:600;margin-top:6px">${t('pendingReview')}</p>` : ''}</div>
    <div class="stats">
      <div class="stat"><b>${c('open')}</b><span class="small muted">${t('stOpen')}</span></div>
      <div class="stat"><b>${c('meeting')}</b><span class="small muted">${t('stMeeting')}</span></div>
      <div class="stat"><b>${c('done')}</b><span class="small muted">${t('stDone')}</span></div>
    </div>
    ${flashFor('share')}
  </section>`;
}

function visibleListings() {
  return S.listings.filter((l) => !S.blocked.includes(l.user_id) || (S.user && l.user_id === S.user.id));
}

function listingsSection() {
  const vis = visibleListings();
  const shown = vis.filter((l) => S.tab === 'all' || l.kind === S.tab);
  const tab = (k, label, n) => `<button type="button" class="pill ${S.tab === k ? 'on' : ''}" data-act="tab" data-id="${k}">${label} ${n}</button>`;
  const body = !S.listingsLoaded ? `<p class="muted">${t('loading')}</p>`
    : shown.length ? shown.map(listingCard).join('')
    : `<div class="card" style="border-style:dashed;text-align:center"><p class="muted">${t('empty')}</p></div>`;
  return `<section class="stack" aria-label="${t('listingsTitle')}">
    <div class="row between"><h2>${t('listingsTitle')}</h2>
      <div class="row">${tab('all', t('all'), vis.length)}${tab('sell', t('has'), vis.filter((l) => l.kind === 'sell').length)}${tab('buy', t('needs'), vis.filter((l) => l.kind === 'buy').length)}</div>
    </div>
    ${flashFor('list')}
    ${body}
  </section>`;
}

function listingCard(l) {
  const sell = l.kind === 'sell';
  const mine = S.user && l.user_id === S.user.id;
  const contact = S.contacts[l.id];
  const statusLabel = { open: t('stOpen'), meeting: t('stMeeting'), done: t('stDone') }[l.status];
  const n = String(l.qty);
  let actions = '';
  if (mine) {
    if (l.status !== 'done') actions += `<button type="button" class="primary" data-act="advance" data-id="${l.id}">${l.status === 'open' ? t('markMeeting') : t('confirmTransfer')}</button>`;
    actions += `<button type="button" class="danger" data-act="del" data-id="${l.id}">${t('del')}</button>`;
  } else {
    actions += S.user
      ? `<button type="button" class="primary" data-act="contact" data-id="${l.id}">${contact ? t('hideContact') : t('showContact')}</button>`
      : `<button type="button" class="primary" data-act="toggleLogin">${t('loginToContact')}</button>`;
    actions += `<button type="button" data-act="report" data-id="${l.id}" ${S.reported[l.id] ? 'disabled' : ''}>${S.reported[l.id] ? t('reported') : t('report')}</button>`;
    if (S.user) actions += `<button type="button" class="danger" data-act="block" data-id="${l.user_id}">${t('block')}</button>`;
  }
  return `<article class="card">
    <div class="row between">
      <div class="row" style="gap:6px">
        <span class="chip ${sell ? 'sell' : 'buy'}">${sell ? t('has') : t('needs')}</span>
        <span class="chip ${l.status}">${statusLabel}</span>
        ${mine ? `<span class="chip mine">${t('yours')}</span>` : ''}
      </div>
      <span class="small muted">${esc(ago(l.created_at))}</span>
    </div>
    <div><h3>${esc(l.section)}</h3><p class="muted">${esc(t(n === '1' ? 'qty1' : 'qtyN', { n }))}</p></div>
    <div class="row" style="gap:24px;align-items:flex-start">
      <div><div class="small muted">${sell ? t('priceSell') : t('priceBuy')}</div><div class="price">${fmtMoney(l.price)}</div></div>
      <div><div class="small muted">${t('meetLabel')}</div><div style="font-weight:500;padding-top:4px">${esc(l.meet_point)}</div></div>
    </div>
    <div class="row">${actions}</div>
    ${contact ? `<div class="note info">${t('contactPrefix')} <b>${esc(contact)}</b><br><span class="muted">${t('payAfter')}</span></div>` : ''}
  </article>`;
}

function postSection(e) {
  if (!S.user) {
    return `<section class="card"><h2>${t('postTitle')}</h2><p class="muted">${t('loginToPost')}</p>
      <button type="button" class="primary" style="align-self:flex-start" data-act="toggleLogin">${t('login')}</button></section>`;
  }
  const sell = S.formKind === 'sell';
  return `<section class="card" aria-label="${t('postTitle')}">
    <h2>${t('postTitle')}</h2>
    <div class="row">
      <button type="button" class="pill ${sell ? 'on' : ''}" data-act="kind" data-id="sell">${t('iHave')}</button>
      <button type="button" class="pill ${!sell ? 'on' : ''}" data-act="kind" data-id="buy">${t('iNeed')}</button>
    </div>
    <form data-form="post" class="stack">
      <div class="field"><span style="font-size:14px;font-weight:500">${t('postingTo')}</span>
        <div class="note info" style="font-weight:500">${esc(evLabel(e))}</div></div>
      <div class="row" style="align-items:flex-start">
        <div class="field" style="flex:2 1 220px"><label for="p-section">${t('fSection')}</label><input id="p-section" name="section" maxlength="80" placeholder="${t('phSection')}" required></div>
        <div class="field" style="flex:1 1 100px"><label for="p-qty">${t('fQty')}</label>
          <select id="p-qty" name="qty"><option>1</option><option>2</option><option>3</option><option>4</option></select></div>
      </div>
      <div class="row" style="align-items:flex-start">
        ${sell ? `<div class="field"><label for="p-original">${t('fOriginal')}</label><input id="p-original" name="original" inputmode="decimal" placeholder="${t('phOriginal')}" required></div>` : ''}
        <div class="field"><label for="p-price">${sell ? t('askSell') : t('askBuy')}</label><input id="p-price" name="price" inputmode="decimal" placeholder="0.00" required></div>
      </div>
      <div id="over-warning" class="note err hidden" role="alert">${t('over')}</div>
      <div class="row" style="align-items:flex-start">
        <div class="field"><label for="p-meet">${t('fMeet')}</label><input id="p-meet" name="meet" maxlength="80" placeholder="${t('phMeet')}" required></div>
        <div class="field"><label for="p-contact">${t('fHandle')}</label><input id="p-contact" name="contact" maxlength="60" placeholder="${t('phHandle')}" required></div>
      </div>
      <div class="row" style="align-items:flex-start;flex-wrap:nowrap;gap:10px">
        <input id="p-confirm" name="confirm" type="checkbox" required>
        <label for="p-confirm" style="font-weight:400;color:#344054">${sell ? t('confirmSell') : t('confirmBuy')}</label>
      </div>
      ${flashFor('post')}
      <button type="submit" class="primary" style="align-self:flex-start;min-height:48px;font-size:16px">${t('submit')}</button>
    </form>
  </section>`;
}

function footer() {
  const mail = CONTACT_EMAIL.startsWith('YOUR_') ? '' : ` · <a href="mailto:${esc(CONTACT_EMAIL)}">${t('contactUs')}</a>`;
  return `<footer><b style="color:#101828">${t('safetyTitle')}</b> ${t('safetyBody')}
    <p style="margin-top:8px"><a href="privacy.html">${t('privacy')}</a>${mail}</p></footer>`;
}

function render() {
  const app = document.getElementById('app');
  document.documentElement.lang = HTML_LANG[S.lang];
  document.title = t('brand');
  if (!CONFIGURED) {
    app.innerHTML = `<section class="card"><h1>Setup needed</h1><p>Open <code>config.js</code> and paste your Supabase URL and anon key. See README.md, step 3.</p></section>`;
    return;
  }
  app.innerHTML = header() + installBanner() + loginPanel() + searchSection() + `<div id="board"></div>` + footer();
  renderResults();
  renderBoard();
}

function renderBoard() {
  const board = document.getElementById('board');
  if (!board) return;
  const e = S.events.find((x) => x.id === S.selEv);
  if (!e) { board.innerHTML = S.eventsLoaded ? `<p class="muted">${t('selectEvent')}</p>` : ''; return; }
  // Keep whatever the user is typing in the post form across live refreshes.
  const form = board.querySelector('form[data-form="post"]');
  const saved = form ? Object.fromEntries(new FormData(form)) : null;
  board.innerHTML = `<div class="stack" style="gap:20px">${showDay(e)}${listingsSection()}${postSection(e)}</div>`;
  if (saved) {
    const f = board.querySelector('form[data-form="post"]');
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
const actions = {
  lang(id) { S.lang = Number(id); store.set('lang', S.lang); render(); },
  toggleLogin() { S.showLogin = !S.showLogin; S.flash = null; render(); if (S.showLogin) document.getElementById('login-email')?.focus(); },
  async logout() { await sb.auth.signOut(); },
  async install() { if (!S.installPrompt) return; S.installPrompt.prompt(); await S.installPrompt.userChoice; S.installPrompt = null; render(); },
  installLater() { S.installDismissed = true; store.set('installDismissed', true); render(); },
  pick(id) { S.flash = null; selectEvent(id); },
  openCreate() {
    S.flash = null;
    if (!S.user) { S.showLogin = true; flash('login', 'loginToCreate', 'info'); render(); return; }
    S.creating = true; render(); document.getElementById('new-venue')?.focus();
  },
  cancelCreate() { S.creating = false; S.flash = null; render(); },
  tab(id) { S.tab = id; renderBoard(); },
  kind(id) { S.formKind = id; S.flash = null; renderBoard(); },
  async share() {
    const link = location.origin + location.pathname + '?e=' + S.selEv;
    try { await navigator.clipboard.writeText(link); flash('share', 'copied', 'ok'); }
    catch (e) { S.flash = { area: 'share', text: link, kind: 'info' }; }
    renderBoard();
  },
  async contact(id) {
    if (S.contacts[id]) { delete S.contacts[id]; renderBoard(); return; }
    const { data, error } = await sb.from('listing_contacts').select('contact').eq('listing_id', id).maybeSingle();
    if (error || !data) { flash('list', 'errGeneric'); } else { S.contacts[id] = data.contact; S.flash = null; }
    renderBoard();
  },
  async report(id) {
    if (!S.user) { S.showLogin = true; render(); return; }
    const { error } = await sb.from('reports').insert({ listing_id: id });
    if (error && error.code !== '23505') { flash('list', 'errGeneric'); }
    else { S.reported[id] = true; store.set('reported', S.reported); }
    renderBoard();
  },
  block(uid) { if (!S.blocked.includes(uid)) S.blocked.push(uid); store.set('blocked', S.blocked); renderBoard(); },
  async advance(id) {
    const l = S.listings.find((x) => x.id === id); if (!l) return;
    const next = l.status === 'open' ? 'meeting' : 'done';
    const { error } = await sb.from('listings').update({ status: next }).eq('id', id);
    if (error) flash('list', 'errGeneric'); else l.status = next;
    renderBoard();
  },
  async del(id) {
    const { error } = await sb.from('listings').delete().eq('id', id);
    if (error) flash('list', 'errGeneric'); else S.listings = S.listings.filter((x) => x.id !== id);
    renderBoard();
  }
};

const forms = {
  async login(f) {
    const email = new FormData(f).get('email');
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname + (S.selEv ? '?e=' + S.selEv : '') } });
    if (error) flash('login', 'errGeneric'); else flash('login', 'linkSent', 'ok');
    render();
  },
  async create(f) {
    const d = new FormData(f);
    const row = { artist: String(d.get('artist')).trim(), venue: String(d.get('venue')).trim(), event_date: d.get('date') };
    if (!row.artist || !row.venue || !row.event_date) return;
    const { data, error } = await sb.from('events').insert(row).select('id, artist, venue, event_date, status, created_by').single();
    if (error) {
      flash('create', error.code === '23505' ? 'dupWarn' : /Too many/.test(error.message) ? 'errRate' : 'errGeneric', error.code === '23505' ? 'warn' : 'err');
      render(); return;
    }
    S.events.push(data);
    S.events.sort((a, b) => a.event_date.localeCompare(b.event_date));
    S.creating = false; S.q = '';
    flash('created', 'created', 'ok');
    selectEvent(data.id);
  },
  async post(f) {
    const d = new FormData(f);
    const sell = S.formKind === 'sell';
    const original = sell ? parseFloat(d.get('original')) : null;
    const price = parseFloat(d.get('price'));
    const section = String(d.get('section') || '').trim();
    const meet = String(d.get('meet') || '').trim();
    const contact = String(d.get('contact') || '').trim();
    if (!section || !meet || !contact || !(price > 0) || (sell && !(original > 0)) || d.get('confirm') !== 'on') { flash('post', 'fillAll'); renderBoard(); return; }
    if (sell && price > original) { checkOver(); return; }
    const { error } = await sb.rpc('create_listing', {
      p_event: S.selEv, p_kind: S.formKind, p_section: section, p_qty: Number(d.get('qty')),
      p_original: original, p_price: price, p_meet: meet, p_contact: contact
    });
    if (error) {
      flash('post', error.code === '23514' ? 'over' : /Too many/.test(error.message) ? 'errRate' : 'errGeneric');
      renderBoard(); return;
    }
    f.reset();
    flash('post', 'posted', 'ok');
    await loadListings();
    const board = document.getElementById('board');
    if (board) board.innerHTML = '';
    renderBoard();
  }
};

// ---------- Wiring ----------
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
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
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); S.installPrompt = e; render(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

async function start() {
  render();
  if (!CONFIGURED) return;
  const { data } = await sb.auth.getSession();
  S.user = data.session ? data.session.user : null;
  sb.auth.onAuthStateChange(async (_evt, session) => {
    const before = S.user && S.user.id;
    S.user = session ? session.user : null;
    if ((S.user && S.user.id) !== before) {
      S.showLogin = false; S.contacts = {};
      await loadEvents(); await loadListings(); render();
    }
  });
  await loadEvents();
  const wanted = new URLSearchParams(location.search).get('e') || store.get('lastEvent', null);
  const fromLink = wanted && S.events.find((e) => e.id === wanted);
  const tonight = S.events.find((e) => e.event_date === todayISO());
  const first = fromLink || tonight;
  if (first) await selectEvent(first.id); else render();
}
start();
