import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, CONTACT_EMAIL, GOOGLE_LOGIN } from './config.js';
import { googleIdOn, mountGoogle } from './google.js';
import { captchaOn, mountCaptcha, captchaToken, resetCaptcha } from './turnstile.js';
import { isBlockedEmail } from './blocked-domains.js';

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
  installTitle: ['Add Show Day to your home screen', '把 Show Day 加入主畫面', '홈 화면에 Show Day 추가하기'],
  installBody: ['Open it in one tap on show day, just like an app.', '演出當天一按即開，就像 App 一樣。', '공연 당일 앱처럼 한 번에 열 수 있어요.'],
  installAdd: ['Add', '加入', '추가'], installLater: ['Later', '稍後', '나중에'],
  iosSteps: ['In Safari, tap Share {share} then “Add to Home Screen”.', '在 Safari 按「分享」{share}，再選「加入主畫面」。', 'Safari에서 공유 {share} → “홈 화면에 추가”를 누르세요.'],
  androidSteps: ['Tap the ⋮ menu, then “Add to Home screen”.', '按右上角 ⋮，再選「加到主畫面」。', '오른쪽 위 ⋮ 메뉴 → “홈 화면에 추가”를 누르세요.'],
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
  merchSub: ['Swap, sell or give away fan goods. No tickets here.', '交換、出售或派發周邊，此區不可放票。', '굿즈 교환·판매·나눔. 티켓은 안 돼요.'],
  merchCta: ['Post an item', '發佈周邊', '굿즈 올리기'],
  forSwap: ['Swap', '交換', '교환'], forSale: ['For sale', '出售', '판매'],
  fTitle: ['Item', '物品', '물품'], phTitle: ['[MEMBER] photocard', '[成員] 小卡', '[멤버] 포토카드'],
  fDetails: ['Details (optional)', '詳情（選填）', '상세 (선택)'], phDetails: ['Condition, what you want in return', '狀況、想換什麼', '상태, 원하는 교환품'],
  fPrice: ['Price ({c})', '價格（{c}）', '가격 ({c})'], confirmMerch: ['This is not a ticket.', '這不是門票。', '티켓이 아니에요.'],
  undoStep: ['↩ Undo', '↩ 撤回', '↩ 되돌리기'], errUndoRated: ['Someone already rated this trade, so it can\'t be undone.', '已經有人評分，唔可以撤回。', '이미 평가가 있어 되돌릴 수 없어요.'],
  rateNeedAsk: ['Tap Interested on a post before the trade, then you can rate it.', '交易前喺帖文㩒「有興趣」，之後先可以評分。', '거래 전에 게시글에서 관심 있어요를 눌러야 평가할 수 있어요.'],
  reload: ['Refresh', '重新整理', '새로고침'],
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
  photoTicketHint: ['Cover the QR code or barcode before you upload.', '上載前請遮住 QR code 或條碼。', '업로드 전에 QR코드나 바코드를 가려 주세요.'],
  pastShows: ['Past shows', '過去演出', '지난 공연'],
  pastNote: ['This show has ended. Posts are read only.', '此演出已完結，只可瀏覽。', '종료된 공연이에요. 보기만 가능해요.'],
  fanN: ['Fan {n}', '粉絲 {n}', '팬 {n}'], memberSince: ['Member since {d}', '{d} 加入', '{d} 가입'],
  doneTrades: ['{n} completed', '完成 {n} 次交易', '거래 완료 {n}회'], activePosts: ['Active posts', '進行中嘅貼文', '진행 중인 게시글'],
  editProfile: ['Edit my profile', '編輯個人資料', '프로필 수정'], myProfile: ['My profile', '我的個人資料', '내 프로필'],
  nickname: ['Nickname', '暱稱', '닉네임'], nickHint: ['Shown on your posts. Do not use your real name or email.', '會顯示喺你嘅貼文上，請勿用真名或電郵。', '게시글에 표시돼요. 실명이나 이메일은 쓰지 마세요.'],
  pickAvatar: ['Avatar', '頭像', '아바타'], pickColor: ['Background', '背景色', '배경색'], saveProfile: ['Save profile', '儲存', '저장'],
  viewProfile: ['View my profile', '睇我嘅個人頁面', '내 프로필 보기'], profileSaved: ['Profile saved.', '已儲存。', '저장됐어요.'],
  nickTaken: ['That nickname is taken.', '呢個暱稱已經有人用。', '이미 사용 중인 닉네임이에요.'],
  justNow: ['just now', '剛剛', '방금'],
  maybeSold: ['May be gone', '可能已售出', '이미 거래됐을 수도'],
  maybeSwapped: ['May be swapped', '可能已換出', '이미 교환됐을 수도'],
  priceMatch: ['Fits your price', '價格合適', '가격 맞음'],
  belowFace: ['{p}% below face value', '低於原價 {p}%', '원가보다 {p}% 저렴'],
  sortBy: ['Sort', '排序', '정렬'], sortNew: ['Newest', '最新', '최신순'], sortLow: ['Price: low to high', '價格：低至高', '가격 낮은순'],
  sortHigh: ['Price: high to low', '價格：高至低', '가격 높은순'], sortSection: ['Section', '區域', '구역순'],
  perfectMatch: ['Perfect match ✦', '完美配對 ✦', '완벽 매칭 ✦'], maybeMatch: ['Might suit you', '可能適合', '맞을 수도 있어요'],
  matchHint: ['Post your own swap to see who matches you.', '發佈你的換位，即可看到誰跟你配對。', '내 교환글을 올리면 매칭되는 사람을 보여드려요.'],
  fStanding: ['Standing', '企位', '스탠딩'], fSeated: ['Seated', '座位', '좌석'],
  tagFirst: ['First time', '第一次去', '첫 공연'], tagSolo: ['Going solo', '一個人', '혼자 가요'],
  tagCantonese: ['廣東話', '廣東話', '광둥어'], tagEnglish: ['English', 'English', '영어'], tagKorean: ['한국어', '한국어', '한국어'], tagMandarin: ['普通話', '普通話', '중국어'],
  tagQueue: ['Queue together', '一起排隊', '같이 줄 서기'], tagEat: ['Eat together', '一起食飯', '같이 밥 먹기'], tagPhoto: ['Take photos', '一起拍照', '같이 사진 찍기'],
  fTags: ['Tags', '標籤', '태그'], fMeetTime: ['Meet time (optional)', '集合時間（選填）', '만날 시간 (선택)'], phMeetTime: ['5:30pm', '5:30pm', '오후 5:30'],
  fMeetPlace: ['Meet place (optional)', '集合地點（選填）', '만날 장소 (선택)'], phMeetPlace: ['Gate B, by the merch booth', 'B 閘，周邊攤位旁', 'B 게이트 굿즈 부스 옆'],
  wts: ['WTS · Selling', 'WTS 出售', 'WTS 판매'], wtb: ['WTB · Looking for', 'WTB 收', 'WTB 구해요'], wtt: ['WTT · Swap', 'WTT 交換', 'WTT 교환'],
  fCategory: ['Category', '類別', '카테고리'], fMember: ['Member (optional)', '成員（選填）', '멤버 (선택)'], phMember: ['e.g. Jennie', '例如：Jennie', '예: 제니'],
  catPhotocard: ['Photocard', '小卡', '포토카드'], catLightstick: ['Lightstick', '燈牌', '응원봉'], catSlogan: ['Slogan', '手幅', '슬로건'],
  catAlbum: ['Album', '專輯', '앨범'], catClothing: ['Clothing', '衣物', '의류'], catOther: ['Other', '其他', '기타'],
  fBudget: ['Budget ({c}, optional)', '預算（{c}，選填）', '예산 ({c}, 선택)'],
  fPhoto: ['Photo (optional)', '相片（選填）', '사진 (선택)'], photoErr: ['Photo upload failed. Try a smaller image.', '相片上載失敗，請試試較小的相片。', '사진 업로드 실패. 더 작은 사진으로 해 보세요.'],
  uploading: ['Uploading photo…', '正在上載相片…', '사진 업로드 중…'],
  all2: ['All', '全部', '전체'], anyMember: ['All members', '所有成員', '모든 멤버'],
  navFree: ['Freebies', '派發', '나눔'],
  freeSub: ['Free fan goodies handed out at the show.', '粉絲在現場免費派發的應援物。', '공연장에서 무료로 나눠 주는 굿즈.'],
  freeCta: ['Post a giveaway', '發佈派發', '나눔 올리기'],
  fWhat: ['What are you giving out', '派發什麼', '무엇을 나눠요'], phWhat: ['Handmade stickers, 200 sets', '手作貼紙 200 份', '수제 스티커 200세트'],
  fGiveTime: ['When', '派發時間', '나눔 시간'], phGiveTime: ['From 5pm until gone', '5pm 開始，派完即止', '오후 5시부터 소진 시까지'],
  fPlace: ['Where', '派發地點', '나눔 장소'], phPlace: ['Exit A, look for the pink balloon', 'A 出口，找粉紅氣球', 'A 출구, 핑크 풍선'],
  freeDetails: ['How to get one (optional)', '領取方法（選填）', '받는 방법 (선택)'], phFreeDetails: ['Show your lightstick or say the fan chant', '出示燈牌或講應援口號', '응원봉 보여주거나 응원법 말하기'],
  allGone: ['All gone', '已派完', '나눔 완료'], markAllGone: ['Mark as all gone', '標記為已派完', '나눔 완료로 표시'],
  typeFree: ['Freebie', '派發', '나눔'],
  privacy: ['Privacy', '私隱政策', '개인정보'], terms: ['Terms', '使用條款', '이용약관'],
  agreeTerms: ['By creating an account you agree to the <a href="terms.html">Terms of Use</a> and <a href="privacy.html">Privacy Policy</a>, and confirm you are 16 or older.', '建立帳號即表示你同意<a href="terms.html">使用條款</a>及<a href="privacy.html">私隱政策</a>，並確認你已年滿 16 歲。', '계정을 만들면 <a href="terms.html">이용약관</a> 및 <a href="privacy.html">개인정보 처리방침</a>에 동의하고 만 16세 이상임을 확인하는 것으로 간주돼요.'],
  contactUs:['Contact us', '聯絡我們', '문의'],
  rateSeller: ['Rate seller', '評分賣家', '판매자 평가'], rateTrader: ['Rate this trade', '評分交易', '거래 평가'],
  rated: ['Rated', '已評分', '평가 완료'], rateTitle: ['How was the trade?', '交易順利嗎？', '거래는 어땠나요?'],
  rateHint: ['Only rate someone you actually traded with.', '只為真的同你交易過的人評分。', '실제로 거래한 사람만 평가해 주세요.'],
  rateComment: ['Comment (optional)', '留言（選填）', '코멘트 (선택)'], phRateComment: ['On time, ticket worked, friendly', '準時、門票正常、好友善', '시간 약속 잘 지킴, 티켓 문제없음'],
  rateSubmit: ['Send rating', '送出評分', '평가 보내기'], rateThanks: ['Thanks! Your rating is posted.', '多謝！評分已送出。', '감사합니다! 평가가 등록됐어요.'],
  ratePick: ['Pick 1 to 5 stars.', '請揀 1 至 5 粒星。', '별 1~5개를 골라 주세요.'],
  rateErrSelf: ['You cannot rate yourself.', '你不能為自己評分。', '자기 자신은 평가할 수 없어요.'],
  rateErrNew: ['New accounts can rate after 1 day.', '新帳號要等 1 日後先可以評分。', '새 계정은 1일 후부터 평가할 수 있어요.'],
  rateErrMany: ['You have rated a lot today. Try again tomorrow.', '你今日評分太多次，聽日再試。', '오늘 평가를 너무 많이 했어요. 내일 다시 시도해 주세요.'],
  rateErrDup: ['You already rated this post.', '你已經評過這個帖子。', '이미 이 글을 평가했어요.'],
  rateErrState: ['You can rate once the trade is marked done.', '交易標記為完成後先可以評分。', '거래 완료로 표시된 후 평가할 수 있어요.'],
  ratingsN: ['{n} ratings', '{n} 個評分', '평가 {n}개'], rating1: ['1 rating', '1 個評分', '평가 1개'],
  reviews: ['Ratings', '評分', '평가'], noRatings: ['No ratings yet.', '暫時未有評分。', '아직 평가가 없어요.'],
  stars: ['{n} stars', '{n} 粒星', '별 {n}개'],
  stillAvail: ['Interested', '有興趣', '관심 있어요'], asked: ['Interested', '有興趣', '관심 있어요'],
  nAsked: ['{n} interested', '{n} 人有興趣', '{n}명 관심'], oneAsked: ['1 interested', '1 人有興趣', '1명 관심'],
  likeIt: ['Like', '讚好', '좋아요'],
  google: ['Continue with Google', '用 Google 繼續', 'Google로 계속하기'], orEmail: ['or use email', '或者用電郵', '또는 이메일로'],
  errCaptcha: ['Please finish the "verify you are human" check, then try again.', '請先完成「驗證你是真人」，再試一次。', '"사람인지 확인"을 완료한 후 다시 시도해 주세요.'],
  errDisposable: ['Please use your usual email. Throwaway email addresses cannot sign up.', '請用你平時用的電郵。一次性電郵不能註冊。', '평소 쓰는 이메일을 사용해 주세요. 일회용 이메일로는 가입할 수 없어요.'],
  notifs: ['Notifications', '通知', '알림'],
  andUnits: ['& units', '及小分隊', '& 유닛'], useEmail: ['Use email instead', '改用電郵', '이메일로 하기'],
  citiesDates: ['{c} cities · {d} dates', '{c} 個城市 · {d} 場', '{c}개 도시 · {d}회'], nextOn: ['next {d}', '最近 {d}', '다음 {d}'],
  prev: ['Previous', '上一頁', '이전'], next: ['Next', '下一頁', '다음'], pageOf: ['Page {p} of {n}', '第 {p} / {n} 頁', '{n}쪽 중 {p}쪽'], pages: ['Pages', '頁數', '페이지'],
  errRules: ['This post breaks the board rules (no links, no selling above face value, no risky payment requests). Please edit it and try again.', '帖子違反版規（不准放連結、不准高於原價、不准要求高風險付款）。請修改後再試。', '게시판 규칙 위반이에요 (링크 금지, 정가 초과 판매 금지, 위험한 결제 요구 금지). 수정 후 다시 시도해 주세요.'],
  errBanned: ['This account has been suspended. Contact us if you think this is a mistake.', '此帳號已被停用。如認為有誤，請聯絡我們。', '이 계정은 정지되었어요. 착오라고 생각되면 문의해 주세요.'], noNotifs: ['Nothing new yet. When someone is interested, likes or rates your post, it shows here.', '暫時未有新通知。有人對你的帖子有興趣、讚好或評分，就會喺度顯示。', '아직 새 알림이 없어요. 누군가 내 글에 관심, 좋아요, 평가를 남기면 여기에 표시돼요.'],
  nInterest: ['{n} people are interested in your post', '{n} 人對你的帖子有興趣', '{n}명이 내 글에 관심을 보였어요'], oneInterest: ['Someone is interested in your post', '有人對你的帖子有興趣', '누군가 내 글에 관심을 보였어요'],
  nLikes: ['{n} new likes on your post', '你的帖子有 {n} 個新讚好', '내 글에 새 좋아요 {n}개'], oneLike: ['Someone liked your post', '有人讚好你的帖子', '누군가 내 글을 좋아해요'],
  nRatings: ['You got {n} new ratings', '你收到 {n} 個新評分', '새 평가 {n}개를 받았어요'], oneRating: ['You got a new rating', '你收到一個新評分', '새 평가를 받았어요'],
  newBadge: ['New', '新', '새 알림'], unlikeIt: ['Unlike', '取消讚好', '좋아요 취소']
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
// City names in [English, 繁中, 한국어, ...other spellings people type]. Unknown cities show as typed.
const CITIES = [
  ['Hong Kong', '香港', '홍콩', 'hk', 'hongkong'], ['Macau', '澳門', '마카오', 'macao', '澳门'], ['Taipei', '台北', '타이베이', '臺北', '台北市'],
  ['Kaohsiung', '高雄', '가오슝'], ['Taichung', '台中', '타이중', '臺中'], ['Seoul', '首爾', '서울', '首尔', '漢城'], ['Busan', '釜山', '부산'],
  ['Incheon', '仁川', '인천'], ['Tokyo', '東京', '도쿄', '东京'], ['Osaka', '大阪', '오사카'], ['Nagoya', '名古屋', '나고야'],
  ['Fukuoka', '福岡', '후쿠오카'], ['Saitama', '埼玉', '사이타마'], ['Yokohama', '橫濱', '요코하마', '横滨', '横浜'], ['Sapporo', '札幌', '삿포로'],
  ['Kobe', '神戶', '고베', '神户'], ['Chiba', '千葉', '지바'], ['Kyoto', '京都', '교토'], ['Shanghai', '上海', '상하이'], ['Beijing', '北京', '베이징'],
  ['Shenzhen', '深圳', '선전'], ['Guangzhou', '廣州', '광저우', '广州'], ['Chengdu', '成都', '청두'], ['Hangzhou', '杭州', '항저우'],
  ['Singapore', '新加坡', '싱가포르', 'sg'], ['Bangkok', '曼谷', '방콕'], ['Kuala Lumpur', '吉隆坡', '쿠알라룸푸르', 'kl'], ['Manila', '馬尼拉', '마닐라', '马尼拉'],
  ['Jakarta', '雅加達', '자카르타', '雅加达'], ['Ho Chi Minh City', '胡志明市', '호치민', 'saigon', 'hcmc'], ['Hanoi', '河內', '하노이', '河内'],
  ['London', '倫敦', '런던', '伦敦'], ['Manchester', '曼徹斯特', '맨체스터', '曼彻斯特'], ['Birmingham', '伯明翰', '버밍엄'], ['Glasgow', '格拉斯哥', '글래스고'],
  ['Dublin', '都柏林', '더블린'], ['Paris', '巴黎', '파리'], ['Berlin', '柏林', '베를린'], ['Amsterdam', '阿姆斯特丹', '암스테르담'],
  ['Barcelona', '巴塞隆拿', '바르셀로나', '巴塞罗那'], ['Madrid', '馬德里', '마드리드'], ['Milan', '米蘭', '밀라노'], ['New York', '紐約', '뉴욕', 'nyc', '纽约'],
  ['Los Angeles', '洛杉磯', '로스앤젤레스', 'la', '洛杉矶'], ['San Francisco', '三藩市', '샌프란시스코', 'sf', '旧金山', '舊金山'], ['Chicago', '芝加哥', '시카고'],
  ['Toronto', '多倫多', '토론토', '多伦多'], ['Vancouver', '溫哥華', '밴쿠버', '温哥华'], ['Sydney', '悉尼', '시드니', '雪梨'], ['Melbourne', '墨爾本', '멜버른', '墨尔本'],
  ['Auckland', '奧克蘭', '오클랜드'], ['Dubai', '杜拜', '두바이', '迪拜']
];
// Country of each city, so "Japan", "日本" or "일본" finds Tokyo, Osaka...
const COUNTRIES = {
  hk: ['Hong Kong', '香港', '홍콩'], mo: ['Macau', '澳門', '마카오'], tw: ['Taiwan', '台灣', '대만', '臺灣', '台湾'],
  kr: ['South Korea', '韓國', '한국', 'korea', '南韓', '韩国'], jp: ['Japan', '日本', '일본'], cn: ['China', '中國', '중국', '中国', '內地'],
  sg: ['Singapore', '新加坡', '싱가포르'], th: ['Thailand', '泰國', '태국', '泰国'], my: ['Malaysia', '馬來西亞', '말레이시아', '马来西亚'],
  ph: ['Philippines', '菲律賓', '필리핀', '菲律宾'], id: ['Indonesia', '印尼', '인도네시아'], vn: ['Vietnam', '越南', '베트남'],
  uk: ['United Kingdom', '英國', '영국', 'uk', 'britain', 'england', 'scotland', '英国'], ie: ['Ireland', '愛爾蘭', '아일랜드'],
  fr: ['France', '法國', '프랑스'], de: ['Germany', '德國', '독일'], nl: ['Netherlands', '荷蘭', '네덜란드', 'holland'],
  es: ['Spain', '西班牙', '스페인'], it: ['Italy', '意大利', '이탈리아'], us: ['United States', '美國', '미국', 'usa', 'us', 'america'],
  ca: ['Canada', '加拿大', '캐나다'], au: ['Australia', '澳洲', '호주', '澳大利亚'], nz: ['New Zealand', '紐西蘭', '뉴질랜드', '新西兰'],
  ae: ['UAE', '阿聯酋', '아랍에미리트', 'united arab emirates']
};
const CITY_COUNTRY = { 'Hong Kong': 'hk', Macau: 'mo', Taipei: 'tw', Kaohsiung: 'tw', Taichung: 'tw', Seoul: 'kr', Busan: 'kr', Incheon: 'kr',
  Tokyo: 'jp', Osaka: 'jp', Nagoya: 'jp', Fukuoka: 'jp', Saitama: 'jp', Yokohama: 'jp', Sapporo: 'jp', Kobe: 'jp', Chiba: 'jp', Kyoto: 'jp',
  Shanghai: 'cn', Beijing: 'cn', Shenzhen: 'cn', Guangzhou: 'cn', Chengdu: 'cn', Hangzhou: 'cn', Singapore: 'sg', Bangkok: 'th',
  'Kuala Lumpur': 'my', Manila: 'ph', Jakarta: 'id', 'Ho Chi Minh City': 'vn', Hanoi: 'vn', London: 'uk', Manchester: 'uk', Birmingham: 'uk',
  Glasgow: 'uk', Dublin: 'ie', Paris: 'fr', Berlin: 'de', Amsterdam: 'nl', Barcelona: 'es', Madrid: 'es', Milan: 'it', 'New York': 'us',
  'Los Angeles': 'us', 'San Francisco': 'us', Chicago: 'us', Toronto: 'ca', Vancouver: 'ca', Sydney: 'au', Melbourne: 'au', Auckland: 'nz', Dubai: 'ae' };
const CITY_IDX = new Map();
CITIES.forEach((row) => row.forEach((n) => CITY_IDX.set(n.toLowerCase().replace(/\s+/g, ' ').trim(), row)));
const cityRow = (c) => CITY_IDX.get(String(c || '').toLowerCase().replace(/\s+/g, ' ').trim());
const cityName = (c) => { const r = cityRow(c); return r ? r[S.lang] : String(c || '').trim(); };
const cityKey = (c) => { const r = cityRow(c); return (r ? r[0] : String(c || '')).trim().toLowerCase(); };
const cityAll = (c) => { const r = cityRow(c); return r ? [...r, ...(COUNTRIES[CITY_COUNTRY[r[0]]] || [])].join(' ') : String(c || ''); };
const place = (e) => {
  if (!e) return '';
  const v = (e.venue || '').trim(), raw = (e.city || '').trim(), c = cityName(raw);
  return v && c && v.toLowerCase() !== raw.toLowerCase() && v.toLowerCase() !== c.toLowerCase() ? `${v}, ${c}` : (c || v);
};
// Fan colours: commonly used fandom / lightstick colours. Others get a steady pastel picked from the name.
const FAN_COLORS = {
  'bigbang': ['#FFD400', '#1A1A1A'], 'bts': ['#A06CD5', '#5B2A86'], 'blackpink': ['#F7A7C1', '#1A1A1A'],
  'twice': ['#FBC8A0', '#FF3EA5'], 'stray kids': ['#9DE5D2', '#FFE36E'], 'babymonster': ['#E63946', '#1A1A1A'],
  'txt': ['#7FB2FF', '#3D5AFE'], 'tomorrow x together': ['#7FB2FF', '#3D5AFE'], 'seventeen': ['#F7CAC9', '#92A8D1'],
  'exo': ['#F3E9D2', '#C9B37E'], 'iu': ['#E8F55A', '#9C6ADE'], 'newjeans': ['#9CCBF7', '#F7A8C8']
};
const PASTELS = [['#FFB3D1', '#C9A7FF'], ['#A7E8D9', '#7FB2FF'], ['#FFE08A', '#FFB38A'], ['#C9A7FF', '#7FB2FF'], ['#FFC2A8', '#FF8FB1'],
  ['#B8F2C2', '#7CD6C4'], ['#A7D8FF', '#C9A7FF'], ['#FFD6E8', '#FFE08A'], ['#D7C2FF', '#FF9EC4'], ['#9FE3F2', '#B8F2C2']];
// Artist names per language and fandom colours, edited on the admin page (supabase/011)
const artistRow = (name) => {
  const k = String(name || '').trim().toLowerCase();
  return k ? S.artists.find((a) => [a.name_en, a.name_zh, a.name_ko, ...(a.aliases || [])].some((n) => n && n.trim().toLowerCase() === k)) : null;
};
const artistLabel = (name) => {
  const a = artistRow(name);
  if (!a) return String(name || '').trim();
  return (S.lang === 1 ? a.name_zh : S.lang === 2 ? a.name_ko : null) || a.name_en;
};
const parentOf = (a) => (a && a.parent_id ? S.artists.find((x) => x.id === a.parent_id) : null);
const namesOf = (a) => (a ? [a.name_en, a.name_zh, a.name_ko, ...(a.aliases || [])].filter(Boolean) : []);
const artistAll = (name) => { const a = artistRow(name); return a ? [name, ...namesOf(a), ...namesOf(parentOf(a))].join(' ') : String(name || ''); };
const fanColors = (artist) => {
  const k = String(artist || '').trim().toLowerCase();
  const row = artistRow(artist);
  if (row && row.color1 && row.color2) return [row.color1, row.color2];
  const par = parentOf(row);
  if (par && par.color1 && par.color2) return [par.color1, par.color2];
  if (par && FAN_COLORS[par.name_en.toLowerCase()]) return FAN_COLORS[par.name_en.toLowerCase()];
  if (FAN_COLORS[k]) return FAN_COLORS[k];
  let h = 0; for (const ch of k) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return PASTELS[h % PASTELS.length];
};
const coverStyle = (artist) => { const [a, b] = fanColors(artist); return `--c1:${a};--c2:${b}`; };
const fanName = (artist) => `<span class="fan-name" style="${coverStyle(artist)}">${esc(artistLabel(artist))}</span>`;
const showKey = (e) => [e.artist.trim().toLowerCase(), cityKey(e.city), (e.venue || '').trim().toLowerCase()].join('|');
const shortDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(LOCALES[S.lang], { day: 'numeric', month: 'short' });
const fmtDate = (iso) => iso === todayISO() ? t('tonight')
  : new Date(iso + 'T12:00:00').toLocaleDateString(LOCALES[S.lang], { weekday: 'short', day: 'numeric', month: 'short' });
const ago = (ts) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
  const f = new Intl.RelativeTimeFormat(LOCALES[S.lang], { numeric: 'auto' });
  if (m < 1) return t('justNow');
  return m < 60 ? f.format(-m, 'minute') : m < 1440 ? f.format(-Math.floor(m / 60), 'hour') : f.format(-Math.floor(m / 1440), 'day');
};
// Exact post time next to the relative one: "2 hours ago · 14:05" (date added if not today)
const postedAt = (ts) => {
  const d = new Date(ts);
  const sameDay = d.toDateString() === new Date().toDateString();
  const exact = d.toLocaleString(LOCALES[S.lang], sameDay ? { hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  return `${ago(ts)} · ${exact}`;
};
// Open ticket or swap posted 3+ hours ago on show day: probably gone
const isStale = (ts, eventDate) => eventDate === todayISO() && Date.now() - new Date(ts).getTime() > 3 * 3600e3;
// Standing or seated, guessed from free text
const seatClass = (s) => {
  const x = (s || '').toLowerCase();
  if (/stand|standing|floor|\bga\b|企|站|스탠딩|플로어/.test(x)) return 'stand';
  if (/seat|座|좌석|block|區|row|排|열|구역|tier|level|樓|층|\d/.test(x)) return 'seat';
  return null;
};
const ANY_RX = /any|whatever|任何|都可|皆可|아무|상관없/i;
const WEAK = new Set(['seat', 'seats', 'block', 'row', 'standing', 'stand', 'ticket', 'the', 'near', 'any', '區', '排', '座', '座位', '企位', '좌석', '구역', '열', '스탠딩']);
const tokens = (s) => (s || '').toLowerCase().replace(/(\d)(\D)/g, '$1 $2').replace(/(\D)(\d)/g, '$1 $2')
  .split(/[^\p{L}\p{N}]+/u).filter((w) => w && !WEAK.has(w));
// Does a ticket described as `have` satisfy a wish described as `want`?
function fits(want, have) {
  const cw = seatClass(want), ch = seatClass(have);
  if (cw && ch && cw !== ch) return false;
  if (ANY_RX.test(want)) return true;
  if (cw === 'stand' && ch === 'stand') return true;
  const th = tokens(have);
  // "100s", "100번대", "100多" = any number from 100 to 199
  const range = (want || '').match(/(\d)(0{1,3})\s*(?:s\b|번대|多|幾)/i);
  if (range && th.some((h) => /^\d+$/.test(h) && h.length === range[2].length + 1 && h[0] === range[1])) return true;
  const tw = tokens(want);
  return tw.some((w) => th.includes(w));
}
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
const isAndroid = /android/i.test(navigator.userAgent);
const isStandalone = () => !!(window.navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches));
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
  share: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Share" role="img" style="vertical-align:-3px"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11v9h12v-9"/></svg>',
  gift: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13"/><path d="M12 8c-2-4-6-4-6-1.5S9 8 12 8c3 0 6-.5 6-1.5S14 4 12 8z"/></svg>',
  chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
};

// ---------- State ----------
const S = {
  artists: [], scores: {}, myRatings: {}, reacts: {}, myReacts: {}, notifs: null, unread: 0, v13: true, rating: null, ratingPick: 0, profileRatings: null,
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
  items: { swap: null, buddy: null, merch: null, free: null },
  mine: null,
  composing: false,
  merchKind: 'swap',
  postQ: '',
  newDates: 1,
  feedbackOpen: false,
  v5: false,
  v7: false,
  v8: false,
  v9: false,
  profiles: {},
  profileId: null,
  profilePosts: null,
  profileDone: 0,
  pickAv: null,
  pickBg: null,
  pastOpen: false,
  pastLoaded: false,
  sort: 'new',
  swapFilter: 'all',
  buddyTag: null,
  mf: { kind: 'all', cat: null, member: null },
  merchCat: 'photocard',
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
    .select('id, event_id, user_id, kind, section, qty, original_price, price, meet_point, status, hidden, created_at' + (S.v5 ? ', note' : '') + (S.v8 ? ', photo_url' : ''))
    .eq('event_id', S.selEv)
    .order('created_at', { ascending: false })
    .limit(200);
  if (!error) S.listings = data.filter((l) => !l.hidden || (S.user && l.user_id === S.user.id));
  if (!error) await Promise.all([loadProfiles(S.listings.map((l) => l.user_id)), loadReactions(S.listings.map((l) => 'listing:' + l.id))]);
  S.listingsLoaded = true;
}
const TABLE = { swap: 'swaps', buddy: 'buddies', merch: 'merch', free: 'freebies' };
const EV_EMBED = 'events(artist, city, venue, event_date, currency)';
const ITEM_COLS = {
  get swap() { return `id, event_id, user_id, have, want, status, hidden, created_at, ${S.v5 ? 'note, ' : ''}${S.v8 ? 'photo_url, ' : ''}${EV_EMBED}`; },
  get buddy() { return `id, event_id, user_id, note, hidden, created_at, ${S.v7 ? 'tags, meet_time, meet_place, ' : ''}${S.v8 ? 'photo_url, ' : ''}${EV_EMBED}`; },
  get merch() { return `id, user_id, kind, title, details, price, status, hidden, created_at${S.v7 ? ', category, member, photo_url' : ''}${S.v5 ? ', event_id, ' + EV_EMBED : ''}`; },
  get free() { return `id, event_id, user_id, what, details, give_time, place, photo_url, status, hidden, created_at, ${EV_EMBED}`; }
};
async function detectV5() {
  const [a, b, c, d] = await Promise.all([sb.from('listings').select('note').limit(1), sb.from('buddies').select('tags').limit(1), sb.from('listings').select('photo_url').limit(1), sb.from('profiles').select('id').limit(1)]);
  S.v9 = !d.error;
  S.v5 = !a.error;
  S.v7 = !b.error;
  S.v8 = !c.error;
  let ar = await sb.from('artists').select('id, name_en, name_zh, name_ko, aliases, color1, color2, parent_id').limit(2000);
  if (ar.error) ar = await sb.from('artists').select('id, name_en, name_zh, name_ko, aliases, color1, color2').limit(2000);
  S.v11 = !ar.error;
  const rc = await sb.from('reaction_counts').select('item_id').limit(1);
  S.v12 = !rc.error;
  if (!ar.error) S.artists = ar.data || [];
}
async function loadReactions(keys) {
  if (!S.v12 || !keys.length) return;
  const ids = [...new Set(keys.map((k) => k.slice(k.indexOf(':') + 1)))];
  for (let i = 0; i < ids.length; i += 150) {
    const { data } = await sb.from('reaction_counts').select('item_type, item_id, asks, likes').in('item_id', ids.slice(i, i + 150));
    (data || []).forEach((r) => { S.reacts[r.item_type + ':' + r.item_id] = { asks: r.asks, likes: r.likes }; });
  }
}
async function loadMyReacts() {
  S.myReacts = {};
  if (!S.v12 || !S.user) return;
  const { data } = await sb.from('post_reactions').select('item_type, item_id, kind').eq('user_id', S.user.id).limit(2000);
  (data || []).forEach((r) => { S.myReacts[r.kind + ':' + r.item_type + ':' + r.item_id] = true; });
}
async function loadNotifs() {
  if (!S.user || !S.v13) { S.notifs = null; S.unread = 0; return; }
  const { data, error } = await sb.from('notifications').select('id, kind, item_type, item_id, event_id, label, n, read, updated_at')
    .eq('user_id', S.user.id).order('updated_at', { ascending: false }).limit(50);
  if (error) { S.v13 = false; S.notifs = null; S.unread = 0; return; }
  S.notifs = data || [];
  S.unread = S.notifs.filter((x) => !x.read).length;
}
const bellBtn = () => S.user && S.v13
  ? `<button type="button" id="bell" class="icon-btn bell" data-act="openNotifs" aria-label="${t('notifs')}${S.unread ? ` (${S.unread})` : ''}" title="${t('notifs')}">🔔${S.unread ? `<span class="dot">${S.unread > 9 ? '9+' : S.unread}</span>` : ''}</button>` : '';
function refreshBell() { const b = document.getElementById('bell'); if (b) b.outerHTML = bellBtn(); }
async function openNotifs(push = true) {
  S.view = 'n'; S.selEv = null; S.flash = null;
  if (S.channel) { sb.removeChannel(S.channel); S.channel = null; }
  if (push) history.pushState({ v: 'n' }, '', location.pathname + '?v=n');
  render(); window.scrollTo(0, 0);
  await loadNotifs();
  S.notifSeen = new Set((S.notifs || []).filter((x) => !x.read).map((x) => x.id));
  renderMain();
  if (S.notifSeen.size) {
    await sb.from('notifications').update({ read: true }).eq('user_id', S.user.id).eq('read', false);
    (S.notifs || []).forEach((x) => { x.read = true; });
    S.unread = 0; refreshBell();
  }
}
function notifText(x) {
  const one = x.n === 1;
  return x.kind === 'interest' ? (one ? t('oneInterest') : t('nInterest', { n: x.n }))
    : x.kind === 'like' ? (one ? t('oneLike') : t('nLikes', { n: x.n }))
    : (one ? t('oneRating') : t('nRatings', { n: x.n }));
}
function notifView() {
  const ic = { interest: '🙋', like: '♥', rating: '★' };
  const seen = S.notifSeen || new Set();
  const list = S.notifs === null ? `<p class="muted">${t('loading')}</p>`
    : S.notifs.length ? S.notifs.map((x) => `<button type="button" class="item notif ${seen.has(x.id) ? 'is-new' : ''}" data-act="goPost" data-id="${x.item_type}:${x.event_id || 'general'}">
        <span class="notif-ic" aria-hidden="true">${ic[x.kind]}</span>
        <span class="item-main"><b>${esc(notifText(x))}</b><span class="small muted">${t(TYPE_LABEL[x.item_type])}${x.label ? ' · ' + esc(x.label) : ''} · ${esc(ago(x.updated_at))}${seen.has(x.id) ? ` · <span class="chip match">${t('newBadge')}</span>` : ''}</span></span>${icon.chev}</button>`).join('')
      : `<p class="muted">${t('noNotifs')}</p>`;
  return `<div class="row between"><button type="button" class="text back" data-act="back">${icon.back}${t('back')}</button></div>
    <h1>${t('notifs')}</h1><div class="list">${list}</div>`;
}
async function loadMyRatings() {
  S.myRatings = {};
  if (!S.v11 || !S.user) return;
  const { data } = await sb.from('ratings').select('item_type, item_id').eq('rater', S.user.id).limit(1000);
  (data || []).forEach((r) => { S.myRatings[r.item_type + ':' + r.item_id] = true; });
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
    && (type === 'merch' || x.events));
  if (type !== 'merch') S.items[type].sort((a, b) => a.events.event_date.localeCompare(b.events.event_date));
  await Promise.all([loadProfiles(S.items[type].map((x) => x.user_id)), loadReactions(S.items[type].map((x) => type + ':' + x.id))]);
}
async function loadMine() {
  if (!S.user) { S.mine = null; return; }
  const uid = S.user.id;
  const [l, sw, bu, me, fr] = await Promise.all([
    sb.from('listings').select('id, kind, section, price, status, created_at, events(artist, city, venue, event_date, currency)').eq('user_id', uid).order('created_at', { ascending: false }),
    sb.from('swaps').select(ITEM_COLS.swap).eq('user_id', uid).order('created_at', { ascending: false }),
    sb.from('buddies').select(ITEM_COLS.buddy).eq('user_id', uid).order('created_at', { ascending: false }),
    sb.from('merch').select(ITEM_COLS.merch).eq('user_id', uid).order('created_at', { ascending: false }),
    S.v7 ? sb.from('freebies').select(ITEM_COLS.free).eq('user_id', uid).order('created_at', { ascending: false }) : Promise.resolve({ data: [] })
  ]);
  S.mine = [
    ...(l.data || []).map((x) => ({ type: 'listing', ...x })),
    ...(sw.data || []).map((x) => ({ type: 'swap', ...x })),
    ...(bu.data || []).map((x) => ({ type: 'buddy', ...x })),
    ...(me.data || []).map((x) => ({ type: 'merch', ...x })),
    ...(fr.data || []).map((x) => ({ type: 'free', ...x }))
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
  if (v === 'me') { await loadMine(); if (S.user) await loadProfiles([S.user.id]); } else await loadItems(v);
  if (v === 'merch' && S.v7) await loadItems('free');
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
  S.sort = 'new'; S.swapFilter = 'all'; S.buddyTag = null; S.mf = { kind: 'all', cat: null, member: null };
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
  if (S.view === 'merch' && S.v7 && !Array.isArray(S.items.free)) { await loadItems('free'); renderMain(); }
}
function tabHome(push = true) { if (S.view === 'board' || S.view === 'me' || S.view === 'u') return goHome(push); return setView(S.view, push); }
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
      ${bellBtn()}
      <button type="button" class="icon-btn" data-act="reloadPage" aria-label="${t('reload')}" title="${t('reload')}">↻</button>
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
  const google = GOOGLE_LOGIN && m !== 'reset'
    ? googleIdOn() ? `<div id="g-btn" class="g-box"></div>` : `<button type="button" class="primary big google" data-act="google"><span class="g-logo" aria-hidden="true">G</span>${t('google')}</button>` : '';
  if (google && !S.emailOpen) {
    return `<section class="panel stack" aria-label="${title}"><h2>${title}</h2>${google}
      <p class="small muted">${m === 'signup' ? t('agreeTerms') : ''}</p>
      <div class="row tight"><button type="button" class="text" data-act="emailOpen">${t('useEmail')}</button><button type="button" class="text" data-act="toggleLogin">${t('cancel')}</button></div></section>`;
  }
  return `<form data-form="login" class="panel" aria-label="${title}">
    <h2>${title}</h2>
    ${google}
    <label for="login-email" class="sr-only">${t('email')}</label>
    <input id="login-email" name="email" type="email" autocomplete="email" placeholder="${t('email')}" required>
    ${pw}
    ${flashFor('login')}
    ${captchaOn() ? '<div id="ts-box" class="captcha"></div>' : ''}
    ${m === 'signup' ? `<p class="muted small">${t('agreeTerms')}</p>` : ''}
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
        <button type="button" class="text" style="align-self:flex-start" data-act="addDate">${t('addDate')}</button>
      </fieldset>
      ${flashFor('create')}
      <div class="row"><button type="submit" class="primary">${t('createBtn')}</button><button type="button" class="text" data-act="cancelCreate">${t('cancel')}</button></div>
    </form>`
    : `<button type="button" class="text" data-act="openCreate">+ ${t('addMissing')}</button>`;
  const heads = { swap: ['navSwap', 'swapSub'], buddy: ['navBuddies', 'buddySub'], merch: ['navMerch', 'merchSub'], free: ['navFree', 'freeSub'] }[S.view];
  return `<section class="hero">
      <h1>${heads ? t(heads[0]) : t('hero')}</h1><p class="sub muted">${heads ? t(heads[1]) : t('heroSub')}</p>
      <div class="searchbox">${icon.search}<input id="q" type="search" aria-label="${t('searchPh')}" placeholder="${t('searchPh')}" value="${esc(S.q)}" autocomplete="off"></div>
    </section>
    <div id="results" class="list"></div>
    ${create}
    ${installCard()}`;
}

function installCard() {
  if (isStandalone()) return '';
  const later = store.get('installLaterAt', 0);
  if (later && Date.now() - later < 14 * 864e5) return '';
  let how = '';
  if (S.installPrompt) how = `<button type="button" class="primary" data-act="install">${t('installAdd')}</button>`;
  else if (isIOS) how = `<p class="small">${t('iosSteps').replace('{share}', icon.share)}</p>`;
  else if (isAndroid) how = `<p class="small">${esc(t('androidSteps'))}</p>`;
  else return '';
  return `<section class="install-card" aria-label="${t('installTitle')}">
    <img src="icon-192.png" width="52" height="52" alt="">
    <div class="install-text"><b>${t('installTitle')}</b><p class="small muted">${t('installBody')}</p>${S.installPrompt ? '' : how}</div>
    <div class="install-actions">${S.installPrompt ? how : ''}<button type="button" class="text small" data-act="installLater">${t('installLater')}</button></div>
  </section>`;
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
function countFor(e) { return S.view === 'board' ? (S.counts[e.id] || 0) : withFree(S.view, e.id).filter((x) => x.status !== 'done').length; }
function countLabel(n) { return S.view === 'board' ? t('availableN', { n }) : t('postsN', { n }); }

function showRow(g) {
  const e = g[0];
  const pending = g.some((x) => x.status === 'pending');
  const when = g.length === 1 ? fmtDate(e.event_date)
    : `${t('datesN', { n: g.length })} · ${shortDate(e.event_date)} – ${shortDate(g[g.length - 1].event_date)}`;
  const n = S.view === 'board' ? 0 : g.reduce((a, x) => a + countFor(x), 0);
  return `<button type="button" class="item" data-act="pick" data-id="${e.id}">
      <span class="item-main"><b>${fanName(e.artist)}</b><span class="muted">${esc(place(e))} · ${esc(when)}${pending ? ` · <span class="warn-text">${t('pendingReview')}</span>` : ''}</span></span>
      ${n ? `<span class="count-pill">${esc(countLabel(n))}</span>` : ''}${icon.chev}
    </button>`;
}

// One row per artist; tap to see their cities and dates
function artistGroups(list) {
  const map = new Map();
  list.forEach((e) => { const a0 = artistRow(e.artist); const a = parentOf(a0) || a0; const k = a ? 'a:' + a.id : 'n:' + e.artist.trim().toLowerCase(); if (!map.has(k)) map.set(k, []); map.get(k).push(e); });
  return [...map.entries()].map(([k, evs]) => ({ key: k, shows: groupShows(evs).sort((x, y) => x[0].event_date.localeCompare(y[0].event_date)) }))
    .sort((x, y) => x.shows[0][0].event_date.localeCompare(y.shows[0][0].event_date));
}
function artistBlock(a) {
  if (a.shows.length === 1) return showRow(a.shows[0]);
  const first = a.shows[0][0];
  const dates = a.shows.reduce((n, g) => n + g.length, 0);
  const root = a.key.startsWith('a:') ? S.artists.find((x) => 'a:' + x.id === a.key) : null;
  const names = new Set(a.shows.map((g) => g[0].artist.trim().toLowerCase()));
  const title = root ? (names.size > 1 || !names.has(root.name_en.toLowerCase()) ? `${fanName(root.name_en)} <span class="small muted">${t('andUnits')}</span>` : fanName(root.name_en)) : fanName(first.artist);
  const cities = new Set(a.shows.map((g) => cityKey(g[0].city))).size;
  const open = S.openArtist === a.key;
  return `<div class="artist-group ${open ? 'open' : ''}">
    <button type="button" class="item" data-act="openArtist" data-id="${esc(a.key)}" aria-expanded="${open}">
      <span class="item-main"><b>${title}</b><span class="muted">${esc(t('citiesDates', { c: cities, d: dates }))} · ${esc(t('nextOn', { d: shortDate(first.event_date) }))}</span></span>
      <span class="chev-rot" aria-hidden="true">${icon.chev}</span>
    </button>
    ${open ? `<div class="list sub-list">${a.shows.map(showRow).join('')}</div>` : ''}
  </div>`;
}
const PAGE_SIZE = 10;
function renderResults() {
  const box = document.getElementById('results');
  if (!box) return;
  if (!S.eventsLoaded) { box.innerHTML = `<p class="muted">${t('loading')}</p>`; return; }
  const q = S.q.trim().toLowerCase();
  const today = todayISO();
  const hit = (e) => !q || [artistAll(e.artist), cityAll(e.city), e.venue, e.event_date].join(' ').toLowerCase().includes(q);
  const matches = S.events.filter((e) => e.event_date >= today && hit(e));
  const pastList = S.events.filter((e) => e.event_date < today && hit(e)).sort((a, b) => b.event_date.localeCompare(a.event_date));
  const past = `<div class="past"><button type="button" class="text small past-toggle" data-act="togglePast" aria-expanded="${S.pastOpen}">${t('pastShows')} ${S.pastOpen ? '▴' : '▾'}</button>
    ${S.pastOpen ? (!S.pastLoaded ? `<p class="small muted">${t('loading')}</p>` : pastList.length ? `<div class="list past-list">${groupShows(pastList).slice(0, 30).map(showRow).join('')}</div>` : `<p class="small muted">${t('noEvents')}</p>`) : ''}</div>`;
  if (!matches.length && !(S.view === 'merch' && !q)) {
    box.innerHTML = `<p class="muted">${q ? esc(t('noResults', { q: S.q.trim() })) : t('noEvents')}</p>` + past;
    return;
  }
  if (S.pageQ !== q) { S.pageQ = q; S.page = 0; }
  const pager = (rows) => {
    const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const p = Math.min(S.page || 0, pages - 1);
    const nav = pages > 1 ? `<nav class="pager" aria-label="${t('pages')}">
        <button type="button" class="outline" data-act="page" data-id="${p - 1}" ${p === 0 ? 'disabled' : ''}>‹ ${t('prev')}</button>
        <span class="small muted">${esc(t('pageOf', { p: p + 1, n: pages }))}</span>
        <button type="button" class="outline" data-act="page" data-id="${p + 1}" ${p >= pages - 1 ? 'disabled' : ''}>${t('next')} ›</button></nav>` : '';
    return rows.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE).map(artistBlock).join('') + nav;
  };
  if (q) { box.innerHTML = pager(artistGroups(matches)) + past; return; }
  const tonight = matches.filter((e) => e.event_date === today);
  const later = matches.filter((e) => e.event_date !== today);
  const sd = tonight.length ? `<section class="showday" aria-label="${t('showDay')}">
      <p class="live">● ${t('showDay')}</p>
      ${tonight.map((e) => `<button type="button" class="sd-item" data-act="pick" data-id="${e.id}">
        <span class="item-main"><b>${fanName(e.artist)}</b><span>${esc(place(e))}${e.status === 'pending' ? ` · ${t('pendingReview')}` : ''}</span></span>
        <span class="sd-count">${esc(countLabel(countFor(e)))}</span>
      </button>`).join('')}
    </section>` : '';
  const general = S.view === 'merch' ? `<h2 class="list-title">${t('generalMerch')}</h2>
    <button type="button" class="item" data-act="pick" data-id="general"><span class="item-main"><b>${t('generalMerch')}</b></span>
      ${itemsFor('merch', 'general').length ? `<span class="count-pill">${esc(t('postsN', { n: itemsFor('merch', 'general').length }))}</span>` : ''}${icon.chev}</button>` : '';
  box.innerHTML = sd + (later.length ? `<h2 class="list-title">${t('upcoming')}</h2>` + pager(artistGroups(later)) : '') + general + past;
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
    <section class="event-head fan ${tonight ? 'showday' : ''}" style="${coverStyle(e.artist)}">
      ${tonight ? `<p class="live">● ${t('showDay')}</p>` : ''}
      <h1>${fanName(e.artist)}</h1>
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

const SORTERS = {
  new: (a, b) => b.created_at.localeCompare(a.created_at),
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  section: (a, b) => String(a.section || a.have || '').localeCompare(String(b.section || b.have || ''), undefined, { numeric: true })
};
function sortSelect(withPrice) {
  const opts = [['new', 'sortNew'], ...(withPrice ? [['low', 'sortLow'], ['high', 'sortHigh']] : []), ['section', 'sortSection']];
  return `<label class="sort"><span class="sr-only">${t('sortBy')}</span><select id="sort" aria-label="${t('sortBy')}">${opts.map(([k, l]) =>
    `<option value="${k}" ${S.sort === k ? 'selected' : ''}>${t(l)}</option>`).join('')}</select></label>`;
}
// Your own open listings decide which other listings fit your price
function priceFits(l) {
  if (!S.user || l.user_id === S.user.id || l.status !== 'open') return false;
  return S.listings.some((m) => m.user_id === S.user.id && m.status === 'open' && m.kind !== l.kind
    && (l.kind === 'sell' ? Number(l.price) <= Number(m.price) : Number(l.price) >= Number(m.price)));
}
function boardList() {
  const q = S.evQ.trim().toLowerCase();
  const shown = visibleListings().filter((l) => (S.tab === 'all' || l.kind === S.tab)
    && (!q || [l.section, l.note, l.meet_point].join(' ').toLowerCase().includes(q)))
    .sort(SORTERS[S.sort] || SORTERS.new)
    .sort((a, b) => (a.status === 'done') - (b.status === 'done'));
  return !S.listingsLoaded ? `<p class="muted">${t('loading')}</p>`
    : shown.length ? shown.map(listingCard).join('') : `<p class="muted empty">${q ? esc(t('noResults', { q: S.evQ.trim() })) : t('empty')}</p>`;
}

const BUDDY_TAGS = ['first', 'solo', 'cantonese', 'english', 'korean', 'mandarin', 'queue', 'eat', 'photo'];
const tagLabel = (k) => t('tag' + k[0].toUpperCase() + k.slice(1));
const CATS = ['photocard', 'lightstick', 'slogan', 'album', 'clothing', 'other'];
const catLabel = (k) => t('cat' + k[0].toUpperCase() + k.slice(1));
const MERCH_KINDS = { sale: 'wts', buy: 'wtb', swap: 'wtt' };
const CTA = { swap: 'swapCta', buddy: 'buddyCta', merch: 'merchCta', free: 'merchCta' };

// Your own open swaps at this concert, used to find matches
function mySwaps() {
  return S.user ? itemsFor('swap', S.selEv).filter((x) => x.user_id === S.user.id && x.status !== 'done') : [];
}
function swapMatch(it) {
  if (!S.user || it.user_id === S.user.id || it.status === 'done') return 0;
  let best = 0;
  mySwaps().forEach((m) => {
    if (fits(m.want, it.have)) best = Math.max(best, fits(it.want, m.have) ? 2 : 1);
  });
  return best;
}

function chipBtn(act, id, on, label) {
  return `<button type="button" class="fchip ${on ? 'on' : ''}" aria-pressed="${on}" data-act="${act}" data-id="${id}">${esc(label)}</button>`;
}
function filterBar(type) {
  const all = itemsFor(type, S.selEv);
  if (type === 'swap') {
    const seg = (k, label) => `<button type="button" class="${S.swapFilter === k ? 'on' : ''}" aria-pressed="${S.swapFilter === k}" data-act="swapFilter" data-id="${k}">${label}</button>`;
    return `<div class="row between filters"><div class="seg" role="group">${seg('all', t('all2'))}${seg('stand', t('fStanding'))}${seg('seat', t('fSeated'))}</div>${sortSelect(false)}</div>
      ${S.user && !mySwaps().length && all.length ? `<p class="small muted">${t('matchHint')}</p>` : ''}`;
  }
  if (type === 'buddy' && S.v7) {
    const used = BUDDY_TAGS.filter((k) => all.some((x) => (x.tags || []).includes(k)));
    return used.length ? `<div class="chips-row" role="group" aria-label="${t('fTags')}">${used.map((k) => chipBtn('buddyTag', k, S.buddyTag === k, tagLabel(k))).join('')}</div>` : '';
  }
  if (type === 'merch') {
    const seg = (k, label) => `<button type="button" class="${S.mf.kind === k ? 'on' : ''}" aria-pressed="${S.mf.kind === k}" data-act="mfKind" data-id="${k}">${label}</button>`;
    let html = `<div class="seg seg-scroll" role="group">${seg('all', t('all2'))}${seg('sale', 'WTS')}${seg('buy', 'WTB')}${seg('swap', 'WTT')}${S.v7 && S.selEv !== 'general' ? seg('free', '🎁 ' + t('navFree')) : ''}</div>`;
    if (S.v7) {
      const cats = CATS.filter((k) => all.some((x) => x.category === k));
      const members = [...new Map(all.filter((x) => x.member).map((x) => [x.member.trim().toLowerCase(), x.member.trim()])).values()].slice(0, 20);
      if (cats.length) html += `<div class="chips-row" role="group" aria-label="${t('fCategory')}">${cats.map((k) => chipBtn('mfCat', k, S.mf.cat === k, catLabel(k))).join('')}</div>`;
      if (members.length) html += `<div class="chips-row" role="group" aria-label="${t('fMember')}">${members.map((m) => chipBtn('mfMember', m, (S.mf.member || '').toLowerCase() === m.toLowerCase(), '♡ ' + m)).join('')}</div>`;
    }
    return html;
  }
  return '';
}

// The Merch tab also shows freebies for the same concert
function withFree(type, evId = S.selEv) {
  const list = itemsFor(type, evId);
  if (type !== 'merch' || !S.v7 || evId === 'general') return list;
  return [...list, ...itemsFor('free', evId).map((x) => ({ ...x, _t: 'free' }))];
}
function itemList(type) {
  const d = S.items[type];
  if (d === null) return `<p class="muted">${t('loading')}</p>`;
  if (d && d.error) return `<p class="muted empty">${t('errSetup')}</p>`;
  const q = S.evQ.trim().toLowerCase();
  let shown = withFree(type).filter((x) => !q
    || [x.have, x.want, x.note, x.title, x.details, x.member, x.what, x.place, x.meet_place].filter(Boolean).join(' ').toLowerCase().includes(q));
  if (type === 'swap') {
    if (S.swapFilter !== 'all') shown = shown.filter((x) => seatClass(x.have) === S.swapFilter);
    shown = shown.sort(SORTERS[S.sort === 'section' ? 'section' : 'new'])
      .sort((a, b) => swapMatch(b) - swapMatch(a))
      .sort((a, b) => (a.status === 'done') - (b.status === 'done'));
  }
  if (type === 'buddy' && S.buddyTag) shown = shown.filter((x) => (x.tags || []).includes(S.buddyTag));
  if (type === 'merch') {
    if (S.mf.kind !== 'all') shown = shown.filter((x) => (x._t === 'free' ? 'free' : x.kind) === S.mf.kind);
    if (S.mf.cat) shown = shown.filter((x) => x.category === S.mf.cat);
    if (S.mf.member) shown = shown.filter((x) => (x.member || '').trim().toLowerCase() === S.mf.member.toLowerCase());
  }
  if (type === 'merch' || type === 'free') shown = shown.sort(SORTERS.new).sort((a, b) => (a.status === 'done') - (b.status === 'done'));
  return shown.length ? shown.map((x) => itemCard(x._t || type, x, true)).join('')
    : `<p class="muted empty">${q ? esc(t('noResults', { q: S.evQ.trim() })) : t('noPosts')}</p>`;
}

function itemsEventView(type, e) {
  const n = withFree(type).filter((x) => x.status !== 'done').length;
  const head = e === 'general'
    ? `<div class="row between"><button type="button" class="text back" data-act="back">${icon.back}${t('back')}</button></div>
       <section class="event-head"><h1>${t('generalMerch')}</h1><p class="sub">${t('merchSub')}</p></section>`
    : eventHead(e, t('postsN', { n }));
  return `${head}
    ${evSearch(e === 'general' ? t('generalSearchPh') : t('evSearchPh'))}
    ${filterBar(type)}
    ${flashFor('list')}
    <div class="list" id="evlist">${itemList(type)}</div>
    ${e !== 'general' && e.event_date < todayISO() ? `<p class="small muted">${t('pastNote')}</p>` : S.composing ? composer(type) : `<div class="cta-bar">${flashFor('posted')}<button type="button" class="primary big" data-act="openCompose">${t(CTA[type])}</button></div>`}`;
}

function eventView(e) {
  const vis = visibleListings();
  const c = (s) => vis.filter((l) => l.status === s).length;
  const seg = (k, label) => `<button type="button" class="${S.tab === k ? 'on' : ''}" aria-pressed="${S.tab === k}" data-act="tab" data-id="${k}">${label}</button>`;
  return `${eventHead(e, t('statsLine', { a: c('open'), m: c('meeting'), d: c('done') }))}
    ${evSearch(t('evSearchPh'))}
    <div class="row between filters"><div class="seg" role="group">${seg('all', t('all'))}${seg('sell', t('has'))}${seg('buy', t('needs'))}</div>${sortSelect(true)}</div>
    ${flashFor('list')}
    <div class="list" id="evlist">${boardList()}</div>
    ${e.event_date < todayISO() ? `<p class="small muted">${t('pastNote')}</p>` : postArea(e)}`;
}

function listingCard(l) {
  const sell = l.kind === 'sell';
  const mine = S.user && l.user_id === S.user.id;
  const contact = S.contacts[l.id];
  const n = String(l.qty);
  const ev = S.events.find((x) => x.id === l.event_id) || {};
  const stale = l.status === 'open' && isStale(l.created_at, ev.event_date);
  const off = sell && l.original_price > 0 ? Math.round((1 - l.price / l.original_price) * 100) : 0;
  const extra = (priceFits(l) ? `<span class="chip match">${t('priceMatch')}</span>` : '')
    + (off >= 5 ? `<span class="chip deal">${esc(t('belowFace', { p: off }))}</span>` : '')
    + (stale ? `<span class="chip stale">${t('maybeSold')}</span>` : '');
  const status = l.status === 'meeting' ? `<span class="chip meeting">${t('stMeeting')}</span>` : l.status === 'done' ? `<span class="chip done">${t('stDone')}</span>` : '';
  let main = '', menu = '';
  if (mine) {
    if (l.status !== 'done') main = `<button type="button" class="outline" data-act="advance" data-id="${l.id}">${l.status === 'open' ? t('markMeeting') : t('confirmTransfer')}</button>`;
    if (l.status !== 'open') main += `<button type="button" class="text" data-act="undo" data-id="${l.id}">${t('undoStep')}</button>`;
    menu = `<button type="button" class="menu-item danger" data-act="del" data-id="${l.id}">${t('del')}</button>`;
  } else {
    main = S.user
      ? `<button type="button" class="outline" data-act="contact" data-id="${l.id}" aria-expanded="${!!contact}">${contact ? t('hide') : t('contact')}</button>`
      : `<button type="button" class="outline" data-act="toggleLogin">${t('contact')}</button>`;
    menu = `<button type="button" class="menu-item" data-act="report" data-id="${l.id}" ${S.reported[l.id] ? 'disabled' : ''}>${S.reported[l.id] ? t('reported') : t('report')}</button>`
      + (S.user ? `<button type="button" class="menu-item danger" data-act="block" data-id="${l.user_id}">${t('block')}</button>` : '');
  }
  const rb = rateBlock('listing:' + l.id, l.user_id, l.status, sell);
  const rx = reactBits('listing:' + l.id, l.user_id, l.status);
  return `<article class="listing ${l.status === 'done' ? 'is-done' : ''}${stale ? ' is-stale' : ''}">
    <div class="listing-top">
      <div class="listing-info">
        <div class="row tight"><span class="chip ${sell ? 'sell' : 'buy'}">${sell ? t('has') : t('needs')}</span>${status}${mine ? `<span class="chip mine">${t('yours')}</span>` : ''}${extra}${rx.chip}</div>
        <h3>${esc(l.section)}</h3>${l.note ? `<p class="desc">${esc(l.note)}</p>` : ''}
        <p class="muted small">${esc(t(n === '1' ? 'qty1' : 'qtyN', { n }))} · ${esc(l.meet_point)}</p>
        <p class="muted small time">${esc(postedAt(l.created_at))}</p>
      </div>
      <div class="stack-r"><div class="price">${sell ? '' : `<span class="small muted">${t('upTo')} </span>`}${fmtMoney(l.price, ev.currency)}</div>${photo(l.photo_url)}</div>
    </div>
    <div class="row">
      ${main}${author(l.user_id)}${rb.btn}${rx.btns}
      <details class="menu"><summary aria-label="${t('more')}" title="${t('more')}">${icon.dots}</summary><div class="menu-pop">${menu}</div></details>
    </div>
    ${contact ? `<p class="note info"><b>${esc(contact)}</b><br>${t('payAfter')}</p>` : ''}
    ${rb.form}
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
    ${S.v8 ? `<div class="field"><label for="p-photo">${t('fPhoto')}</label><input id="p-photo" name="photo" type="file" accept="image/*"><p class="small muted">${t('photoTicketHint')}</p></div>` : ''}
    <div class="check"><input id="p-confirm" name="confirm" type="checkbox" required><label for="p-confirm">${sell ? t('confirmSell') : t('confirmBuy')}</label></div>
    ${flashFor('post')}
    <button type="submit" class="primary big">${t('submit')}</button>
  </form>`;
}

function tabBar() {
  const tabs = [['board', 'navBoard'], ['swap', 'navSwap'], ['buddy', 'navBuddies'], ['merch', 'navMerch'], ['me', 'navMe']];
  const ic = { board: icon.board, swap: icon.swap, buddy: icon.buddies, merch: icon.merch, free: icon.gift, me: icon.me };
  return `<nav class="tabbar" aria-label="Sections">${tabs.map(([v, k]) =>
    `<button type="button" data-act="nav" data-id="${v}" ${S.view === v ? 'aria-current="page" class="on"' : ''}>${ic[v]}<span>${t(k)}</span></button>`).join('')}</nav>`;
}

function evName(ev) { return ev ? `${artistLabel(ev.artist)} · ${place(ev)} · ${fmtDate(ev.event_date)}` : ''; }

function photo(url) {
  return url && /^https:\/\//.test(url) ? `<a class="photo" href="${esc(url)}" target="_blank" rel="noopener"><img src="${esc(url)}" alt="" loading="lazy"></a>` : '';
}
const whenWhere = (time, where) => (time || where)
  ? `<p class="small meet">${time ? `<span>🕔 ${esc(time)}</span>` : ''}${where ? `<span>📍 ${esc(where)}</span>` : ''}</p>` : '';

function itemCard(type, it, inEvent) {
  const mine = S.user && it.user_id === S.user.id;
  const key = type + ':' + it.id;
  const contact = S.contacts[key];
  const done = it.status === 'done';
  const evLine = inEvent || !it.events ? '' : `<p class="muted small">${esc(evName(it.events))}</p>`;
  let body = '', chips = '', stale = false;
  if (type === 'swap') {
    const m = inEvent ? swapMatch(it) : 0;
    stale = !done && it.events && isStale(it.created_at, it.events.event_date);
    chips = (m === 2 ? `<span class="chip match">${t('perfectMatch')}</span>` : m === 1 ? `<span class="chip deal">${t('maybeMatch')}</span>` : '')
      + (stale ? `<span class="chip stale">${t('maybeSwapped')}</span>` : '');
    body = `${evLine}
      <div class="swap-row"><div><span class="small muted">${t('hasLabel')}</span><b>${esc(it.have)}</b></div>${icon.swap}<div><span class="small muted">${t('wantsLabel')}</span><b>${esc(it.want)}</b></div></div>
      ${it.note ? `<p class="desc">${esc(it.note)}</p>` : ''}${photo(it.photo_url)}`;
  } else if (type === 'buddy') {
    const tags = (it.tags || []).filter((k) => BUDDY_TAGS.includes(k));
    body = `${evLine}<p>${esc(it.note)}</p>
      ${tags.length ? `<div class="row tight">${tags.map((k) => `<span class="chip tag">${esc(tagLabel(k))}</span>`).join('')}</div>` : ''}
      ${whenWhere(it.meet_time, it.meet_place)}${photo(it.photo_url)}`;
  } else if (type === 'free') {
    body = `${evLine}<div class="listing-top"><div class="listing-info"><h3>🎁 ${esc(it.what)}</h3>
        ${it.details ? `<p class="desc">${esc(it.details)}</p>` : ''}${whenWhere(it.give_time, it.place)}</div>${photo(it.photo_url)}</div>`;
  } else {
    const k = MERCH_KINDS[it.kind] || 'wtt';
    const cls = it.kind === 'sale' ? 'sell' : it.kind === 'buy' ? 'buy' : 'tag';
    const meta = [it.category && CATS.includes(it.category) ? catLabel(it.category) : '', it.member ? '♡ ' + it.member : ''].filter(Boolean);
    body = `<div class="listing-top"><div class="listing-info">
        <div class="row tight"><span class="chip ${cls}">${t(k)}</span>${meta.map((x) => `<span class="chip tag">${esc(x)}</span>`).join('')}</div>
        <h3>${esc(it.title)}</h3>${it.details ? `<p class="desc">${esc(it.details)}</p>` : ''}${it.events && !inEvent ? `<p class="muted small">${esc(evName(it.events))}</p>` : ''}</div>
        <div class="stack-r">${it.price != null && it.kind !== 'swap' ? `<div class="price">${it.kind === 'buy' ? `<span class="small muted">${t('upTo')} </span>` : ''}${fmtMoney(it.price, it.events && it.events.currency)}</div>` : ''}${photo(it.photo_url)}</div></div>`;
  }
  let main = '', menu = '';
  if (mine) {
    if (type !== 'buddy' && !done) main = `<button type="button" class="outline" data-act="itemDone" data-id="${key}">${type === 'free' ? t('markAllGone') : t('markDone')}</button>`;
    if (type !== 'buddy' && done) main = `<button type="button" class="text" data-act="itemUndo" data-id="${key}">${t('undoStep')}</button>`;
    menu = `<button type="button" class="menu-item danger" data-act="itemDel" data-id="${key}">${t('del')}</button>`;
  } else {
    if (type !== 'free') main = S.user
      ? `<button type="button" class="outline" data-act="itemContact" data-id="${key}" aria-expanded="${!!contact}">${contact ? t('hide') : t('contact')}</button>`
      : `<button type="button" class="outline" data-act="toggleLogin">${t('contact')}</button>`;
    menu = `<button type="button" class="menu-item" data-act="itemReport" data-id="${key}" ${S.reported[key] ? 'disabled' : ''}>${S.reported[key] ? t('reported') : t('report')}</button>`
      + (S.user ? `<button type="button" class="menu-item danger" data-act="block" data-id="${it.user_id}">${t('block')}</button>` : '');
  }
  const doneLabel = type === 'free' ? t('allGone') : t('doneLabel');
  const rb = rateBlock(type + ':' + it.id, it.user_id, it.status, type === 'swap' || (type === 'merch' && it.kind !== 'buy'));
  const rx = reactBits(type + ':' + it.id, it.user_id, it.status);
  chips += rx.chip;
  return `<article class="listing ${done ? 'is-done' : ''}${stale ? ' is-stale' : ''}">
    ${mine || done || chips ? `<div class="row tight">${done ? `<span class="chip done">${doneLabel}</span>` : ''}${mine ? `<span class="chip mine">${t('yours')}</span>` : ''}${chips}</div>` : ''}
    ${body}
    <div class="row">${main}${author(it.user_id)}${rb.btn}${rx.btns}<details class="menu"><summary aria-label="${t('more')}" title="${t('more')}">${icon.dots}</summary><div class="menu-pop">${menu}</div></details></div>
    ${contact ? `<p class="note info"><b>${esc(contact)}</b>${type === 'merch' ? `<br>${t('footRule')}` : ''}</p>` : ''}
    ${rb.form}
    <p class="small muted time">${esc(postedAt(it.created_at))}</p>
  </article>`;
}

function eventOptions(noPreselect) {
  const today = todayISO();
  const list = S.events.filter((e) => e.event_date >= today);
  return list.map((e) => `<option value="${e.id}" ${!noPreselect && e.id === S.selEvForm ? 'selected' : ''}>${esc(artistLabel(e.artist))} · ${esc(place(e))} · ${esc(fmtDate(e.event_date))}</option>`).join('');
}

const photoField = (on = S.v7, hint = '') => on ? `<div class="field"><label for="c-photo">${t('fPhoto')}</label><input id="c-photo" name="photo" type="file" accept="image/*">${hint ? `<p class="small muted">${hint}</p>` : ''}</div>` : '';

function composer(type) {
  const ev = S.events.find((x) => x.id === S.selEv);
  // Merch and freebies share one tab: "Freebie" is a fourth kind next to WTS / WTB / WTT
  const canFree = type === 'merch' && S.v7 && !!ev;
  const k = S.merchKind === 'free' && !canFree ? 'sale' : S.merchKind;
  const kindSeg = type !== 'merch' ? '' : `<div class="seg seg-scroll" role="group">${(S.v7 ? ['sale', 'buy', 'swap', ...(canFree ? ['free'] : [])] : ['swap', 'sale']).map((x) =>
      `<button type="button" class="${k === x ? 'on' : ''}" aria-pressed="${k === x}" data-act="merchKind" data-id="${x}">${x === 'free' ? '🎁 ' + t('navFree') : S.v7 ? t(MERCH_KINDS[x]) : x === 'sale' ? t('forSale') : t('forSwap')}</button>`).join('')}</div>`;
  if (type === 'merch' && k === 'free') type = 'free';
  const pickEv = ev ? `<div class="field"><span style="font-size:14px;font-weight:500">${t('postTo')}</span><div class="note info">${esc(evName(ev))}</div>
      <input type="hidden" name="${type === 'merch' ? 'mevent' : 'event'}" value="${ev.id}"></div>` : '';
  let fields = '', confirm = '';
  if (type === 'swap') {
    fields = `<div class="grid2">
      <div class="field"><label for="c-have">${t('fHave')}</label><input id="c-have" name="have" maxlength="80" placeholder="${t('phHave')}" required></div>
      <div class="field"><label for="c-want">${t('fWant')}</label><input id="c-want" name="want" maxlength="80" placeholder="${t('phWant')}" required></div></div>
      ${S.v5 ? `<div class="field"><label for="c-desc">${t('fDesc')}</label><textarea id="c-desc" name="desc" rows="2" maxlength="200" placeholder="${t('phDescSwap')}"></textarea></div>` : ''}
      ${photoField(S.v8, t('photoTicketHint'))}`;
    confirm = t('confirmSwap');
  } else if (type === 'buddy') {
    fields = `<div class="field"><label for="c-note">${t('fNote')}</label><input id="c-note" name="note" maxlength="140" placeholder="${t('phNote')}" required></div>
      ${S.v7 ? `<fieldset class="tag-pick"><legend>${t('fTags')}</legend><div class="chips-row">${BUDDY_TAGS.map((k) =>
        `<label class="fchip-check"><input type="checkbox" name="tags" value="${k}"><span>${esc(tagLabel(k))}</span></label>`).join('')}</div></fieldset>
      <div class="grid2">
        <div class="field"><label for="c-mtime">${t('fMeetTime')}</label><input id="c-mtime" name="meet_time" maxlength="40" placeholder="${t('phMeetTime')}"></div>
        <div class="field"><label for="c-mplace">${t('fMeetPlace')}</label><input id="c-mplace" name="meet_place" maxlength="80" placeholder="${t('phMeetPlace')}"></div></div>` : ''}
      ${photoField(S.v8)}`;
  } else if (type === 'free') {
    fields = `${kindSeg}<div class="field"><label for="c-what">${t('fWhat')}</label><input id="c-what" name="what" maxlength="80" placeholder="${t('phWhat')}" required></div>
      <div class="grid2">
        <div class="field"><label for="c-gtime">${t('fGiveTime')}</label><input id="c-gtime" name="give_time" maxlength="40" placeholder="${t('phGiveTime')}"></div>
        <div class="field"><label for="c-place">${t('fPlace')}</label><input id="c-place" name="place" maxlength="80" placeholder="${t('phPlace')}"></div></div>
      <div class="field"><label for="c-details">${t('freeDetails')}</label><textarea id="c-details" name="details" rows="2" maxlength="200" placeholder="${t('phFreeDetails')}"></textarea></div>
      ${photoField()}`;
  } else {
    const cur = ev ? ev.currency : 'GBP';
    fields = `${kindSeg}
      <div class="grid2">
        <div class="field"><label for="c-title">${t('fTitle')}</label><input id="c-title" name="title" maxlength="80" placeholder="${t('phTitle')}" required></div>
        ${k === 'sale' ? `<div class="field"><label for="c-price">${t('fPrice', { c: curSym(cur) })}</label><input id="c-price" name="price" inputmode="decimal" required></div>`
          : k === 'buy' ? `<div class="field"><label for="c-price">${t('fBudget', { c: curSym(cur) })}</label><input id="c-price" name="price" inputmode="decimal"></div>` : ''}</div>
      ${S.v7 ? `<div class="grid2">
        <div class="field"><label for="c-cat">${t('fCategory')}</label><select id="c-cat" name="category">${CATS.map((c) => `<option value="${c}" ${S.merchCat === c ? 'selected' : ''}>${esc(catLabel(c))}</option>`).join('')}</select></div>
        <div class="field"><label for="c-member">${t('fMember')}</label><input id="c-member" name="member" maxlength="40" placeholder="${t('phMember')}"></div></div>` : ''}
      <div class="field"><label for="c-details">${t('fDetails')}</label><textarea id="c-details" name="details" rows="2" maxlength="200" placeholder="${t('phDetails')}"></textarea></div>
      ${photoField()}`;
    confirm = t('confirmMerch');
  }
  return `<form data-form="item" data-type="${type}" class="panel" aria-label="${t(CTA[type])}">
    <div class="row between"><h2>${t(CTA[type])}</h2><button type="button" class="text" data-act="closeCompose">${t('cancel')}</button></div>
    ${pickEv}${fields}
    ${type === 'free' ? '' : `<div class="field"><label for="c-contact">${t('fHandle')}</label><input id="c-contact" name="contact" maxlength="60" placeholder="${t('phHandle')}" required></div>`}
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

// ---------- Profiles (nickname + animal avatar drawn with emoji, no uploads) ----------
const ANIMALS = { rabbit: '🐰', bear: '🐻', cat: '🐱', dog: '🐶', fox: '🦊', panda: '🐼', koala: '🐨', tiger: '🐯', lion: '🦁',
  hamster: '🐹', frog: '🐸', penguin: '🐧', chick: '🐥', pig: '🐷', cow: '🐮', mouse: '🐭', wolf: '🐺', monkey: '🐵',
  unicorn: '🦄', otter: '🦦', seal: '🦭', sloth: '🦥', hedgehog: '🦔', owl: '🦉', dolphin: '🐬', whale: '🐳', turtle: '🐢',
  octopus: '🐙', squirrel: '🐿️', duck: '🦆', swan: '🦢', butterfly: '🦋', bee: '🐝', dino: '🦕', dragon: '🐲', deer: '🦌',
  raccoon: '🦝', bat: '🦇', parrot: '🦜', flamingo: '🦩' };
const AV_BG = { pink: '#FFC7DC', lilac: '#E4D7FF', blue: '#CFE6FF', mint: '#CDEFE0', butter: '#FFF0A8', peach: '#FFD8C2', gray: '#E6E6EE', black: '#2B2433' };
const uidHash = (id) => { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
function profileOf(uid) {
  const p = S.profiles[uid] || {};
  const keys = Object.keys(ANIMALS), bgs = Object.keys(AV_BG), h = uidHash(uid);
  return {
    nickname: p.nickname || t('fanN', { n: String(uid).slice(0, 4) }),
    avatar: ANIMALS[p.avatar] ? p.avatar : keys[h % keys.length],
    bg: AV_BG[p.avatar_bg] ? p.avatar_bg : bgs[h % (bgs.length - 1)],
    since: p.created_at || null
  };
}
const avatarEl = (av, bg, size = 28) => `<span class="avatar" style="--av:${AV_BG[bg]};--s:${size}px" aria-hidden="true">${ANIMALS[av]}</span>`;
function author(uid) {
  if (!S.v9 || !uid) return '';
  const p = profileOf(uid);
  const sc = S.scores[uid];
  return `<button type="button" class="author" data-act="profile" data-id="${uid}">${avatarEl(p.avatar, p.bg, 24)}<span>${esc(p.nickname)}</span>${sc && sc.n ? `<span class="score" title="${esc(sc.n === 1 ? t('rating1') : t('ratingsN', { n: sc.n }))}">★${sc.avg.toFixed(1)}</span>` : ''}</button>`;
}
// "Interested" and ♡ like (key = "listing:<id>", "swap:<id>", ...)
function reactBits(key, ownerId, status) {
  if (!S.v12) return { btns: '', chip: '' };
  const c = S.reacts[key] || { asks: 0, likes: 0 };
  const mine = S.user && S.user.id === ownerId;
  const type = key.slice(0, key.indexOf(':'));
  const open = !status || status === 'open';
  const chip = c.asks && open && type !== 'buddy' ? `<span class="chip asked">🙋 ${esc(c.asks === 1 ? t('oneAsked') : t('nAsked', { n: c.asks }))}</span>` : '';
  const liked = !!S.myReacts['like:' + key];
  const like = mine
    ? (c.likes ? `<span class="react-n" title="${t('likeIt')}">♡ ${c.likes}</span>` : '')
    : `<button type="button" class="react ${liked ? 'on' : ''}" data-act="react" data-id="like:${key}" aria-pressed="${liked}" title="${liked ? t('unlikeIt') : t('likeIt')}" aria-label="${liked ? t('unlikeIt') : t('likeIt')}">${liked ? '♥' : '♡'}${c.likes ? ` ${c.likes}` : ''}</button>`;
  const asked = !!S.myReacts['ask:' + key];
  const ask = !mine && open && type !== 'buddy'
    ? `<button type="button" class="react ${asked ? 'on' : ''}" data-act="react" data-id="ask:${key}" aria-pressed="${asked}">${asked ? '✓ ' + t('asked') : '🙋 ' + t('stillAvail')}</button>` : '';
  return { btns: ask + like, chip };
}
const starLine = (n) => `<span class="stars" aria-label="${esc(t('stars', { n }))}">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`;
// Rate button and inline form for a finished trade (key = "listing:<id>", "merch:<id>" or "swap:<id>")
function rateBlock(key, ownerId, status, canRate) {
  if (!S.v11 || !canRate || !S.user || S.user.id === ownerId) return { btn: '', form: '' };
  if (!['meeting', 'done'].includes(status)) return { btn: '', form: '' };
  if (S.myRatings[key]) return { btn: `<span class="chip done">★ ${t('rated')}</span>`, form: '' };
  if (!S.myReacts['ask:' + key]) return { btn: '', form: '' };
  const btn = `<button type="button" class="text" data-act="rate" data-id="${key}" aria-expanded="${S.rating === key}">★ ${key.startsWith('listing') || key.startsWith('merch') ? t('rateSeller') : t('rateTrader')}</button>`;
  if (S.rating !== key) return { btn, form: '' };
  const pick = S.ratingPick;
  const form = `<form data-form="rate" data-id="${key}" class="panel stack" style="gap:10px" aria-label="${t('rateTitle')}">
      <b>${t('rateTitle')}</b>
      <div class="rate-pick" role="radiogroup" aria-label="${t('rateTitle')}">${[1, 2, 3, 4, 5].map((n) =>
        `<label class="${n <= pick ? 'on' : ''}" data-act="ratePick" data-id="${n}"><input type="radio" name="score" value="${n}" ${n === pick ? 'checked' : ''}><span aria-hidden="true">★</span><span class="sr-only">${esc(t('stars', { n }))}</span></label>`).join('')}</div>
      <div class="field"><label for="r-c">${t('rateComment')}</label><input id="r-c" name="comment" maxlength="200" placeholder="${t('phRateComment')}"></div>
      <p class="small muted">${t('rateHint')}</p>
      ${flashFor('rate')}
      <div class="row"><button type="submit" class="primary">${t('rateSubmit')}</button><button type="button" class="text" data-act="rate" data-id="${key}">${t('cancel')}</button></div>
    </form>`;
  return { btn, form };
}
async function loadProfiles(ids) {
  if (!S.v9) return;
  const need = [...new Set(ids.filter((id) => id && !(id in S.profiles)))];
  if (!need.length) return;
  const [{ data }, sc] = await Promise.all([
    sb.from('profiles').select('id, nickname, avatar, avatar_bg, created_at').in('id', need),
    S.v11 ? sb.from('seller_scores').select('user_id, n, avg').in('user_id', need) : Promise.resolve({ data: [] })
  ]);
  need.forEach((id) => { S.profiles[id] = null; });
  (data || []).forEach((p) => { S.profiles[p.id] = p; });
  ((sc && sc.data) || []).forEach((r) => { S.scores[r.user_id] = { n: r.n, avg: Number(r.avg) }; });
}
async function openProfile(uid, push = true) {
  S.view = 'u'; S.profileId = uid; S.selEv = null; S.flash = null; S.profilePosts = null; S.profileRatings = null;
  if (S.channel) { sb.removeChannel(S.channel); S.channel = null; }
  if (push) history.pushState({ v: 'u', id: uid }, '', location.pathname + '?v=u&id=' + uid);
  render(); window.scrollTo(0, 0);
  await loadProfiles([uid]);
  const cnt = (tb) => sb.from(tb).select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('status', 'done');
  const [l, sw, bu, me, fr, c1, c2, c3] = await Promise.all([
    sb.from('listings').select('id, kind, section, price, status, hidden, created_at, event_id, events(artist, city, venue, event_date, currency)').eq('user_id', uid).neq('status', 'done').order('created_at', { ascending: false }).limit(50),
    sb.from('swaps').select(ITEM_COLS.swap).eq('user_id', uid).eq('status', 'open').limit(50),
    sb.from('buddies').select(ITEM_COLS.buddy).eq('user_id', uid).limit(50),
    sb.from('merch').select(ITEM_COLS.merch).eq('user_id', uid).eq('status', 'open').limit(50),
    S.v7 ? sb.from('freebies').select(ITEM_COLS.free).eq('user_id', uid).eq('status', 'open').limit(50) : Promise.resolve({ data: [] }),
    cnt('listings'), cnt('swaps'), cnt('merch')
  ]);
  const today = todayISO();
  const live = (x) => !x.hidden && (!x.events || x.events.event_date >= today);
  S.profilePosts = [
    ...(l.data || []).map((x) => ({ type: 'listing', ...x })), ...(sw.data || []).map((x) => ({ type: 'swap', ...x })),
    ...(bu.data || []).map((x) => ({ type: 'buddy', ...x })), ...(me.data || []).map((x) => ({ type: 'merch', ...x })),
    ...(fr.data || []).map((x) => ({ type: 'free', ...x }))
  ].filter(live).sort((a, b) => b.created_at.localeCompare(a.created_at));
  S.profileDone = [c1, c2, c3].reduce((a, r) => a + (r && r.count ? r.count : 0), 0);
  if (S.v11) {
    const { data: rs } = await sb.from('ratings').select('id, rater, score, comment, created_at').eq('ratee', uid).order('created_at', { ascending: false }).limit(30);
    S.profileRatings = rs || [];
    await loadProfiles(S.profileRatings.map((r) => r.rater));
  }
  renderMain();
}
const TYPE_LABEL = { listing: 'typeListing', swap: 'typeSwap', buddy: 'typeBuddy', merch: 'typeMerch', free: 'typeFree' };
const describePost = (x) => x.type === 'listing' ? `${x.kind === 'sell' ? t('has') : t('needs')} · ${x.section} · ${fmtMoney(x.price, x.events && x.events.currency)}`
  : x.type === 'swap' ? `${x.have} → ${x.want}` : x.type === 'buddy' ? x.note : x.type === 'free' ? x.what : x.title;
function profileView() {
  const uid = S.profileId;
  const p = profileOf(uid);
  const mine = S.user && S.user.id === uid;
  const since = p.since ? new Date(p.since).toLocaleDateString(LOCALES[S.lang], { year: 'numeric', month: 'short' }) : '';
  const posts = S.profilePosts === null ? `<p class="muted">${t('loading')}</p>`
    : S.profilePosts.length ? S.profilePosts.map((x) => `<button type="button" class="item" data-act="goPost" data-id="${x.type}:${x.event_id || 'general'}">
        <span class="item-main"><span class="small muted">${t(TYPE_LABEL[x.type])}${x.events ? ' · ' + esc(evName(x.events)) : ''}</span><b>${esc(describePost(x))}</b></span>${icon.chev}</button>`).join('')
      : `<p class="muted">${t('noPosts')}</p>`;
  return `<div class="row between"><button type="button" class="text back" data-act="back">${icon.back}${t('back')}</button></div>
    <section class="profile-head">${avatarEl(p.avatar, p.bg, 72)}
      <div><h1>${esc(p.nickname)}</h1>
      <p class="small muted">${since ? esc(t('memberSince', { d: since })) + ' · ' : ''}${S.profilePosts === null ? '' : esc(t('doneTrades', { n: S.profileDone || 0 }))}</p></div></section>
    ${mine ? `<button type="button" class="outline" data-act="nav" data-id="me">${t('editProfile')}</button>` : ''}
    ${ratingsSection(uid)}
    <h2 class="list-title">${t('activePosts')}</h2>
    <div class="list">${posts}</div>`;
}
function ratingsSection(uid) {
  if (!S.v11 || S.profileRatings === null) return '';
  const sc = S.scores[uid];
  const head = sc && sc.n ? `<p class="row tight">${starLine(Math.round(sc.avg))}<b>${sc.avg.toFixed(1)}</b><span class="small muted">${esc(sc.n === 1 ? t('rating1') : t('ratingsN', { n: sc.n }))}</span></p>` : '';
  const list = S.profileRatings.length ? S.profileRatings.map((r) => `<div class="review">
      <div class="row between">${author(r.rater)}${starLine(r.score)}</div>
      ${r.comment ? `<p>${esc(r.comment)}</p>` : ''}<p class="small muted">${esc(ago(r.created_at))}</p></div>`).join('')
    : `<p class="muted">${t('noRatings')}</p>`;
  return `<h2 class="list-title">${t('reviews')}</h2>${head}<div class="panel" style="padding:4px 16px">${list}</div>`;
}
function profileEditor() {
  if (!S.v9 || !S.user) return '';
  const p = profileOf(S.user.id);
  const av = S.pickAv || p.avatar, bg = S.pickBg || p.bg;
  return `<form data-form="profile" class="panel stack" style="gap:12px" aria-label="${t('myProfile')}">
    <div class="row">${avatarEl(av, bg, 56)}<div class="field" style="flex:1"><label for="pf-nick">${t('nickname')}</label>
      <input id="pf-nick" name="nickname" maxlength="24" value="${esc(S.draftNick != null ? S.draftNick : (S.profiles[S.user.id] && S.profiles[S.user.id].nickname) || '')}" placeholder="${esc(p.nickname)}"></div></div>
    <p class="small muted">${t('nickHint')}</p>
    <div class="av-grid" role="group" aria-label="${t('pickAvatar')}">${Object.entries(ANIMALS).map(([k, e]) =>
      `<button type="button" class="av-pick ${k === av ? 'on' : ''}" aria-pressed="${k === av}" aria-label="${k}" data-act="pickAv" data-id="${k}">${e}</button>`).join('')}</div>
    <div class="row tight" role="group" aria-label="${t('pickColor')}">${Object.entries(AV_BG).map(([k, c]) =>
      `<button type="button" class="bg-pick ${k === bg ? 'on' : ''}" aria-pressed="${k === bg}" aria-label="${k}" style="--av:${c}" data-act="pickBg" data-id="${k}"></button>`).join('')}</div>
    ${flashFor('profile')}
    <div class="row"><button type="submit" class="primary">${t('saveProfile')}</button>
      <button type="button" class="text" data-act="profile" data-id="${S.user.id}">${t('viewProfile')}</button></div>
  </form>`;
}

function meView() {
  if (!S.user) {
    return `<section class="event-head"><h1>${t('navMe')}</h1><p class="sub">${t('needLoginMe')}</p></section>
      <button type="button" class="primary big" data-act="toggleLogin">${t('login')}</button>
      ${installCard()}
      ${themePicker()}
      ${feedbackBox()}`;
  }
  const typeLabel = { listing: 'typeListing', swap: 'typeSwap', buddy: 'typeBuddy', merch: 'typeMerch', free: 'typeFree' };
  const describe = (x) => x.type === 'listing' ? `${x.section} · ${fmtMoney(x.price, x.events && x.events.currency)}`
    : x.type === 'swap' ? `${x.have} → ${x.want}` : x.type === 'buddy' ? x.note : x.type === 'free' ? x.what : x.title;
  const posts = S.mine === null ? `<p class="muted">${t('loading')}</p>`
    : S.mine.length ? S.mine.map((x) => `<div class="mine-row">
        <div class="item-main"><span class="small muted">${t(typeLabel[x.type])}${x.events ? ' · ' + esc(evName(x.events)) : ''}</span><b>${esc(describe(x))}</b>
          ${x.hidden ? `<span class="small warn-text">${t('reported')}</span>` : ''}</div>
        <button type="button" class="text danger" data-act="mineDel" data-id="${x.type}:${x.id}">${t('del')}</button>
      </div>`).join('') : `<p class="muted">${t('noPosts')}</p>`;
  return `<section class="event-head"><h1>${t('navMe')}</h1><p class="sub">${t('loggedInAs')} ${esc(S.user.email)}</p></section>
    ${flashFor('me')}
    ${S.isAdmin ? `<a class="outline-link" href="admin.html">${t('adminPage')}</a>` : ''}
    ${profileEditor()}
    <h2 class="list-title">${t('myPosts')}</h2>
    <div class="list">${posts}</div>
    <details class="panel collapse"><summary>${t('changePw')}</summary>
      <form data-form="changepw" class="stack" style="gap:12px;margin-top:12px">
        <input name="password" type="password" autocomplete="new-password" minlength="8" placeholder="${t('pwHint')}" aria-label="${t('password')}" required>
        <button type="submit" class="primary">${t('savePw')}</button>
      </form>
    </details>
    ${installCard()}
    ${themePicker()}
    ${feedbackBox()}
    ${S.blocked.length ? `<div class="row between"><span class="muted">${esc(t('blockedN', { n: S.blocked.length }))}</span><button type="button" class="text" data-act="unblockAll">${t('unblockAll')}</button></div>` : ''}
    <button type="button" class="outline" data-act="logout">${t('logout')}</button>`;
}

function footer() {
  const mail = CONTACT_EMAIL.startsWith('YOUR_') ? '' : `<a href="mailto:${esc(CONTACT_EMAIL)}">${t('contactUs')}</a>`;
  const canInstall = !isStandalone() && (S.installPrompt || isIOS || isAndroid);
  return `<footer>
    <p>${t('footRule')}</p>
    <p class="row tight">${canInstall ? `<button type="button" class="text small" data-act="showInstall">${t('install')}</button>` : ''}<button type="button" class="text small" data-act="openFeedback">${t('feedback')}</button><a href="terms.html">${t('terms')}</a><a href="privacy.html">${t('privacy')}</a>${mail}</p>
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
  document.title = e ? `${artistLabel(e.artist)} · ${t('brand')}` : `${t('brand')} · ${t('hero')}`;
  document.body.dataset.view = S.view;
  app.innerHTML = topBar() + loginPanel() + flashFor('top') + `<div id="main" class="stack"></div>` + footer() + tabBar();
  renderMain();
  mountCaptcha('ts-box', HTML_LANG[S.lang] === 'zh-Hant' ? 'zh-tw' : HTML_LANG[S.lang]);
  mountGoogle('g-btn', sb, HTML_LANG[S.lang] === 'zh-Hant' ? 'zh_TW' : HTML_LANG[S.lang], () => { flash('login', 'errGeneric'); render(); });
}

// A chosen photo can't be set again by code, so move the old file input into the new form
function keepFile(old, id) {
  const now = document.getElementById(id);
  if (old && now && old !== now && old.files && old.files.length) now.replaceWith(old);
}

function renderMain() {
  const main = document.getElementById('main');
  if (!main) return;
  if (S.view === 'me') { main.innerHTML = meView(); return; }
  if (S.view === 'u') { main.innerHTML = profileView(); return; }
  if (S.view === 'n') { main.innerHTML = notifView(); return; }
  const e = S.selEv === 'general' && S.view === 'merch' ? 'general' : S.events.find((x) => x.id === S.selEv);
  if (!e) { main.innerHTML = homeView(); renderResults(); return; }
  if (S.view !== 'board') {
    const cf = main.querySelector('form[data-form="item"]');
    const keep = cf ? [...new FormData(cf).entries()].filter(([, v]) => typeof v === 'string') : null;
    const oldPhoto = document.getElementById('c-photo');
    main.innerHTML = itemsEventView(S.view, e);
    const nf = main.querySelector('form[data-form="item"]');
    if (keep && nf) [...nf.elements].forEach((el) => {
      if (!el.name || el.type === 'hidden' || el.type === 'file') return;
      if (el.type === 'checkbox') el.checked = keep.some(([k, v]) => k === el.name && v === el.value);
      else { const hit = keep.filter(([k]) => k === el.name).pop(); if (hit) el.value = hit[1]; }
    });
    keepFile(oldPhoto, 'c-photo');
    return;
  }
  // Keep what the user is typing in the post form across live refreshes.
  const form = main.querySelector('form[data-form="post"]');
  const saved = form ? Object.fromEntries(new FormData(form)) : null;
  const oldPhoto = document.getElementById('p-photo');
  main.innerHTML = eventView(e);
  if (saved) {
    const f = main.querySelector('form[data-form="post"]');
    if (f) for (const [k, v] of Object.entries(saved)) {
      const el = f.elements[k];
      if (!el || el.type === 'file') continue;
      if (el.type === 'checkbox') el.checked = v === 'on'; else el.value = v;
    }
    keepFile(oldPhoto, 'p-photo');
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
const ruleErr = (e) => (e && /board rules/i.test(e.message || '') ? 'errRules' : e && /suspended/i.test(e.message || '') ? 'errBanned' : null);
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
  async react(id) {
    if (!S.user) { S.showLogin = true; render(); return; }
    const i = id.indexOf(':'), kind = id.slice(0, i), key = id.slice(i + 1);
    const [item_type, item_id] = parseKey(key);
    const on = !!S.myReacts[id];
    const c = S.reacts[key] || (S.reacts[key] = { asks: 0, likes: 0 });
    const f = kind === 'ask' ? 'asks' : 'likes';
    // Update straight away, undo if the server says no
    if (on) { delete S.myReacts[id]; c[f] = Math.max(0, c[f] - 1); } else { S.myReacts[id] = true; c[f] += 1; }
    renderMain();
    const { error } = on
      ? await sb.from('post_reactions').delete().eq('user_id', S.user.id).eq('item_type', item_type).eq('item_id', item_id).eq('kind', kind)
      : await sb.from('post_reactions').insert({ item_type, item_id, kind });
    if (error && error.code !== '23505') {
      if (on) { S.myReacts[id] = true; c[f] += 1; } else { delete S.myReacts[id]; c[f] = Math.max(0, c[f] - 1); }
      S.flash = { area: 'list', text: error.message || t('errGeneric'), kind: 'err' };
      renderMain();
    }
  },
  reloadPage() { location.reload(); },
  openNotifs() { openNotifs(); },
  emailOpen() { S.emailOpen = true; render(); const el = document.getElementById('login-email'); if (el) el.focus(); },
  openArtist(k) { S.openArtist = S.openArtist === k ? null : k; renderResults(); },
  page(n) { S.page = Math.max(0, Number(n) || 0); renderResults(); const r = document.getElementById('results'); if (r && r.scrollIntoView) r.scrollIntoView({ block: 'start' }); },
  async google() {
    const back = location.origin + location.pathname + (S.selEv ? '?e=' + S.selEv : '');
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: back } });
    if (error) { flash('login', 'errGeneric'); render(); }
  },
  rate(key) {
    if (!S.user) { S.showLogin = true; render(); return; }
    S.rating = S.rating === key ? null : key; S.ratingPick = 0; S.flash = null; renderMain();
  },
  ratePick(n) {
    const f = document.querySelector('form[data-form="rate"]');
    const c = f && f.elements.comment ? f.elements.comment.value : '';
    S.ratingPick = Number(n) || 0; renderMain();
    const el = document.getElementById('r-c'); if (el) el.value = c;
  },
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
  merchKind(id) { const c = document.getElementById('c-cat'); if (c) S.merchCat = c.value; S.merchKind = id; renderMain(); },
  swapFilter(id) { S.swapFilter = id; renderMain(); },
  buddyTag(id) { S.buddyTag = S.buddyTag === id ? null : id; renderMain(); },
  mfKind(id) { S.mf.kind = id; renderMain(); },
  mfCat(id) { S.mf.cat = S.mf.cat === id ? null : id; renderMain(); },
  mfMember(id) { S.mf.member = (S.mf.member || '').toLowerCase() === id.toLowerCase() ? null : id; renderMain(); },
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
  back() { if (history.state && (history.state.ev || history.state.v === 'u' || history.state.v === 'n')) history.back(); else tabHome(); },
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
  installLater() { store.set('installLaterAt', Date.now()); renderMain(); },
  async showInstall() {
    if (S.installPrompt) { await actions.install(); return; }
    store.set('installLaterAt', 0);
    if (S.view !== 'me') await setView('me'); else renderMain();
    const c = document.querySelector('.install-card'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'center' });
  },
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
    S.newDates += 1; renderMain();
    const inputs = document.querySelectorAll('form[data-form="create"] input[type=date]'); inputs[inputs.length - 1]?.focus();
  },
  removeDate(i) {
    const f = document.querySelector('form[data-form="create"]'); if (f) S.draft = readDraft(f);
    if (S.draft) S.draft.dates.splice(Number(i), 1);
    S.newDates = Math.max(1, S.newDates - 1); renderMain();
  },
  tab(id) { S.tab = id; renderMain(); },
  profile(uid) { closeMenus(); openProfile(uid); },
  goPost(key) {
    const [type, ev] = parseKey(key);
    const view = type === 'listing' ? 'board' : type === 'free' ? 'merch' : type;
    if (ev !== 'general' && !S.events.some((x) => x.id === ev)) return;
    openEvent(ev, true, view);
  },
  pickAv(id) { if (ANIMALS[id]) { keepNick(); S.pickAv = id; renderMain(); } },
  pickBg(id) { if (AV_BG[id]) { keepNick(); S.pickBg = id; renderMain(); } },
  async togglePast() {
    S.pastOpen = !S.pastOpen; renderResults();
    if (!S.pastOpen || S.pastLoaded) return;
    const since = new Date(Date.now() - 180 * 864e5).toLocaleDateString('en-CA');
    const { data } = await sb.from('events').select('id, artist, city, venue, currency, event_date, status, created_by')
      .lt('event_date', todayISO()).gte('event_date', since).eq('status', 'approved').order('event_date', { ascending: false }).limit(60);
    (data || []).forEach((e) => { if (!S.events.some((x) => x.id === e.id)) S.events.push(e); });
    S.pastLoaded = true; renderResults();
  },
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
  async undo(id) {
    const l = S.listings.find((x) => x.id === id); if (!l) return;
    const prev = l.status === 'done' ? 'meeting' : 'open';
    const { error } = await sb.from('listings').update({ status: prev }).eq('id', id);
    if (error) flash('list', error.message && /rating/i.test(error.message) ? 'errUndoRated' : 'errGeneric'); else l.status = prev;
    renderMain();
  },
  async itemUndo(key) {
    const [type, id] = parseKey(key);
    const { error } = await sb.from(TABLE[type]).update({ status: 'open' }).eq('id', id);
    if (error) flash('list', error.message && /rating/i.test(error.message) ? 'errUndoRated' : 'errGeneric'); else { const x = (S.items[type] || []).find((i) => i.id === id); if (x) x.status = 'open'; }
    renderMain();
  },
  async del(id) {
    const { error } = await sb.from('listings').delete().eq('id', id);
    if (error) flash('list', 'errGeneric'); else S.listings = S.listings.filter((x) => x.id !== id);
    renderMain();
  }
};

// Shrink to 1280px JPEG in the browser, then upload to the public "photos" bucket
async function shrink(file) {
  if (!/^image\//.test(file.type)) return null;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
  } catch (e) { return file.size <= 2e6 ? file : null; }
}
async function uploadPhoto(file) {
  const blob = await shrink(file);
  if (!blob || blob.size > 2e6) return null;
  const path = `${S.user.id}/${Date.now()}.jpg`;
  const { error } = await sb.storage.from('photos').upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
  if (error) return null;
  return sb.storage.from('photos').getPublicUrl(path).data.publicUrl;
}

const keepNick = () => { const el = document.getElementById('pf-nick'); if (el) S.draftNick = el.value; };
const forms = {
  async rate(f) {
    const key = f.dataset.id;
    const [item_type, item_id] = key.split(':');
    const score = S.ratingPick || Number(new FormData(f).get('score')) || 0;
    const comment = String(new FormData(f).get('comment') || '').trim().slice(0, 200) || null;
    if (score < 1 || score > 5) { flash('rate', 'ratePick'); renderMain(); return; }
    const { error } = await sb.from('ratings').insert({ item_type, item_id, score, comment });
    if (error) {
      const m = error.message || '';
      const k = error.code === '23505' ? 'rateErrDup' : /yourself/i.test(m) ? 'rateErrSelf' : /new accounts/i.test(m) ? 'rateErrNew'
        : /too many/i.test(m) ? 'rateErrMany' : /interested/i.test(m) ? 'rateNeedAsk' : /marked done|cannot be rated|too old/i.test(m) ? 'rateErrState' : null;
      if (k === 'rateErrDup') S.myRatings[key] = true;
      const rk = k || ruleErr(error);
      if (rk) flash('rate', rk); else S.flash = { area: 'rate', text: m, kind: 'err' };
      renderMain(); return;
    }
    S.myRatings[key] = true; S.rating = null; S.ratingPick = 0;
    const owner = (S.listings.find((l) => 'listing:' + l.id === key) || Object.values(S.items).flat().find((x) => x && x.id === item_id) || {}).user_id;
    if (owner) { delete S.profiles[owner]; await loadProfiles([owner]); }
    flash('top', 'rateThanks', 'ok');
    render();
  },
  async profile(f) {
    const nickname = String(new FormData(f).get('nickname') || '').trim().slice(0, 24) || null;
    const p = profileOf(S.user.id);
    const row = { id: S.user.id, nickname, avatar: S.pickAv || p.avatar, avatar_bg: S.pickBg || p.bg };
    const { error } = await sb.from('profiles').upsert(row);
    if (error) { flash('profile', error.code === '23505' ? 'nickTaken' : 'errGeneric'); renderMain(); return; }
    S.profiles[S.user.id] = { ...(S.profiles[S.user.id] || {}), ...row };
    S.pickAv = null; S.pickBg = null; S.draftNick = null;
    flash('profile', 'profileSaved', 'ok'); renderMain();
  },
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
    const opt = (k) => val(k) || null;
    let row;
    if (type === 'swap') { row = { event_id: val('event'), have: val('have'), want: val('want'), contact: val('contact') }; if (S.v5 && val('desc')) row.note = val('desc'); }
    else if (type === 'buddy') {
      row = { event_id: val('event'), note: val('note'), contact: val('contact') };
      if (S.v7) Object.assign(row, { tags: d.getAll('tags').map(String).filter((k) => BUDDY_TAGS.includes(k)), meet_time: opt('meet_time'), meet_place: opt('meet_place') });
    } else if (type === 'free') {
      row = { event_id: val('event'), what: val('what'), details: opt('details'), give_time: opt('give_time'), place: opt('place') };
    } else {
      const k = S.merchKind === 'free' ? 'sale' : S.merchKind;
      const price = k !== 'swap' && val('price') ? parseFloat(val('price')) : null;
      row = { kind: k, title: val('title'), details: val('details') || null, price, contact: val('contact') };
      if (S.v7) Object.assign(row, { category: CATS.includes(val('category')) ? val('category') : null, member: opt('member') });
      if (S.v5 && val('mevent')) row.event_id = val('mevent');
      else if (!S.v5 && S.selEv !== 'general') { flash('compose', 'errSetup'); renderMain(); return; }
      if ((k === 'sale' && !(price >= 0)) || (price !== null && !(price >= 0))) { flash('compose', 'fillAll'); renderMain(); return; }
    }
    const needConfirm = type === 'swap' || type === 'merch';
    const required = { swap: ['event_id', 'have', 'want', 'contact'], buddy: ['event_id', 'note', 'contact'], merch: ['title', 'contact'], free: ['event_id', 'what'] }[type];
    if (required.some((k) => !row[k]) || (needConfirm && d.get('confirm') !== 'on')) {
      flash('compose', 'fillAll'); renderMain(); return;
    }
    const file = f.elements.photo && f.elements.photo.files ? f.elements.photo.files[0] : null;
    if (((S.v7 && (type === 'merch' || type === 'free')) || (S.v8 && (type === 'swap' || type === 'buddy'))) && file && file.size) {
      S.flash = { area: 'compose', text: t('uploading'), kind: 'info' }; renderMain();
      const url = await uploadPhoto(file);
      if (!url) { flash('compose', 'photoErr'); renderMain(); return; }
      row.photo_url = url;
    }
    if (row.event_id) S.selEvForm = row.event_id;
    const { error } = await sb.from(TABLE[type]).insert(row);
    if (error) { flash('compose', ruleErr(error) || (/Too many/.test(error.message) ? 'errRate' : 'errGeneric')); renderMain(); return; }
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
    if (S.authMode === 'signup' && isBlockedEmail(email)) { flash('login', 'errDisposable'); render(); keepEmail(email); return; }
    const captcha = captchaToken();
    if (captchaOn() && !captcha) { flash('login', 'errCaptcha'); render(); keepEmail(email); return; }
    const cap = captcha ? { captchaToken: captcha } : {};
    resetCaptcha(); // each check works once
    const isCap = (er) => /captcha/i.test(er.message || '');
    if (S.authMode === 'login') {
      const { error } = await sb.auth.signInWithPassword({ email, password, options: cap });
      if (!error) return; // onAuthStateChange re-renders
      flash('login', isCap(error) ? 'errCaptcha' : isRateLimit(error) ? 'errEmailLimit' : /confirm/i.test(error.message) ? 'errConfirm' : /invalid/i.test(error.message) ? 'errCreds' : 'errGeneric');
    } else if (S.authMode === 'signup') {
      const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: back, ...cap } });
      if (error) flash('login', isCap(error) ? 'errCaptcha' : isRateLimit(error) ? 'errEmailLimit' : /registered|exists/i.test(error.message) ? 'errExists' : /disposable|saving new user/i.test(error.message) ? 'errDisposable' : 'errGeneric');
      else if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) flash('login', 'errExists', 'warn');
      else if (data.session) return; // confirmation is off: already logged in
      else flash('login', 'signupSent', 'ok');
    } else {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname, ...cap });
      if (error) flash('login', isCap(error) ? 'errCaptcha' : isRateLimit(error) ? 'errEmailLimit' : 'errGeneric'); else flash('login', 'resetSent', 'ok');
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
      flash('create', dup ? 'dupWarn' : ruleErr(fail) || (fail && /Too many/.test(fail.message) ? 'errRate' : 'errGeneric'), dup ? 'warn' : 'err');
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
    let photoUrl = null;
    const file = S.v8 && f.elements.photo && f.elements.photo.files ? f.elements.photo.files[0] : null;
    if (file && file.size) {
      photoUrl = await uploadPhoto(file);
      if (!photoUrl) { flash('post', 'photoErr'); renderMain(); return; }
    }
    const { error } = await sb.rpc('create_listing', {
      p_event: S.selEv, p_kind: S.formKind, p_section: section, p_qty: Number(d.get('qty')),
      p_original: original, p_price: price, p_meet: meet, p_contact: contact,
      ...(S.v5 ? { p_note: String(d.get('note') || '').trim() || null } : {}),
      ...(S.v8 ? { p_photo: photoUrl } : {})
    });
    if (error) {
      flash('post', error.code === '23514' ? 'over' : ruleErr(error) || (/Too many/.test(error.message) ? 'errRate' : 'errGeneric'));
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
  if (e.target.id === 'sort') {
    S.sort = e.target.value;
    const box = document.getElementById('evlist');
    if (box) box.innerHTML = S.view === 'board' ? boardList() : itemList(S.view);
  }
});
const VIEWS = ['swap', 'buddy', 'merch', 'me'];
const routeTo = async (push) => {
  const p = new URLSearchParams(location.search);
  const id = p.get('e'); const v = p.get('v');
  if (v === 'u' && UUID.test(p.get('id') || '')) { await openProfile(p.get('id'), push); return; }
  if (v === 'n' && S.user) { await openNotifs(push); return; }
  const view = v === 'free' ? 'merch' : VIEWS.includes(v) ? v : 'board';
  const okId = id && ((id === 'general' && view === 'merch') || (UUID.test(id) && S.events.some((x) => x.id === id)));
  if (okId && view !== 'me') await openEvent(id, push, view);
  else if (view !== 'board') await setView(view, push);
  else goHome(push);
};
window.addEventListener('popstate', () => { routeTo(false); });
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); S.installPrompt = e; render(); });
window.addEventListener('appinstalled', () => { S.installPrompt = null; render(); });
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
      await loadMyRatings(); await loadMyReacts(); await loadNotifs();
      await checkAdmin(); await loadEvents(); await loadCounts(); await loadListings();
      if (S.view === 'me') await loadMine(); else if (S.view !== 'board') { await loadItems(S.view); if (S.view === 'merch' && S.v7) await loadItems('free'); }
      render();
    }
  });
  await checkAdmin();
  await detectV5();
  await loadMyRatings();
  await loadMyReacts();
  await loadNotifs();
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

// Check for new notifications every minute while the page is open
setInterval(async () => {
  if (!S.user || !S.v13 || document.hidden || S.view === 'n') return;
  const before = S.unread;
  await loadNotifs();
  if (S.unread !== before) refreshBell();
}, 60000);
