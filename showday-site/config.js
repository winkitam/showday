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
export const GOOGLE_LOGIN = false;
