import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, CONTACT_EMAIL } from './config.js';

const CONFIGURED = SUPABASE_URL.startsWith('https://') && !SUPABASE_ANON_KEY.startsWith('YOUR_');
// Captured before the client reads the URL, so a password-reset link is recognised.
const RECOVERY = /type=recovery/.test(location.hash);
const sb = CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true } }) : null;

// ---------- Text: [English, 繁體中文, 한국어] ----------
const T = {
  brand: ['Show Day', 'Show Day', 'Show Day'],
  hero: ['Today’s show tickets at face value or less', '今日演出門票・原價或以下讓票', '오늘 공연 티켓을 원가 이하로 양도해요'],
  heroSub: ['Meet in person near the venue', '場館附近面交', '공연장 근처에서 직거래해요'],
  searchPh: ['Search artist or city', '搜尋藝人或城市', '아티스트 또는 도시 검색'],
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
  fArtist: ['Artist', '藝人', '아티스트'], fVenue: ['Venue (optional)', '場館（選填）', '공연장 (선택)'], fDate: ['Date', '日期', '날짜'],
  fCity: ['City', '城市', '도시'], phCity: ['London', '香港', '서울'], fCurrency: ['Ticket currency', '門票貨幣', '티켓 통화'],
  fDates: ['Dates', '日期', '날짜'], addDate: ['+ Add another date', '+ 加一個日期', '+ 날짜 추가'], removeDate: ['Remove date', '移除日期', '날짜 삭제'],
  datesN: ['{n} dates', '{n} 場', '{n}회'], datesLabel: ['Dates', '場次', '날짜'],
  someDup: ['Some dates already existed and were skipped.', '部分日期已存在，已略過。', '일부 날짜는 이미 있어서 건너뛰었어요.'],
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
  fOriginal: ['Face value ({c})', '原價（{c}）', '원가 ({c})'],
  askSell: ['Your price ({c})', '要價（{c}）', '희망 가격 ({c})'], askBuy: ['Max you pay ({c})', '最高願付（{c}）', '최대 지불 ({c})'],
  over: ['Above face value. Lower the price.', '高於原價，請調低價格。', '원가 초과. 가격을 낮춰 주세요.'],
  fMeet: ['Meeting point', '面交地點', '만날 장소'], fHandle: ['Your contact', '你的聯絡方式', '연락처'],
  phHandle: ['@instagram or WhatsApp', '@IG 或 WhatsApp', '@인스타그램 또는 WhatsApp'],
  confirmSell: ['I bought it myself, the price is face value or less, and I will transfer it through the official app.', '票是我自己買的，價格不高於原價，並會透過官方 App 轉讓。', '직접 구매했고 원가 이하이며 공식 앱으로 양도합니다.'],
  confirmBuy: ['I will not pay above face value, and only after the transfer.', '我不會付高於原價，並在轉讓後才付款。', '원가 이하로, 양도 후에만 결제합니다.'],
  submit: ['Post', '發佈', '올리기'], posted: ['Posted.', '已發佈。', '게시됨.'],
  fillAll: ['Fill in every field and tick the box.', '請填寫所有欄位並勾選。', '모든 항목을 입력하고 체크해 주세요.'],
  errGeneric: ['Something went wrong. Try again.', '出現問題，請再試。', '문제가 생겼어요. 다시 시도해 주세요.'],
  errRate: ['Too many posts. Try later.', '發佈太頻繁，請稍後再試。', '너무 많아요. 나중에 시도해 주세요.'],
  footRule: ['Face value only. Meet in person. Never pay in advance.', '只限原價。當面交易。切勿預付。', '원가 거래만. 직접 만나서. 선결제 금지.'],
  install: ['Add to Home Screen', '加入主畫面', '홈 화면에 추가'],
  iosHint: ['In Safari, tap Share, then Add to Home Screen.', '在 Safari 按「分享」，再選「加入主畫面」。', 'Safari에서 공유 → 홈 화면에 추가.'],
  navBoard: ['Board', '票板', '게시판'], navSwap: ['Seat swap', '換位', '좌석 교환'], navBuddies: ['Buddies', '同行', '동행'], navMerch: ['Merch', '周邊', '굿즈'], navMe: ['Me', '我的', '내 정보'],
  showDay: ['SHOW DAY', '今日演出', '오늘 공연'], availableN: ['{n} available', '{n} 張可交易', '거래 가능 {n}'],
  upcoming: ['Upcoming', '即將舉行', '예정'],
  approve: ['Approve concert', '批准演出', '공연 승인'], approvedMsg: ['Approved. Everyone can see it now.', '已批准，所有人都看得到。', '승인됨. 이제 모두에게 보여요.'],
  swapSub: ['Ticket for ticket. No money changes hands.', '以票換票，不涉及金錢。', '티켓끼리 교환. 돈은 오가지 않아요.'],
  swapCta: ['Offer a swap', '發佈換位', '교환 올리기'],
  fHave: ['Your ticket', '你的票', '내 티켓'], fWant: ['Ticket you want', '想換的票', '원하는 티켓'],
  phHave: ['Standing', '企位', '스탠딩'], phWant: ['Any seat, block 100s', '100 區任何座位', '100번대 구역 좌석'],
  confirmSwap: ['Both tickets have a similar face value. No money will change hands.', '兩張票原價相近，不涉及金錢。', '두 티켓의 원가가 비슷하고 돈은 오가지 않아요.'],
  hasLabel: ['Has', '有', '보유'], wantsLabel: ['Wants', '想換', '원함'],
  buddySub: ['Going solo? Find fans at the same show.', '一個人去？找同場的粉絲。', '혼자 가나요? 같은 공연 팬을 찾아요.'],
  buddyCta: ['I am going solo', '我一個人去', '혼자 가요'],
  fNote: ['A line about you', '介紹一下自己', '한 줄 소개'],
  phNote: ['First time at this venue, happy to queue together', '第一次來這個場館，想找人一起排隊', '이 공연장은 처음이에요. 같이 줄 서요'],
  merchSub: ['Swap or sell fan goods. No tickets here.', '交換或出售周邊，此區不可放票。', '굿즈 교환·판매. 티켓은 안 돼요.'],
  merchCta: ['Post an item', '發佈周邊', '굿즈 올리기'],
  forSwap: ['Swap', '交換', '교환'], forSale: ['For sale', '出售', '판매'],
  fTitle: ['Item', '物品', '물품'], phTitle: ['[MEMBER] photocard', '[成員] 小卡', '[멤버] 포토카드'],
  fDetails: ['Details (optional)', '詳情（選填）', '상세 (선택)'], phDetails: ['Condition, what you want in return', '狀況、想換什麼', '상태, 원하는 교환품'],
  fPrice: ['Price ({c})', '價格（{c}）', '가격 ({c})'], confirmMerch: ['This is not a ticket.', '這不是門票。', '티켓이 아니에요.'],
  markDone: ['Mark as done', '標記為完成', '완료로 표시'], doneLabel: ['Done', '已完成', '완료'],
  fEvent: ['Concert', '演出', '공연'], noUpcoming: ['Add the concert on the Board tab first.', '請先在「票板」新增演出。', '먼저 게시판에서 공연을 추가하세요.'],
  noPosts: ['Nothing yet.', '暫時沒有內容。', '아직 없어요.'],
  filterPh: ['Filter by artist or city', '按藝人或城市篩選', '아티스트 또는 도시로 필터'],
  filterMerchPh: ['Search items', '搜尋物品', '물품 검색'],
  myPosts: ['My posts', '我的貼文', '내 게시글'], adminPage: ['Admin page', '管理頁面', '관리자 페이지'],
  blockedN: ['{n} blocked users', '已封鎖 {n} 位用戶', '차단한 사용자 {n}명'], unblockAll: ['Unblock all', '全部解除封鎖', '모두 차단 해제'],
  changePw: ['Change password', '更改密碼', '비밀번호 변경'], loggedInAs: ['Logged in as', '已登入：', '로그인:'],
  typeListing: ['Ticket', '門票', '티켓'], typeSwap: ['Swap', '換位', '교환'], typeBuddy: ['Buddy', '同行', '동행'], typeMerch: ['Merch', '周邊', '굿즈'],
  needLoginMe: ['Log in to see your posts and settings.', '登入後查看你的貼文和設定。', '로그인하면 내 게시글과 설정을 볼 수 있어요.'],
  errSetup: ['This section is not set up yet.', '此功能尚未設定。', '아직 준비 중이에요.'],
  fDesc: ['Description (optional)', '描述（選填）', '설명 (선택)'],
  phDescTicket: ['e.g. Paper ticket, can meet before 6pm', '例如：實體票，6 點前可面交', '예: 종이 티켓, 6시 전 만남 가능'],
  phDescSwap: ['e.g. Row 3 near the stage, can meet at the gate', '例如：第 3 排近舞台，可在入口面交', '예: 무대 근처 3열, 입구에서 만남 가능'],
  fMerchEvent: ['Meet at a concert (optional)', '在演出現場面交（選填）', '공연장에서 거래 (선택)'],
  noConcert: ['Not for a specific concert', '不限演出', '특정 공연 아님'],
  otherItems: ['Other items', '其他物品', '다른 물품'],
  postsN: ['{n} posts', '{n} 則', '{n}개'],
  generalMerch: ['Merch not tied to a concert', '不限演出的周邊', '공연 무관 굿즈'],
  evSearchPh: ['Search in this concert', '在此演出中搜尋', '이 공연에서 검색'],
  generalSearchPh: ['Search items', '搜尋物品', '물품 검색'],
  deleteEvent: ['Delete concert', '刪除演出', '공연 삭제'],
  confirmDelete: ['Tap again to delete', '再按一次確認刪除', '한 번 더 눌러 삭제'],
  eventDeleted: ['Concert deleted.', '已刪除演出。', '공연이 삭제되었어요.'],
  postTo: ['Posting to', '發佈到', '게시 대상'],
  theme: ['Appearance', '外觀', '테마'],
  themeCute: ['Kawaii pink', '咕卡粉', '꾸카 핑크'], themeSimple: ['Simple', '簡約', '심플'], themeNight: ['Night', '夜晚', '나이트'],
  feedback: ['Feedback', '意見回饋', '의견 보내기'],
  feedbackTitle: ['Send feedback', '發送意見', '의견 보내기'],
  feedbackSub: ['Ideas, bugs or problems. Only the Show Day team can read this.', '建議、問題或錯誤，只有 Show Day 團隊看得到。', '아이디어, 버그, 문제 등. Show Day 팀만 볼 수 있어요.'],
  fMessage: ['Your message', '你的意見', '메시지'],
  fReply: ['Email for a reply (optional)', '回覆電郵（選填）', '답장 받을 이메일 (선택)'],
  sendFeedback: ['Send', '發送', '보내기'],
  feedbackSent: ['Thank you. Your feedback was sent.', '謝謝，你的意見已送出。', '감사해요. 의견이 전송되었어요.'],
  feedbackShort: ['Please write a little more.', '請多寫一點。', '조금 더 적어 주세요.'],
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
const fmtMoney = (n, cur = 'GBP') => {
  const v = Number(n);
  try { return new Intl.NumberFormat(LOCALES[S.lang], { style: 'currency', currency: cur, maximumFractionDigits: v % 1 ? 2 : 0 }).format(v); }
  catch (e) { return cur + ' ' + v; }
};
const curSym = (cur = 'GBP') => {
  try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur }).formatToParts(0).find((p) => p.type === 'currency').value; }
  catch (e) { return cur; }
};
const CURRENCIES = ['GBP', 'HKD', 'KRW', 'JPY', 'TWD', 'SGD', 'MYR', 'THB', 'USD', 'EUR', 'AUD'];
const place = (e) => {
  if (!e) return '';
  const v = (e.venue || '').trim(), c = (e.city || '').trim();
  return v && c && v.toLowerCase() !== c.toLowerCase() ? `${v}, ${c}` : (c || v);
};
const showKey = (e) => [e.artist, e.city || '', e.venue || ''].map((x) => x.trim().toLowerCase()).join('|');
const shortDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(LOCALES[S.lang], { day: 'numeric', month: 'short' });
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
  board: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/></svg>',
  swap: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h13l-3-3M17 17H4l3 3"/></svg>',
  buddies: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 5 5"/></svg>',
  merch: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
  me: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  palette: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.9 1.2-1.8-.5-1-.1-2.2 1.1-2.2H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7.2" r="1.2"/><circle cx="14.5" cy="7.2" r="1.2"/></svg>',
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
  channel: null,
  view: 'board',
  isAdmin: false,
  counts: {},
  items: { swap: null, buddy: null, merch: null },
  mine: null,
  composing: false,
  merchKind: 'swap',
  postQ: '',
  newDates: 1,
  feedbackOpen: false,
  v5: false,
  theme: ['cute', 'simple', 'night'].includes(store.get('theme', 'cute')) ? store.get('theme', 'cute') : 'cute',
  evQ: '',
  armDel: null,
  draft: null
};
function guessLang() {
  const l = (navigator.language || 'en').toLowerCase();
  return l.startsWith('zh') ? 1 : l.startsWith('ko') ? 2 : 0;
}
const flash = (area, key, kind = 'err') => { S.flash = { area, text: t(key), kind }; };
const flashFor = (area) => S.flash && S.flash.area === area
  ? `<p class="note ${S.flash.kind}" role="${S.flash.kind === 'err' ? 'alert' : 'status'}">${esc(S.flash.text)}</p>` : '';

// ---------- Theme ----------
const THEMES = { cute: { key: 'themeCute', color: '#FFB3D1' }, simple: { key: 'themeSimple', color: '#FFFFFF' }, night: { key: 'themeNight', color: '#14101C' } };
function applyTheme() {
  document.documentElement.dataset.theme = S.theme;
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', THEMES[S.theme].color);
}
function themePicker() {
  return `<section class="stack" style="gap:8px" aria-label="${t('theme')}">
    <h2 class="list-title" style="margin-top:8px">${t('theme')}</h2>
    <div class="theme-pick" role="group" aria-label="${t('theme')}">${Object.keys(THEMES).map((k) =>
      `<button type="button" class="${S.theme === k ? 'on' : ''}" aria-pressed="${S.theme === k}" data-act="setTheme" data-id="${k}"><span class="swatch ${k}" aria-hidden="true"></span>${t(THEMES[k].key)}</button>`).join('')}</div>
  </section>`;
}

// ---------- Data ----------
async function loadEvents() {
  const { data, error } = await sb.from('events')
    .select('id, artist, city, venue, currency, event_date, status, created_by')
    .gte('event_date', todayISO())
    .order('event_date', { ascending: true })
    .limit(300);
  if (!error) S.events = data;
  S.eventsLoaded = true;
}
async function loadListings() {
  if (!S.selEv) return;
  const { data, error } = await sb.from('listings')
    .select('id, event_id, user_id, kind, section, qty, original_price, price, meet_point, status, hidden, created_at' + (S.v5 ? ', note' : ''))
    .eq('event_id', S.selEv)
    .order('created_at', { ascending: false })
    .limit(200);
  if (!error) S.listings = data.filter((l) => !l.hidden || (S.user && l.user_id === S.user.id));
  S.listingsLoaded = true;
}
const TABLE = { swap: 'swaps', buddy: 'buddies', merch: 'merch' };
const EV_EMBED = 'events(artist, city, venue, event_date, currency)';
const ITEM_COLS = {
  get swap() { return `id, event_id, user_id, have, want, status, hidden, created_at, ${S.v5 ? 'note, ' : ''}${EV_EMBED}`; },
  get buddy() { return `id, event_id, user_id, note, hidden, created_at, ${EV_EMBED}`; },
  get merch() { return `id, user_id, kind, title, details, price, status, hidden, created_at${S.v5 ? ', event_id, ' + EV_EMBED : ''}`; }
};
async function detectV5() {
  const { error } = await sb.from('listings').select('note').limit(1);
  S.v5 = !error;
}
async function loadCounts() {
  const ids = S.events.filter((e) => e.event_date === todayISO()).map((e) => e.id);
  S.counts = {};
  if (!ids.length) return;
  const { data, error } = await sb.from('listings').select('event_id').in('event_id', ids).eq('status', 'open');
  if (!error) data.forEach((r) => { S.counts[r.event_id] = (S.counts[r.event_id] || 0) + 1; });
}
async function loadItems(type) {
  const { data, error } = await sb.from(TABLE[type]).select(ITEM_COLS[type]).order('created_at', { ascending: false }).limit(200);
  if (error) { S.items[type] = { error: true }; return; }
  const today = todayISO();
  S.items[type] = data.filter((x) => (!x.hidden || (S.user && x.user_id === S.user.id))
    && (type === 'merch' || (x.events && x.events.event_date >= today)));
  if (type !== 'merch') S.items[type].sort((a, b) => a.events.event_date.localeCompare(b.events.event_date));
}
async function loadMine() {
  if (!S.user) { S.mine = null; return; }
  const uid = S.user.id;
  const [l, sw, bu, me] = await Promise.all([
    sb.from('listings').select('id, kind, section, price, status, created_at, events(artist, city, venue, event_date, currency)').eq('user_id', uid).order('created_at', { ascending: false }),
    sb.from('swaps').select(ITEM_COLS.swap).eq('user_id', uid).order('created_at', { ascending: false }),
    sb.from('buddies').select(ITEM_COLS.buddy).eq('user_id', uid).order('created_at', { ascending: false }),
    sb.from('merch').select(ITEM_COLS.merch).eq('user_id', uid).order('created_at', { ascending: false })
  ]);
  S.mine = [
    ...(l.data || []).map((x) => ({ type: 'listing', ...x })),
    ...(sw.data || []).map((x) => ({ type: 'swap', ...x })),
    ...(bu.data || []).map((x) => ({ type: 'buddy', ...x })),
    ...(me.data || []).map((x) => ({ type: 'merch', ...x }))
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
async function checkAdmin() {
  if (!S.user) { S.isAdmin = false; return; }
  const { data } = await sb.rpc('is_admin');
  S.isAdmin = data === true;
}
async function setView(v, push = true) {
  if (v === 'board') { S.view = 'board'; goHome(push); return; }
  S.view = v; S.selEv = null; S.composing = false; S.flash = null; S.postQ = '';
  if (S.channel) { sb.removeChannel(S.channel); S.channel = null; }
  if (push) history.pushState({ v }, '', location.pathname + '?v=' + v);
  render(); window.scrollTo(0, 0);
  if (v === 'me') await loadMine(); else await loadItems(v);
  renderMain();
}
function subscribe() {
  if (S.channel) { sb.removeChannel(S.channel); S.channel = null; }
  if (!S.selEv) return;
  S.channel = sb.channel('listings-' + S.selEv)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'listings', filter: 'event_id=eq.' + S.selEv },
      async () => { await loadListings(); renderMain(); })
    .subscribe();
}
const urlFor = (view, id) => location.pathname + (view === 'board' ? (id ? '?e=' + id : '') : '?v=' + view + (id ? '&e=' + id : ''));
async function openEvent(id, push = true, view) {
  if (view) S.view = view;
  if (S.view === 'me') S.view = 'board';
  S.selEv = id; S.contacts = {}; S.evQ = ''; S.armDel = null;
  S.tab = 'all'; S.posting = false; S.creating = false; S.composing = false;
  if (push) history.pushState({ ev: id, v: S.view }, '', urlFor(S.view, id));
  if (S.view === 'board') {
    S.listings = []; S.listingsLoaded = false;
    render(); window.scrollTo(0, 0);
    await loadListings(); subscribe(); renderMain();
    return;
  }
  if (S.channel) { sb.removeChannel(S.channel); S.channel = null; }
  render(); window.scrollTo(0, 0);
  if (!Array.isArray(S.items[S.view])) { await loadItems(S.view); renderMain(); }
}
function tabHome(push = true) { if (S.view === 'board' || S.view === 'me') return goHome(push); return setView(S.view, push); }
function goHome(push = true) {
  S.view = 'board';
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
      <button type="button" class="icon-btn" data-act="cycleTheme" aria-label="${t('theme')}: ${t(THEMES[S.theme].key)}" title="${t('theme')}: ${t(THEMES[S.theme].key)}">${icon.palette}</button>
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
      <div class="grid2">
        <div class="field"><label for="new-artist">${t('fArtist')}</label><input id="new-artist" name="artist" maxlength="80" required value="${esc(S.draft ? S.draft.artist : S.q)}"></div>
        <div class="field"><label for="new-city">${t('fCity')}</label><input id="new-city" name="city" maxlength="60" placeholder="${t('phCity')}" required value="${esc(S.draft ? S.draft.city : '')}"></div>
      </div>
      <div class="grid2">
        <div class="field"><label for="new-venue">${t('fVenue')}</label><input id="new-venue" name="venue" maxlength="80" value="${esc(S.draft ? S.draft.venue : '')}"></div>
        <div class="field"><label for="new-cur">${t('fCurrency')}</label><select id="new-cur" name="currency">${CURRENCIES.map((c) => `<option value="${c}" ${(S.draft ? S.draft.currency : 'GBP') === c ? 'selected' : ''}>${c} (${esc(curSym(c))})</option>`).join('')}</select></div>
      </div>
      <fieldset class="dates-field"><legend>${t('fDates')}</legend>
        ${Array.from({ length: S.newDates }, (_, i) => `<div class="row tight"><input name="date" type="date" min="${todayISO()}" aria-label="${t('fDate')} ${i + 1}" ${i === 0 ? 'required' : ''} value="${esc(S.draft && S.draft.dates[i] ? S.draft.dates[i] : '')}">${i > 0 ? `<button type="button" class="icon-btn" data-act="removeDate" data-id="${i}" aria-label="${t('removeDate')}">✕</button>` : ''}</div>`).join('')}
        ${S.newDates < 7 ? `<button type="button" class="text" style="align-self:flex-start" data-act="addDate">${t('addDate')}</button>` : ''}
      </fieldset>
      ${flashFor('create')}
      <div class="row"><button type="submit" class="primary">${t('createBtn')}</button><button type="button" class="text" data-act="cancelCreate">${t('cancel')}</button></div>
    </form>`
    : `<button type="button" class="text" data-act="openCreate">+ ${t('addMissing')}</button>`;
  const heads = { swap: ['navSwap', 'swapSub'], buddy: ['navBuddies', 'buddySub'], merch: ['navMerch', 'merchSub'] }[S.view];
  return `<section class="hero">
      <h1>${heads ? t(heads[0]) : t('hero')}</h1><p class="sub muted">${heads ? t(heads[1]) : t('heroSub')}</p>
      <div class="searchbox">${icon.search}<input id="q" type="search" aria-label="${t('searchPh')}" placeholder="${t('searchPh')}" value="${esc(S.q)}" autocomplete="off"></div>
    </section>
    <div id="results" class="list"></div>
    ${create}`;
}

function groupShows(list) {
  const map = new Map();
  list.forEach((e) => { const k = showKey(e); if (!map.has(k)) map.set(k, []); map.get(k).push(e); });
  return [...map.values()].map((g) => g.sort((a, b) => a.event_date.localeCompare(b.event_date)));
}

function itemsFor(type, evId) {
  const d = S.items[type];
  if (!Array.isArray(d)) return [];
  return d.filter((x) => (evId === 'general' ? !x.event_id : x.event_id === evId)
    && (!S.blocked.includes(x.user_id) || (S.user && x.user_id === S.user.id)));
}
function countFor(e) { return S.view === 'board' ? (S.counts[e.id] || 0) : itemsFor(S.view, e.id).filter((x) => x.status !== 'done').length; }
function countLabel(n) { return S.view === 'board' ? t('availableN', { n }) : t('postsN', { n }); }

function showRow(g) {
  const e = g[0];
  const pending = g.some((x) => x.status === 'pending');
  const when = g.length === 1 ? fmtDate(e.event_date)
    : `${t('datesN', { n: g.length })} · ${shortDate(e.event_date)} – ${shortDate(g[g.length - 1].event_date)}`;
  const n = S.view === 'board' ? 0 : g.reduce((a, x) => a + countFor(x), 0);
  return `<button type="button" class="item" data-act="pick" data-id="${e.id}">
      <span class="item-main"><b>${esc(e.artist)}</b><span class="muted">${esc(place(e))} · ${esc(when)}${pending ? ` · <span class="warn-text">${t('pendingReview')}</span>` : ''}</span></span>
      ${n ? `<span class="count-pill">${esc(countLabel(n))}</span>` : ''}${icon.chev}
    </button>`;
}

function renderResults() {
  const box = document.getElementById('results');
  if (!box) return;
  if (!S.eventsLoaded) { box.innerHTML = `<p class="muted">${t('loading')}</p>`; return; }
  const q = S.q.trim().toLowerCase();
  const matches = S.events.filter((e) => !q || [e.artist, e.city, e.venue, e.event_date].join(' ').toLowerCase().includes(q));
  if (!matches.length && !(S.view === 'merch' && !q)) {
    box.innerHTML = `<p class="muted">${q ? esc(t('noResults', { q: S.q.trim() })) : t('noEvents')}</p>`;
    return;
  }
  if (q) { box.innerHTML = groupShows(matches).slice(0, 30).map(showRow).join(''); return; }
  const today = todayISO();
  const tonight = matches.filter((e) => e.event_date === today);
  const later = matches.filter((e) => e.event_date !== today);
  const sd = tonight.length ? `<section class="showday" aria-label="${t('showDay')}">
      <p class="live">● ${t('showDay')}</p>
      ${tonight.map((e) => `<button type="button" class="sd-item" data-act="pick" data-id="${e.id}">
        <span class="item-main"><b>${esc(e.artist)}</b><span>${esc(place(e))}${e.status === 'pending' ? ` · ${t('pendingReview')}` : ''}</span></span>
        <span class="sd-count">${esc(countLabel(countFor(e)))}</span>
      </button>`).join('')}
    </section>` : '';
  const general = S.view === 'merch' ? `<h2 class="list-title">${t('generalMerch')}</h2>
    <button type="button" class="item" data-act="pick" data-id="general"><span class="item-main"><b>${t('generalMerch')}</b></span>
      ${itemsFor('merch', 'general').length ? `<span class="count-pill">${esc(t('postsN', { n: itemsFor('merch', 'general').length }))}</span>` : ''}${icon.chev}</button>` : '';
  box.innerHTML = sd + (later.length ? `<h2 class="list-title">${t('upcoming')}</h2>` + groupShows(later).slice(0, 30).map(showRow).join('') : '') + general;
}

function visibleListings() {
  return S.listings.filter((l) => !S.blocked.includes(l.user_id) || (S.user && l.user_id === S.user.id));
}

function dateChips(e) {
  const sib = S.events.filter((x) => showKey(x) === showKey(e)).sort((a, b) => a.event_date.localeCompare(b.event_date));
  if (sib.length < 2) return '';
  return `<div class="dates" role="group" aria-label="${t('datesLabel')}">${sib.map((x) =>
    `<button type="button" class="${x.id === e.id ? 'on' : ''}" aria-pressed="${x.id === e.id}" data-act="day" data-id="${x.id}">${esc(fmtDate(x.event_date))}</button>`).join('')}</div>`;
}

function eventHead(e, stats) {
  const tonight = e.event_date === todayISO();
  const admin = S.isAdmin && e.status === 'pending' ? `<div class="row">
      <button type="button" class="primary" data-act="approveEvent">${t('approve')}</button>
      <button type="button" class="${tonight ? 'ghost-light' : 'outline'} danger" data-act="deleteEvent">${S.armDel === e.id ? t('confirmDelete') : t('deleteEvent')}</button>
    </div>` : '';
  return `<div class="row between">
      <button type="button" class="text back" data-act="back">${icon.back}${t('back')}</button>
      <button type="button" class="icon-btn" data-act="share" aria-label="${t('copyLink')}" title="${t('copyLink')}">${icon.link}</button>
    </div>
    <section class="event-head ${tonight ? 'showday' : ''}">
      ${tonight ? `<p class="live">● ${t('showDay')}</p>` : ''}
      <h1>${esc(e.artist)}</h1>
      <p class="sub">${esc(place(e))} · ${esc(fmtDate(e.event_date))}${e.status === 'pending' ? ` · <span class="warn-text">${t('pendingReview')}</span>` : ''}</p>
      ${dateChips(e)}
      <p class="small sub">${esc(stats)}</p>
      ${admin}
      ${flashFor('share')}
    </section>`;
}

function evSearch(ph) {
  return `<div class="searchbox small-search">${icon.search}<input id="evq" type="search" aria-label="${ph}" placeholder="${ph}" value="${esc(S.evQ)}" autocomplete="off"></div>`;
}

function boardList() {
  const q = S.evQ.trim().toLowerCase();
  const shown = visibleListings().filter((l) => (S.tab === 'all' || l.kind === S.tab)
    && (!q || [l.section, l.note, l.meet_point].join(' ').toLowerCase().includes(q)));
  return !S.listingsLoaded ? `<p class="muted">${t('loading')}</p>`
    : shown.length ? shown.map(listingCard).join('') : `<p class="muted empty">${q ? esc(t('noResults', { q: S.evQ.trim() })) : t('empty')}</p>`;
}

function itemList(type) {
  const d = S.items[type];
  if (d === null) return `<p class="muted">${t('loading')}</p>`;
  if (d && d.error) return `<p class="muted empty">${t('errSetup')}</p>`;
  const q = S.evQ.trim().toLowerCase();
  const shown = itemsFor(type, S.selEv).filter((x) => !q
    || [x.have, x.want, x.note, x.title, x.details].filter(Boolean).join(' ').toLowerCase().includes(q));
  return shown.length ? shown.map((x) => itemCard(type, x, true)).join('')
    : `<p class="muted empty">${q ? esc(t('noResults', { q: S.evQ.trim() })) : t('noPosts')}</p>`;
}

function itemsEventView(type, e) {
  const cta = { swap: 'swapCta', buddy: 'buddyCta', merch: 'merchCta' }[type];
  const n = itemsFor(type, S.selEv).filter((x) => x.status !== 'done').length;
  const head = e === 'general'
    ? `<div class="row between"><button type="button" class="text back" data-act="back">${icon.back}${t('back')}</button></div>
       <section class="event-head"><h1>${t('generalMerch')}</h1><p class="sub">${t('merchSub')}</p></section>`
    : eventHead(e, t('postsN', { n }));
  return `${head}
    ${evSearch(e === 'general' ? t('generalSearchPh') : t('evSearchPh'))}
    ${flashFor('list')}
    <div class="list" id="evlist">${itemList(type)}</div>
    ${S.composing ? composer(type) : `<div class="cta-bar">${flashFor('posted')}<button type="button" class="primary big" data-act="openCompose">${t(cta)}</button></div>`}`;
}

function eventView(e) {
  const vis = visibleListings();
  const c = (s) => vis.filter((l) => l.status === s).length;
  const seg = (k, label) => `<button type="button" class="${S.tab === k ? 'on' : ''}" aria-pressed="${S.tab === k}" data-act="tab" data-id="${k}">${label}</button>`;
  return `${eventHead(e, t('statsLine', { a: c('open'), m: c('meeting'), d: c('done') }))}
    ${evSearch(t('evSearchPh'))}
    <div class="seg" role="group">${seg('all', t('all'))}${seg('sell', t('has'))}${seg('buy', t('needs'))}</div>
    ${flashFor('list')}
    <div class="list" id="evlist">${boardList()}</div>
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
        <h3>${esc(l.section)}</h3>${l.note ? `<p class="desc">${esc(l.note)}</p>` : ''}
        <p class="muted small">${esc(t(n === '1' ? 'qty1' : 'qtyN', { n }))} · ${esc(l.meet_point)} · ${esc(ago(l.created_at))}</p>
      </div>
      <div class="price">${sell ? '' : `<span class="small muted">${t('upTo')} </span>`}${fmtMoney(l.price, (S.events.find((x) => x.id === l.event_id) || {}).currency)}</div>
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
      ${sell ? `<div class="field"><label for="p-original">${t('fOriginal', { c: curSym(e.currency) })}</label><input id="p-original" name="original" inputmode="decimal" required></div>` : ''}
      <div class="field"><label for="p-price">${t(sell ? 'askSell' : 'askBuy', { c: curSym(e.currency) })}</label><input id="p-price" name="price" inputmode="decimal" required></div>
    </div>
    <p id="over-warning" class="note err hidden" role="alert">${t('over')}</p>
    <div class="grid2">
      <div class="field"><label for="p-meet">${t('fMeet')}</label><input id="p-meet" name="meet" maxlength="80" required></div>
      <div class="field"><label for="p-contact">${t('fHandle')}</label><input id="p-contact" name="contact" maxlength="60" placeholder="${t('phHandle')}" required></div>
    </div>
    ${S.v5 ? `<div class="field"><label for="p-note">${t('fDesc')}</label><textarea id="p-note" name="note" rows="2" maxlength="200" placeholder="${t('phDescTicket')}"></textarea></div>` : ''}
    <div class="check"><input id="p-confirm" name="confirm" type="checkbox" required><label for="p-confirm">${sell ? t('confirmSell') : t('confirmBuy')}</label></div>
    ${flashFor('post')}
    <button type="submit" class="primary big">${t('submit')}</button>
  </form>`;
}

function tabBar() {
  const tabs = [['board', 'navBoard'], ['swap', 'navSwap'], ['buddy', 'navBuddies'], ['merch', 'navMerch'], ['me', 'navMe']];
  const ic = { board: icon.board, swap: icon.swap, buddy: icon.buddies, merch: icon.merch, me: icon.me };
  return `<nav class="tabbar" aria-label="Sections">${tabs.map(([v, k]) =>
    `<button type="button" data-act="nav" data-id="${v}" ${S.view === v ? 'aria-current="page" class="on"' : ''}>${ic[v]}<span>${t(k)}</span></button>`).join('')}</nav>`;
}

function evName(ev) { return ev ? `${ev.artist} · ${place(ev)} · ${fmtDate(ev.event_date)}` : ''; }

function itemCard(type, it, inEvent) {
  const mine = S.user && it.user_id === S.user.id;
  const key = type + ':' + it.id;
  const contact = S.contacts[key];
  const done = it.status === 'done';
  let body = '';
  if (type === 'swap') {
    body = `${inEvent ? '' : `<p class="muted small">${esc(evName(it.events))}</p>`}
      <div class="swap-row"><div><span class="small muted">${t('hasLabel')}</span><b>${esc(it.have)}</b></div>${icon.swap}<div><span class="small muted">${t('wantsLabel')}</span><b>${esc(it.want)}</b></div></div>
      ${it.note ? `<p class="desc">${esc(it.note)}</p>` : ''}`;
  } else if (type === 'buddy') {
    body = `${inEvent ? '' : `<p class="muted small">${esc(evName(it.events))}</p>`}<p>${esc(it.note)}</p>`;
  } else {
    body = `<div class="listing-top"><div class="listing-info">
        <div class="row tight"><span class="chip ${it.kind === 'swap' ? 'buy' : 'sell'}">${it.kind === 'swap' ? t('forSwap') : t('forSale')}</span></div>
        <h3>${esc(it.title)}</h3>${it.details ? `<p class="desc">${esc(it.details)}</p>` : ''}${it.events && !inEvent ? `<p class="muted small">${esc(evName(it.events))}</p>` : ''}</div>
        ${it.kind === 'sale' && it.price != null ? `<div class="price">${fmtMoney(it.price)}</div>` : ''}</div>`;
  }
  let main = '', menu = '';
  if (mine) {
    if (type !== 'buddy' && !done) main = `<button type="button" class="outline" data-act="itemDone" data-id="${key}">${t('markDone')}</button>`;
    menu = `<button type="button" class="menu-item danger" data-act="itemDel" data-id="${key}">${t('del')}</button>`;
  } else {
    main = S.user
      ? `<button type="button" class="outline" data-act="itemContact" data-id="${key}" aria-expanded="${!!contact}">${contact ? t('hide') : t('contact')}</button>`
      : `<button type="button" class="outline" data-act="toggleLogin">${t('contact')}</button>`;
    menu = `<button type="button" class="menu-item" data-act="itemReport" data-id="${key}" ${S.reported[key] ? 'disabled' : ''}>${S.reported[key] ? t('reported') : t('report')}</button>`
      + (S.user ? `<button type="button" class="menu-item danger" data-act="block" data-id="${it.user_id}">${t('block')}</button>` : '');
  }
  return `<article class="listing ${done ? 'is-done' : ''}">
    ${mine || done ? `<div class="row tight">${done ? `<span class="chip done">${t('doneLabel')}</span>` : ''}${mine ? `<span class="chip mine">${t('yours')}</span>` : ''}</div>` : ''}
    ${body}
    <div class="row">${main}<details class="menu"><summary aria-label="${t('more')}" title="${t('more')}">${icon.dots}</summary><div class="menu-pop">${menu}</div></details></div>
    ${contact ? `<p class="note info"><b>${esc(contact)}</b>${type === 'merch' ? `<br>${t('footRule')}` : ''}</p>` : ''}
    <p class="small muted">${esc(ago(it.created_at))}</p>
  </article>`;
}

function eventOptions(noPreselect) {
  const today = todayISO();
  const list = S.events.filter((e) => e.event_date >= today);
  return list.map((e) => `<option value="${e.id}" ${!noPreselect && e.id === S.selEvForm ? 'selected' : ''}>${esc(e.artist)} · ${esc(place(e))} · ${esc(fmtDate(e.event_date))}</option>`).join('');
}

function composer(type) {
  const ev = S.events.find((x) => x.id === S.selEv);
  const pickEv = ev ? `<div class="field"><span style="font-size:14px;font-weight:500">${t('postTo')}</span><div class="note info">${esc(evName(ev))}</div>
      <input type="hidden" name="${type === 'merch' ? 'mevent' : 'event'}" value="${ev.id}"></div>` : '';
  let fields = '', confirm = '';
  if (type === 'swap') {
    fields = `<div class="grid2">
      <div class="field"><label for="c-have">${t('fHave')}</label><input id="c-have" name="have" maxlength="80" placeholder="${t('phHave')}" required></div>
      <div class="field"><label for="c-want">${t('fWant')}</label><input id="c-want" name="want" maxlength="80" placeholder="${t('phWant')}" required></div></div>
      ${S.v5 ? `<div class="field"><label for="c-desc">${t('fDesc')}</label><textarea id="c-desc" name="desc" rows="2" maxlength="200" placeholder="${t('phDescSwap')}"></textarea></div>` : ''}`;
    confirm = t('confirmSwap');
  } else if (type === 'buddy') {
    fields = `<div class="field"><label for="c-note">${t('fNote')}</label><input id="c-note" name="note" maxlength="140" placeholder="${t('phNote')}" required></div>`;
  } else {
    const sale = S.merchKind === 'sale';
    fields = `<div class="seg" role="group">
        <button type="button" class="${!sale ? 'on' : ''}" aria-pressed="${!sale}" data-act="merchKind" data-id="swap">${t('forSwap')}</button>
        <button type="button" class="${sale ? 'on' : ''}" aria-pressed="${sale}" data-act="merchKind" data-id="sale">${t('forSale')}</button></div>
      <div class="grid2">
        <div class="field"><label for="c-title">${t('fTitle')}</label><input id="c-title" name="title" maxlength="80" placeholder="${t('phTitle')}" required></div>
        ${sale ? `<div class="field"><label for="c-price">${t('fPrice', { c: curSym('GBP') })}</label><input id="c-price" name="price" inputmode="decimal" required></div>` : ''}</div>
      <div class="field"><label for="c-details">${t('fDetails')}</label><textarea id="c-details" name="details" rows="2" maxlength="200" placeholder="${t('phDetails')}"></textarea></div>
`;
    confirm = t('confirmMerch');
  }
  const cta = { swap: 'swapCta', buddy: 'buddyCta', merch: 'merchCta' }[type];
  return `<form data-form="item" data-type="${type}" class="panel" aria-label="${t(cta)}">
    <div class="row between"><h2>${t(cta)}</h2><button type="button" class="text" data-act="closeCompose">${t('cancel')}</button></div>
    ${pickEv}${fields}
    <div class="field"><label for="c-contact">${t('fHandle')}</label><input id="c-contact" name="contact" maxlength="60" placeholder="${t('phHandle')}" required></div>
    ${confirm ? `<div class="check"><input id="c-confirm" name="confirm" type="checkbox" required><label for="c-confirm">${confirm}</label></div>` : ''}
    ${flashFor('compose')}
    <button type="submit" class="primary big">${t('submit')}</button>
  </form>`;
}

function feedbackBox() {
  return `<details class="panel collapse" id="feedback" ${S.feedbackOpen ? 'open' : ''}><summary>${t('feedbackTitle')}</summary>
    <form data-form="feedback" class="stack" style="gap:12px;margin-top:12px">
      <p class="small muted">${t('feedbackSub')}</p>
      <label for="fb-msg" class="sr-only">${t('fMessage')}</label>
      <textarea id="fb-msg" name="message" rows="4" maxlength="1000" placeholder="${t('fMessage')}" required></textarea>
      ${S.user ? '' : `<input name="reply" type="email" maxlength="120" autocomplete="email" placeholder="${t('fReply')}" aria-label="${t('fReply')}">`}
      ${flashFor('feedback')}
      <button type="submit" class="primary">${t('sendFeedback')}</button>
    </form>
  </details>`;
}

function meView() {
  if (!S.user) {
    return `<section class="event-head"><h1>${t('navMe')}</h1><p class="sub">${t('needLoginMe')}</p></section>
      <button type="button" class="primary big" data-act="toggleLogin">${t('login')}</button>
      ${themePicker()}
      ${feedbackBox()}`;
  }
  const typeLabel = { listing: 'typeListing', swap: 'typeSwap', buddy: 'typeBuddy', merch: 'typeMerch' };
  const describe = (x) => x.type === 'listing' ? `${x.section} · ${fmtMoney(x.price, x.events && x.events.currency)}`
    : x.type === 'swap' ? `${x.have} → ${x.want}` : x.type === 'buddy' ? x.note : x.title;
  const posts = S.mine === null ? `<p class="muted">${t('loading')}</p>`
    : S.mine.length ? S.mine.map((x) => `<div class="mine-row">
        <div class="item-main"><span class="small muted">${t(typeLabel[x.type])}${x.events ? ' · ' + esc(evName(x.events)) : ''}</span><b>${esc(describe(x))}</b>
          ${x.hidden ? `<span class="small warn-text">${t('reported')}</span>` : ''}</div>
        <button type="button" class="text danger" data-act="mineDel" data-id="${x.type}:${x.id}">${t('del')}</button>
      </div>`).join('') : `<p class="muted">${t('noPosts')}</p>`;
  return `<section class="event-head"><h1>${t('navMe')}</h1><p class="sub">${t('loggedInAs')} ${esc(S.user.email)}</p></section>
    ${flashFor('me')}
    ${S.isAdmin ? `<a class="outline-link" href="admin.html">${t('adminPage')}</a>` : ''}
    <h2 class="list-title">${t('myPosts')}</h2>
    <div class="list">${posts}</div>
    <details class="panel collapse"><summary>${t('changePw')}</summary>
      <form data-form="changepw" class="stack" style="gap:12px;margin-top:12px">
        <input name="password" type="password" autocomplete="new-password" minlength="8" placeholder="${t('pwHint')}" aria-label="${t('password')}" required>
        <button type="submit" class="primary">${t('savePw')}</button>
      </form>
    </details>
    ${themePicker()}
    ${feedbackBox()}
    ${S.blocked.length ? `<div class="row between"><span class="muted">${esc(t('blockedN', { n: S.blocked.length }))}</span><button type="button" class="text" data-act="unblockAll">${t('unblockAll')}</button></div>` : ''}
    <button type="button" class="outline" data-act="logout">${t('logout')}</button>`;
}

function footer() {
  const mail = CONTACT_EMAIL.startsWith('YOUR_') ? '' : `<a href="mailto:${esc(CONTACT_EMAIL)}">${t('contactUs')}</a>`;
  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const install = standalone ? '' : S.installPrompt ? `<button type="button" class="text small" data-act="install">${t('install')}</button>`
    : isIOS ? `<span>${t('iosHint')}</span>` : '';
  return `<footer>
    <p>${t('footRule')}</p>
    <p class="row tight">${install}<button type="button" class="text small" data-act="openFeedback">${t('feedback')}</button><a href="privacy.html">${t('privacy')}</a>${mail}</p>
  </footer>`;
}

function render() {
  const app = document.getElementById('app');
  document.documentElement.lang = HTML_LANG[S.lang];
  applyTheme();
  if (!CONFIGURED) {
    app.innerHTML = `<section class="panel"><h1>Setup needed</h1><p>Open <code>config.js</code> and paste your Supabase URL and key. See README.md, step 3.</p></section>`;
    return;
  }
  const e = S.events.find((x) => x.id === S.selEv);
  document.title = e ? `${e.artist} · ${t('brand')}` : `${t('brand')} · ${t('hero')}`;
  document.body.dataset.view = S.view;
  app.innerHTML = topBar() + loginPanel() + flashFor('top') + `<div id="main" class="stack"></div>` + footer() + tabBar();
  renderMain();
}

function renderMain() {
  const main = document.getElementById('main');
  if (!main) return;
  if (S.view === 'me') { main.innerHTML = meView(); return; }
  const e = S.selEv === 'general' && S.view === 'merch' ? 'general' : S.events.find((x) => x.id === S.selEv);
  if (!e) { main.innerHTML = homeView(); renderResults(); return; }
  if (S.view !== 'board') {
    const cf = main.querySelector('form[data-form="item"]');
    const keep = cf ? Object.fromEntries(new FormData(cf)) : null;
    main.innerHTML = itemsEventView(S.view, e);
    const nf = main.querySelector('form[data-form="item"]');
    if (keep && nf) for (const [k, v] of Object.entries(keep)) { const el = nf.elements[k]; if (el && el.type !== 'hidden') { if (el.type === 'checkbox') el.checked = v === 'on'; else el.value = v; } }
    return;
  }
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
const readDraft = (f) => {
  const d = new FormData(f);
  const v = (k) => String(d.get(k) || '').trim();
  return { artist: v('artist'), city: v('city'), venue: v('venue'), currency: v('currency') || 'GBP', dates: d.getAll('date').map(String) };
};
const parseKey = (k) => { const i = k.indexOf(':'); return [k.slice(0, i), k.slice(i + 1)]; };
const actions = {
  home() { setView('board'); },
  nav(v) { if (v === S.view && !S.selEv && v !== 'board') return; setView(v); },
  async deleteEvent() {
    const id = S.selEv;
    if (S.armDel !== id) { S.armDel = id; renderMain(); return; }
    S.armDel = null;
    const { error } = await sb.from('events').delete().eq('id', id);
    if (error) { flash('share', 'errGeneric'); renderMain(); return; }
    S.events = S.events.filter((x) => x.id !== id);
    await tabHome();
    flash('top', 'eventDeleted', 'ok');
    render();
  },
  async approveEvent() {
    const { error } = await sb.from('events').update({ status: 'approved' }).eq('id', S.selEv);
    if (error) flash('share', 'errGeneric');
    else { const e = S.events.find((x) => x.id === S.selEv); if (e) e.status = 'approved'; flash('share', 'approvedMsg', 'ok'); }
    renderMain();
  },
  openCompose() {
    S.flash = null;
    if (!S.user) { actions.toggleLogin(); return; }
    S.composing = true;
    renderMain(); document.querySelector('form[data-form="item"] input:not([type=checkbox])')?.focus();
  },
  closeCompose() { S.composing = false; S.flash = null; renderMain(); },
  merchKind(id) { S.merchKind = id; renderMain(); },
  async itemContact(key) {
    if (S.contacts[key]) { delete S.contacts[key]; renderMain(); return; }
    const [type, id] = parseKey(key);
    const { data, error } = await sb.from(TABLE[type]).select('contact').eq('id', id).maybeSingle();
    if (error || !data) flash('list', 'errGeneric'); else { S.contacts[key] = data.contact; S.flash = null; }
    renderMain();
  },
  async itemReport(key) {
    if (!S.user) { actions.toggleLogin(); return; }
    const [type, id] = parseKey(key);
    const { error } = await sb.from('item_reports').insert({ item_type: type, item_id: id });
    if (error && error.code !== '23505') flash('list', 'errGeneric');
    else { S.reported[key] = true; store.set('reported', S.reported); }
    renderMain();
  },
  async itemDone(key) {
    const [type, id] = parseKey(key);
    const { error } = await sb.from(TABLE[type]).update({ status: 'done' }).eq('id', id);
    if (error) flash('list', 'errGeneric'); else { const x = (S.items[type] || []).find((i) => i.id === id); if (x) x.status = 'done'; }
    renderMain();
  },
  async itemDel(key) {
    const [type, id] = parseKey(key);
    const { error } = await sb.from(TABLE[type]).delete().eq('id', id);
    if (error) flash('list', 'errGeneric'); else S.items[type] = (S.items[type] || []).filter((i) => i.id !== id);
    renderMain();
  },
  async mineDel(key) {
    const [type, id] = parseKey(key);
    const { error } = await sb.from(type === 'listing' ? 'listings' : TABLE[type]).delete().eq('id', id);
    if (error) flash('me', 'errGeneric'); else S.mine = S.mine.filter((x) => !(x.type === type && x.id === id));
    renderMain();
  },
  async openFeedback() {
    S.feedbackOpen = true;
    if (S.view !== 'me') await setView('me'); else renderMain();
    const el = document.getElementById('feedback'); if (el) { el.open = true; el.scrollIntoView({ block: 'center' }); document.getElementById('fb-msg')?.focus(); }
  },
  setTheme(id) { if (!THEMES[id]) return; S.theme = id; store.set('theme', id); applyTheme(); render(); },
  cycleTheme() { const k = Object.keys(THEMES); actions.setTheme(k[(k.indexOf(S.theme) + 1) % k.length]); },
  unblockAll() { S.blocked = []; store.set('blocked', []); renderMain(); },
  back() { if (history.state && history.state.ev) history.back(); else tabHome(); },
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
  day(id) {
    if (id === S.selEv) return;
    S.flash = null;
    history.replaceState({ ev: id, v: S.view }, '', urlFor(S.view, id));
    openEvent(id, false);
  },
  openCreate() {
    S.flash = null;
    if (!S.user) { actions.toggleLogin(); return; }
    S.creating = true; S.newDates = 1; S.draft = null; renderMain(); document.getElementById('new-city')?.focus();
  },
  cancelCreate() { S.creating = false; S.flash = null; S.draft = null; S.newDates = 1; renderMain(); },
  addDate() {
    const f = document.querySelector('form[data-form="create"]'); if (f) S.draft = readDraft(f);
    S.newDates = Math.min(7, S.newDates + 1); renderMain();
    const inputs = document.querySelectorAll('form[data-form="create"] input[type=date]'); inputs[inputs.length - 1]?.focus();
  },
  removeDate(i) {
    const f = document.querySelector('form[data-form="create"]'); if (f) S.draft = readDraft(f);
    if (S.draft) S.draft.dates.splice(Number(i), 1);
    S.newDates = Math.max(1, S.newDates - 1); renderMain();
  },
  tab(id) { S.tab = id; renderMain(); },
  kind(id) { S.formKind = id; S.flash = null; renderMain(); },
  openPost() {
    S.flash = null;
    if (!S.user) { actions.toggleLogin(); return; }
    S.posting = true; renderMain(); document.getElementById('p-section')?.focus();
  },
  closePost() { S.posting = false; S.flash = null; renderMain(); },
  async share() {
    const link = location.origin + urlFor(S.view, S.selEv);
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
  block(uid) { if (!S.blocked.includes(uid)) S.blocked.push(uid); store.set('blocked', S.blocked); closeMenus(); renderMain(); },
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
  async feedback(f) {
    const d = new FormData(f);
    const message = String(d.get('message') || '').trim();
    if (message.length < 3) { flash('feedback', 'feedbackShort'); S.feedbackOpen = true; renderMain(); return; }
    const row = { message, reply_email: S.user ? S.user.email : (String(d.get('reply') || '').trim() || null), page: (location.pathname + location.search).slice(0, 200) };
    if (!S.user) row.user_id = null;
    const { error } = await sb.from('feedback').insert(row);
    S.feedbackOpen = true;
    if (error) { flash('feedback', /Too many/.test(error.message) ? 'errRate' : 'errGeneric'); renderMain(); return; }
    flash('feedback', 'feedbackSent', 'ok');
    renderMain();
  },
  async item(f) {
    const type = f.dataset.type;
    const d = new FormData(f);
    const val = (k) => String(d.get(k) || '').trim();
    let row;
    if (type === 'swap') { row = { event_id: val('event'), have: val('have'), want: val('want'), contact: val('contact') }; if (S.v5 && val('desc')) row.note = val('desc'); }
    else if (type === 'buddy') row = { event_id: val('event'), note: val('note'), contact: val('contact') };
    else {
      const price = S.merchKind === 'sale' ? parseFloat(val('price')) : null;
      row = { kind: S.merchKind, title: val('title'), details: val('details') || null, price, contact: val('contact') };
      if (S.v5 && val('mevent')) row.event_id = val('mevent');
      else if (!S.v5 && S.selEv !== 'general') { flash('compose', 'errSetup'); renderMain(); return; }
      if (S.merchKind === 'sale' && !(price >= 0)) { flash('compose', 'fillAll'); renderMain(); return; }
    }
    const needConfirm = type !== 'buddy';
    const required = { swap: ['event_id', 'have', 'want', 'contact'], buddy: ['event_id', 'note', 'contact'], merch: ['title', 'contact'] }[type];
    if (required.some((k) => !row[k]) || (needConfirm && d.get('confirm') !== 'on')) {
      flash('compose', 'fillAll'); renderMain(); return;
    }
    if (row.event_id) S.selEvForm = row.event_id;
    const { error } = await sb.from(TABLE[type]).insert(row);
    if (error) { flash('compose', /Too many/.test(error.message) ? 'errRate' : 'errGeneric'); renderMain(); return; }
    S.composing = false;
    flash('posted', 'posted', 'ok');
    await loadItems(type);
    renderMain();
  },
  async changepw(f) {
    const password = String(new FormData(f).get('password') || '');
    if (password.length < 8) { flash('me', 'errShortPw'); renderMain(); return; }
    const { error } = await sb.auth.updateUser({ password });
    flash('me', error ? 'errGeneric' : 'pwSaved', error ? 'err' : 'ok');
    renderMain();
  },
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
    const d = readDraft(f);
    const dates = [...new Set(d.dates.filter(Boolean))].sort();
    if (!d.artist || !d.city || !dates.length) return;
    const made = []; let dup = 0; let fail = null;
    for (const event_date of dates) {
      const row = { artist: d.artist, city: d.city, venue: d.venue || null, currency: d.currency, event_date };
      const { data, error } = await sb.from('events').insert(row).select('id, artist, city, venue, currency, event_date, status, created_by').single();
      if (!error) made.push(data);
      else if (error.code === '23505') dup++;
      else { fail = error; break; }
    }
    if (!made.length) {
      S.draft = d;
      flash('create', dup ? 'dupWarn' : fail && /Too many/.test(fail.message) ? 'errRate' : 'errGeneric', dup ? 'warn' : 'err');
      renderMain(); return;
    }
    S.events.push(...made);
    S.events.sort((a, b) => a.event_date.localeCompare(b.event_date));
    S.creating = false; S.q = ''; S.draft = null; S.newDates = 1;
    S.flash = dup || fail ? { area: 'share', text: t('someDup'), kind: 'warn' } : null;
    openEvent(made[0].id);
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
      p_original: original, p_price: price, p_meet: meet, p_contact: contact,
      ...(S.v5 ? { p_note: String(d.get('note') || '').trim() || null } : {})
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
  if (e.target.id === 'evq') {
    S.evQ = e.target.value;
    const box = document.getElementById('evlist');
    if (box) box.innerHTML = S.view === 'board' ? boardList() : itemList(S.view);
  }
  if (e.target.id === 'c-event') S.selEvForm = e.target.value;
  if (e.target.id === 'p-price' || e.target.id === 'p-original') checkOver();
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'lang') { S.lang = Number(e.target.value); store.set('lang', S.lang); render(); }
});
const VIEWS = ['swap', 'buddy', 'merch', 'me'];
const routeTo = async (push) => {
  const p = new URLSearchParams(location.search);
  const id = p.get('e'); const v = p.get('v');
  const view = VIEWS.includes(v) ? v : 'board';
  const okId = id && ((id === 'general' && view === 'merch') || (UUID.test(id) && S.events.some((x) => x.id === id)));
  if (okId && view !== 'me') await openEvent(id, push, view);
  else if (view !== 'board') await setView(view, push);
  else goHome(push);
};
window.addEventListener('popstate', () => { routeTo(false); });
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
      await checkAdmin(); await loadEvents(); await loadCounts(); await loadListings();
      if (S.view === 'me') await loadMine(); else if (S.view !== 'board') await loadItems(S.view);
      render();
    }
  });
  await checkAdmin();
  await detectV5();
  await loadEvents();
  await loadCounts();
  const params = new URLSearchParams(location.search);
  if (params.get('e') || params.get('v')) {
    if (params.get('e')) history.replaceState({ ev: params.get('e'), v: params.get('v') || 'board' }, '', location.pathname + location.search);
    await routeTo(false);
  } else {
    render();
  }
}
start();
