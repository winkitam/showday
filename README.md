# Show Day ✦

**Today's show tickets at face value or less.**
A free, fan-to-fan board for concert day: resell spare tickets at face value or below, swap seats, find concert buddies, trade merch and find fan freebies, then meet in person near the venue.

🌐 Live: [showday.seeyoutnt.workers.dev](https://showday.seeyoutnt.workers.dev)

> 中文簡介：Show Day 是一個免費的粉絲對粉絲演出當日平台。只可以原價或以下讓票，另有換位、同行、周邊及應援派發，場館附近面交。支援英文、繁體中文及韓文。

---

## Why

On show day, plans change. Fans with a spare ticket worry about being called a scalper, and fans looking for one risk paying touts or buying fakes. Show Day focuses on the last 24 hours before a show, with the price rule built into the database so a listing above face value cannot be saved.

## Features

| Tab | What it does |
|---|---|
| 🎫 **Board** | Has / needs ticket listings with section, quantity, price and meeting point. Live updates. "Fits your price" and "below face value" tags, sort by newest, price or section. |
| 🔁 **Seat swap** | Ticket for ticket, no money. Automatic matching against your own swaps ("Perfect match ✦" when both sides fit). Standing / seated filter. |
| 👯 **Buddies** | Find fans going to the same show. Tags (first time, solo, 廣東話, English, 한국어, 普通話, queue, eat, photos) plus meet time and place. |
| 🛍️ **Merch** | WTS / WTB / WTT with category, member and photo. Not tied to a concert, or meet at one. |
| 🎁 **Freebies** | Inside Merch: fans list free fan goodies they hand out at a show (what, when, where, how to get one). |
| 🙋 **Me** | My posts, nickname and animal avatar, theme, feedback, install to home screen. |

**Across the site**
- **Show Day mode**: concerts happening today get a highlighted header and sit at the top of every tab
- Every concert has its own shareable link; one show with many dates is grouped with date chips
- Exact post time plus relative time; open posts older than 3 hours on show day fade out as "May be gone"
- Public profiles: animal avatar, nickname, member since, completed trades, active posts
- Fan colour frames around artist names, drawn in CSS (no images)
- City names translated to the chosen language, and search works in any language
- Three themes: Kawaii pink, Simple, Night
- Installable as a home screen app (PWA)
- Past shows (last 6 months) available read only

## Safety and privacy by design

- **Face-value rule in the database**: a check constraint rejects a sell price above the original price, so the rule cannot be bypassed from the browser
- **Contact details hidden from the public**: column-level grants stop anonymous users reading the `contact` column; ticket contacts live in a separate table readable only by logged-in users
- **Row Level Security** on every table: users can only change or delete their own posts
- **Reports**: 3 reports automatically hide a post until an admin reviews it
- **Rate limits** in database triggers (posts per hour, new concerts per day)
- **Blocking**, new concerts held as "pending review" until approved
- **No email shown anywhere**; nicknames are unique (case-insensitive) to prevent impersonation
- **Photo uploads** are resized in the browser, capped at 2 MB, images only, and stored under the uploader's own folder; forms remind users to cover QR codes and barcodes
- Avatars are emoji drawn by the site: no user image uploads to moderate

## Tech stack

| Layer | Choice |
|---|---|
| Front end | Plain HTML, CSS and JavaScript (ES modules), no build step |
| Back end | [Supabase](https://supabase.com): Postgres, Auth (email and password), Storage, Realtime |
| Hosting | Cloudflare Workers static assets (`wrangler.jsonc`), deployed on every push to `main` |
| Admin | `admin.html`: approve concerts, review reported posts, read feedback |
| Tests | jsdom test suites run against a stubbed Supabase client |

The app is a single-page app driven by URL parameters (`?e=<concert>`, `?v=swap|buddy|merch|me|u`), so every page can be shared and the back button works.

## Project structure

```
showday-site/        The website (served as static files)
  index.html         App shell
  app.js             All app logic and the EN / 繁中 / 한국어 text
  styles.css         Base styles plus Kawaii pink and Night themes
  admin.html/.js     Admin page
  config.js          Supabase URL and public (anon) key
  privacy.html       Privacy notice
  manifest.json, sw.js, icon*   Home screen install
supabase/            Database migrations, run in order
wrangler.jsonc       Cloudflare config (serves showday-site/)
```

## Setup

1. **Create a Supabase project** (free plan is enough).
2. **Run the SQL** in Supabase › SQL Editor, in this order:
   - `showday-site/schema.sql` (base tables, rules and policies)
   - every file in `supabase/`, from `001_admin.sql` upwards
3. **Add yourself as admin**: insert your user id into the `admins` table.
4. **Fill in `showday-site/config.js`** with your Supabase URL and publishable (anon) key. The anon key is safe to publish; access is controlled by Row Level Security.
5. **Supabase › Authentication › URL Configuration**: set the Site URL and add `https://<your-domain>/**` to Redirect URLs.
6. **Deploy**: connect the repo to Cloudflare Workers (deploy command `npx wrangler deploy`), or serve `showday-site/` from any static host.

The app detects which migrations have run and hides features whose tables or columns do not exist yet, so it keeps working while you upgrade.

## Roadmap

- Custom domain
- Per-tab home pages (matches for you, tonight's buddies, merch photo wall)
- Listing fees or featured posts for sustainability
- Ofcom Online Safety Act risk assessment and published terms of use

## Contributing and feedback

Ideas, bugs and feature requests are welcome through the in-app **Feedback** form or GitHub issues.

---

Show Day is a noticeboard. It does not take payments or handle tickets; buyers and sellers arrange the handover themselves. Please follow the ticket terms of each event and local laws.
