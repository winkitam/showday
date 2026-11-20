import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { callAi, shrinkImage } from './ai.js';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ERR = {
  login: 'Please log in on Show Day first.', limit: 'You have used today’s AI tries. Try again tomorrow.',
  not_configured: 'AI is not switched on yet.', bad_image: 'That image could not be used. Try a JPG or PNG.',
  unreadable: 'Could not read clothes in that photo. Try a clearer one.', network: 'Network problem. Please try again.'
};
const PART = { top: 'Top', bottom: 'Bottom', dress: 'Dress', outerwear: 'Outerwear', shoes: 'Shoes', bag: 'Bag', hat: 'Hat', jewelry: 'Jewellery', eyewear: 'Eyewear', belt: 'Belt', other: 'Other' };
let img = null;

const { data } = await sb.auth.getSession();
if (data.session) $('form').classList.remove('hidden'); else $('gate').classList.remove('hidden');

$('photo').addEventListener('change', async (e) => {
  const f = e.target.files && e.target.files[0];
  img = await shrinkImage(f);
  const p = $('preview');
  if (img) { p.src = img; p.classList.remove('hidden'); $('msg').textContent = ''; }
  else { p.classList.add('hidden'); $('msg').textContent = ERR.bad_image; $('msg').className = 'note small err'; }
});

const q = (s) => encodeURIComponent(s);
const links = (i) => {
  const term = [i.brand, i.search || i.name].filter(Boolean).join(' ');
  return [['Google Shopping', 'https://www.google.com/search?tbm=shop&q=' + q(term)],
    ['Depop (second hand)', 'https://www.depop.com/search/?q=' + q(term)],
    ['Pinterest', 'https://www.pinterest.com/search/pins/?q=' + q(term)]];
};

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!img) { $('msg').textContent = ERR.bad_image; $('msg').className = 'note small err'; return; }
  $('go').disabled = true; $('msg').textContent = 'Reading the outfit…'; $('msg').className = 'note small';
  $('out').innerHTML = '';
  const r = await callAi(sb, 'outfit', '', img);
  $('go').disabled = false;
  if (r.error) { $('msg').textContent = ERR[r.error] || 'AI is busy. Please try again.'; $('msg').className = 'note small err'; return; }
  const items = (r.data && r.data.items) || [];
  if (!items.length) { $('msg').textContent = ERR.unreadable; $('msg').className = 'note small err'; return; }
  $('msg').textContent = '';
  const credit = $('credit').value.trim();
  $('out').innerHTML = (r.data.style ? `<p class="muted">Look: ${esc(r.data.style)}</p>` : '')
    + items.map((i) => `<div class="panel stack"><div class="row between"><b>${esc(i.name || i.search)}</b><span class="chip">${esc(PART[i.part] || 'Other')}</span></div>
      <p class="small muted">${[i.color, i.material].filter(Boolean).map(esc).join(' · ')}${i.brand ? ` · Brand shown on item: <b>${esc(i.brand)}</b>` : ' · Brand not visible, so we do not guess'}</p>
      <div class="row tight" style="flex-wrap:wrap">${links(i).map(([n, u]) => `<a class="outline-link" href="${u}" target="_blank" rel="noopener noreferrer">${n}</a>`).join('')}</div></div>`).join('')
    + `<div class="panel stack"><b>Want the exact pieces?</b>
      <p class="small muted">Exact items from shows are often borrowed or custom. Fan accounts and Google Lens are the best next step.</p>
      <div class="row tight" style="flex-wrap:wrap">
        <a class="outline-link" href="https://lens.google.com/" target="_blank" rel="noopener noreferrer">Open Google Lens (upload the photo)</a>
        ${credit ? `<a class="outline-link" href="https://www.google.com/search?q=${q(credit + ' outfit credit brand')}" target="_blank" rel="noopener noreferrer">Search fan posts</a>` : ''}
      </div></div>`;
});
