// "Sign in with Google" using Google's own button (no redirect through supabase.co).
// Active only when GOOGLE_CLIENT_ID is set in config.js; otherwise app.js uses the redirect login.
import { GOOGLE_CLIENT_ID } from './config.js';

let loading = null;
export const googleIdOn = () => !!GOOGLE_CLIENT_ID;

function load() {
  if (loading) return loading;
  loading = new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.onload = ok; s.onerror = fail;
    document.head.appendChild(s);
  });
  return loading;
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

// Draw the button into the element with this id. onError(err) is called if Supabase refuses the token.
export async function mountGoogle(boxId, sb, lang, onError) {
  if (!googleIdOn()) return;
  const box = document.getElementById(boxId);
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  try { await load(); } catch (e) { return; }
  const g = window.google && window.google.accounts && window.google.accounts.id;
  if (!g || !document.getElementById(boxId)) return;
  const raw = crypto.randomUUID() + crypto.randomUUID();
  let hashed = raw;
  try { hashed = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))); } catch (e) { return; }
  g.initialize({
    client_id: GOOGLE_CLIENT_ID, nonce: hashed, use_fedcm_for_prompt: true,
    callback: async (res) => {
      const { error } = await sb.auth.signInWithIdToken({ provider: 'google', token: res.credential, nonce: raw });
      if (error && onError) onError(error);
    },
  });
  g.renderButton(box, { type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'left', locale: lang, width: Math.min(320, box.clientWidth || 320) });
}
