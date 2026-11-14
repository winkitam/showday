// Cloudflare Turnstile ("verify you're human"), shared by the board and the admin page.
// Off when TURNSTILE_SITE_KEY is empty. Tokens work once, so reset after every attempt.
import { TURNSTILE_SITE_KEY } from './config.js';

let loading = null, widget = null, token = null;
export const captchaOn = () => !!TURNSTILE_SITE_KEY;

function load() {
  if (loading) return loading;
  loading = new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true; s.onload = ok; s.onerror = fail;
    document.head.appendChild(s);
  });
  return loading;
}

// Put the widget in the element with this id (call after each render).
export async function mountCaptcha(boxId, lang = 'auto') {
  if (!captchaOn()) return;
  const box = document.getElementById(boxId);
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  try { await load(); } catch (e) { return; }
  if (!window.turnstile || !document.getElementById(boxId)) return;
  token = null;
  widget = window.turnstile.render('#' + boxId, {
    sitekey: TURNSTILE_SITE_KEY, language: lang, size: 'flexible',
    callback: (t) => { token = t; }, 'expired-callback': () => { token = null; }, 'error-callback': () => { token = null; }
  });
}
export const captchaToken = () => token;
export function resetCaptcha() {
  token = null;
  if (window.turnstile && widget !== null) { try { window.turnstile.reset(widget); } catch (e) { /* widget gone */ } }
}
