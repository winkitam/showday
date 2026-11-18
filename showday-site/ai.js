// Helpers for the AI features (paste-to-post and plain-language alerts).
// The AI only suggests values. Nothing is saved until the person reviews and submits.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Calls the ai-parse edge function. Returns { data } or { error: code }.
export async function callAi(sb, mode, text, image) {
  try {
    const { data: s } = await sb.auth.getSession();
    const token = s && s.session ? s.session.access_token : '';
    if (!token) return { error: 'login' };
    const r = await fetch(SUPABASE_URL + '/functions/v1/ai-parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ mode, text: text || '', ...(image ? { image } : {}) })
    });
    let j = null;
    try { j = await r.json(); } catch (_) { /* not json */ }
    if (r.ok && j && j.ok && j.data) return { data: j.data };
    if (j && j.error) return { error: String(j.error) };
    return { error: r.status === 404 ? 'not_configured' : 'provider' };
  } catch (_) {
    return { error: 'network' };
  }
}

// Shrinks a photo in the browser (max 1280px, JPEG). Re-drawing also removes EXIF data such as GPS.
export function shrinkImage(file) {
  return new Promise((resolve) => {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) { resolve(null); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const k = Math.min(1, 1280 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const out = c.toDataURL('image/jpeg', 0.8);
        URL.revokeObjectURL(url);
        resolve(out.length <= 2000000 ? out : null);
      } catch (_) { resolve(null); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// Finds the shows an alert could mean. `names(ev)` returns searchable text for the show's artist and city.
// Returns upcoming events, best matches first. Artist is required when given; date and city narrow it.
export function matchShows(events, p, today, names) {
  const up = events.filter((e) => e.event_date >= today && e.status !== 'pending');
  const a = String(p.artist || '').trim().toLowerCase();
  const c = String(p.city || '').trim().toLowerCase();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(p.date || '') ? p.date : '';
  const score = (e) => {
    const n = names(e);
    let s = 0;
    if (a) { if (!n.artist.includes(a)) return -1; s += 2; }
    if (c) { if (n.city.includes(c)) s += 1; else s -= 1; }
    if (d) { if (e.event_date === d) s += 3; else s -= 1; }
    return (a || d || c) ? s : -1;
  };
  return up.map((e) => [e, score(e)]).filter(([, s]) => s > 0).sort((x, y) => y[1] - x[1] || x[0].event_date.localeCompare(y[0].event_date)).map(([e]) => e);
}
