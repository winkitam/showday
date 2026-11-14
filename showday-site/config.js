// Paste your own values from Supabase > Project Settings > API.
// The anon (public) key is meant to be public. The database rules in schema.sql keep data safe.
export const SUPABASE_URL = 'https://mqhzrssljppeuugdhinx.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_8y53mGkoCUvgTyPGx9IeyQ_9onIjJFM';

// Shown in the footer and privacy page so users can reach you.
export const CONTACT_EMAIL = 'showday.cs@gmail.com';

// Bot protection (Cloudflare Turnstile). Paste the public "Site key" here after you
// turn on CAPTCHA in Supabase > Authentication > Attack Protection. Leave '' to switch off.
// Never put the Secret key in this file.
export const TURNSTILE_SITE_KEY = '';

// Show "Continue with Google" once Google is switched on in Supabase > Authentication > Providers.
export const GOOGLE_LOGIN = true;

// Optional, makes the Google login look like part of Show Day (no supabase.co address shown).
// Paste the Google OAuth "Client ID" here (it is public; never the Client secret).
// Also add this site's address under "Authorized JavaScript origins" in Google Cloud. Leave '' to use the redirect login.
export const GOOGLE_CLIENT_ID = '227748552340-mvateeli0vqe5jrg8hrtk3ug80bnh7go.apps.googleusercontent.com';
