# Turning on the AI features (about 10 minutes)

Paste-to-post and plain-language alerts need one small server function. Until you do these steps the buttons
simply show "AI is not switched on yet" and everything else on the site works as before.

## 1. Run the database file
Supabase > SQL Editor > paste `supabase/020_alerts_ai.sql` > Run.

## 2. Get an AI key
Use your OpenRouter account (openrouter.ai > Keys). Put a small credit limit on the key (for example $5).
Pick a cheap model that can read images, and copy its model name from the model's page on OpenRouter.
Use the Haiku tier for the best price for this job; any model that accepts images works.

## 3. Create the function
Supabase > Edge Functions > Deploy a new function > "Via editor".
- Name: `ai-parse` (exactly)
- Paste all of `supabase/functions/ai-parse/index.ts`
- Leave "Verify JWT" ON
- Deploy

## 4. Add the secrets (never paste these in chat or in code)
Supabase > Edge Functions > Secrets:
- `OPENROUTER_API_KEY` = your key
- `AI_MODEL` = the model name from step 2

Optional: `AI_USER_DAILY` (default 20 uses per person per day), `AI_SITE_DAILY` (default 500 per day for the
whole site). If you add a custom domain later, also set `ALLOWED_ORIGIN` to the new address.

## 5. Check it
Log in on the site, open a show, tap "Post", then "Paste or screenshot", paste any ticket message.
Fields should fill in. If you see "not switched on", the secrets are missing or the function name is wrong.
