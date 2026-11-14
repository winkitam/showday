# Show Day Board: launch tutorial

> **Note:** this is the original step-by-step launch guide. The site now runs on Cloudflare Workers instead of Netlify; see the main [README](../README.md) for the current setup.

A real, public, same-day face-value ticket board.
Total cost to start: £0 (plus a domain later, about £10 a year).
Time: about 1 to 2 hours the first time.

> 中文說明：這是一個真正可以公開使用的網站。資料庫用 Supabase（免費），網站放在 Netlify（免費）。第一次設定大約 1 至 2 小時。

## What is in this folder

| File | What it does |
|---|---|
| `index.html`, `app.js`, `styles.css` | The website |
| `config.js` | Where you paste your Supabase keys (step 3) |
| `schema.sql` | Creates the database and all the safety rules (step 2) |
| `privacy.html` | Privacy notice template, fill in the [brackets] |
| `manifest.json`, `sw.js`, `icon*` | Lets users add the site to their home screen |

**What works in this version**
- Concert search, and adding a new concert if it is missing (new ones show as "Pending review" until you approve them)
- Every concert has its own link (`yoursite.com/?e=...`) to share on IG, Threads and WhatsApp
- Listings: has ticket / needs ticket, live updates without refreshing
- Face-value rule enforced by the database: a sell price above the original price is rejected
- Login with email and password (sign up, log in, forgot password)
- Contact details only visible to logged-in users
- Status: Available, Meeting now, Handed over
- Report (auto-hides a listing after 3 reports), block, delete your own post
- English, 繁中, 한국어
- Add to Home Screen
- Spam limits: 10 listings per hour, 5 new concerts per day per user

**Tabs:** Board (tickets, with a Show Day section for tonight's concerts), Seat swap, Buddies, Merch, Me (your posts, change password, admin link).
Seat swap, Buddies and Merch need `supabase/002_tabs.sql` to be run once.

**Not in this version yet:** membership, artist alerts, photos on merch, in-app account deletion.

> 中文說明：第一版已有搜尋、新增演出、貼文、原價檢查、登入、舉報、封鎖、三語和加入主畫面。換位、同行、周邊、會員和提醒留待第二版。

---

## Step 1. Create a Supabase project

1. Go to **supabase.com** and sign up (GitHub or email).
2. Click **New project**.
3. Name: `showday-board`. Set a strong database password and save it somewhere safe.
4. Region: **West EU (London)**.
5. Click **Create new project** and wait about 2 minutes.

> 中文說明：Supabase 是你的資料庫和登入系統。地區選倫敦，速度最快，資料也留在英國。

## Step 2. Create the database

1. In your project, open **SQL Editor** (left menu) and click **New query**.
2. Open `schema.sql` from this folder, copy everything, paste it in.
3. Click **Run**. You should see "Success. No rows returned".

> 中文說明：這一步會建立資料表，並設定所有規則：只限原價、只有登入用戶看到聯絡方式、被舉報 3 次自動隱藏、防止洗版。這些規則在資料庫層面執行，用戶無法繞過。

## Step 3. Connect the website to Supabase

1. In Supabase, go to **Project Settings > API** (or **Connect**).
2. Copy the **Project URL** and the **anon public** key.
3. Open `config.js` and paste them:
   ```js
   export const SUPABASE_URL = 'https://abcd1234.supabase.co';
   export const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
   export const CONTACT_EMAIL = 'hello@yourdomain.com';
   ```
4. Save the file.

Never paste the **service_role** key anywhere in this folder. Only the anon key.

> 中文說明：anon key 本來就是公開的，安全由第 2 步的規則保護。但 service_role key 絕對不能放進網站，否則任何人都能改你的資料庫。

## Step 4. Put the website online (Netlify)

1. Go to **netlify.com** and sign up **first** (sites dropped without an account are deleted after a short time).
2. Click **Add new site > Deploy manually**.
3. Drag this whole folder onto the page.
4. You get a link like `https://random-name-123.netlify.app`.
5. **Site configuration > Change site name**, e.g. `showday-london` → `https://showday-london.netlify.app`.

> 中文說明：把整個資料夾拖進 Netlify 就上線了，不需要寫指令。記得先註冊帳號。

## Step 5. Make login links work

1. In Supabase: **Authentication > URL Configuration**.
2. **Site URL**: your Netlify link, e.g. `https://showday-london.netlify.app`
3. **Redirect URLs**, add: `https://showday-london.netlify.app/**`
4. Save.
5. Check **Authentication > Sign In / Providers > Email** is enabled.

Test it: open your site, tap **Log in > Create an account**, confirm via the email, and you are logged in. After that you log in with your password. **Forgot password?** emails a reset link that brings you back to set a new one.

> 中文說明：這一步告訴 Supabase 登入後要把用戶帶回哪個網址。沒設定的話，登入連結會失效。

## Step 6. Add your first concerts

Option A (on the site): search, tap **Add it**, fill in artist, venue and date. Then approve it (step 7).

Option B (faster for many): Supabase **Table Editor > events > Insert row**:
- `artist`, `venue`, `event_date` (YYYY-MM-DD)
- `status`: `approved`

> 中文說明：開站前先加好未來 1 至 2 個月的倫敦演出，用戶一來就有東西可以搜尋。

## Step 7. Your daily admin (5 minutes)

**Easiest: the admin page**
1. One-time setup: log in on the website once, then run `supabase/001_admin.sql` (in the repository root) in Supabase SQL Editor. Change the email at the bottom if needed.
2. Open `yoursite/admin.html` and log in with the same email.
3. **New concerts**: fix the name or date if needed, tap **Approve**, or **Delete** (tap twice).
4. **Reported posts**: **Hide**, **Restore** (also clears its reports) or **Delete**.

Only emails in the `admins` table can use it. Everyone else sees "Not allowed".

> 中文說明：管理頁面只有你可以使用，在網址後面加 `/admin.html` 就能進入，用手機也可以審核演出和處理舉報。

**Or directly in Supabase:**

**Approve new concerts**
Table Editor > **events** > filter `status` = `pending` > change to `approved`.
Delete fake or duplicate ones.

**Check reports**
Table Editor > **reports** shows which listings were reported.
Listings with 3 reports are hidden automatically (`hidden` = true in **listings**).
To restore one, set `hidden` back to false. To remove it, delete the row.

**Ban a user**
Authentication > Users > find the user > **Ban** or **Delete**.

> 中文說明：每天花 5 分鐘：審核新演出、看舉報、處理違規用戶。演出當天要多留意。

## Step 8. Update the site later

Change files, then Netlify > **Deploys** > drag the folder again. Done in seconds.

## Step 9. Your own domain (optional, recommended)

1. Buy a short domain (Namecheap, Cloudflare, Porkbun).
2. Netlify > **Domain management > Add a domain**, follow the DNS steps.
3. Back in Supabase step 5, add the new domain to **Site URL** and **Redirect URLs**.

> 中文說明：短而好記的域名讓粉絲更容易記得你，換域名後記得更新 Supabase 的網址設定。

---

## Before you announce it publicly: checklist

- [ ] `config.js` has your real URL, anon key and contact email
- [ ] `privacy.html`: all [brackets] filled in
- [ ] **Custom email sender**: Supabase's built-in email only sends a few login emails per hour. Before launch set up SMTP (e.g. Resend, free tier): Supabase > **Authentication > Emails > SMTP Settings**
- [ ] Tested on your phone: log in, post, see contact, report, add to home screen, all three languages
- [ ] Added upcoming concerts
- [ ] Asked a friend to try posting a price above face value (it must be rejected)
- [ ] Short legal check of the face-value rules and privacy notice
- [ ] Separate IG / Threads / WhatsApp accounts for this board, with the link in bio

> 中文說明：公開前一定要設定自訂電郵發送（SMTP），否則用戶多時會收不到登入電郵。

## Troubleshooting

| Problem | Fix |
|---|---|
| Page says "Setup needed" | `config.js` still has the placeholder values |
| Login email never arrives | Built-in email limit reached, set up SMTP. Check spam. |
| Login link opens but you are not logged in | Step 5: Site URL / Redirect URLs do not match your site |
| "Something went wrong" when posting | Check you ran all of `schema.sql`. In Supabase, **Logs** shows the exact error |
| Listings do not update live | Database > Publications > `supabase_realtime` should include `listings` |
| New concert is not visible to others | It is still `pending`. Approve it (step 7) |

## Costs as you grow

Supabase and Netlify free tiers are enough for the first months. If you grow past them, expect roughly £20 to £50 a month. Check each provider's pricing page for current numbers.
