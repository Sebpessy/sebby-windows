/**
 * Sebby Windows — quote intake API
 *
 * POST /quote  {name,phone,email,city,count,existing,timeline,financing,note}
 *   1. writes the lead to Supabase `leads` (the six9builder CRM table)
 *   2. emails the owner via Resend, and auto-replies to the visitor
 *
 * The Supabase write is the source of truth. Email is best-effort: if Resend is
 * not configured or fails, the lead is still saved and the visitor still gets a
 * success response.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, OWNER_EMAIL, FROM_EMAIL,
 *      RESEND_API_KEY (optional), PORT, ALLOWED_ORIGINS (optional, comma list)
 */

import { createServer } from 'node:http';

const PORT = process.env.PORT || 8080;
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'sebpessy@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Sebby Windows <quotes@sebbywindows.com>';
const PHONE = '469-996-3789';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://sebbywindows.com,https://www.sebbywindows.com,http://localhost:8000')
  .split(',').map((s) => s.trim()).filter(Boolean);

const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
});

const send = (res, status, obj, origin) => {
  res.writeHead(status, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
  res.end(JSON.stringify(obj));
};

/* ---------- crude per-IP throttle: 8 submissions per hour ---------- */
const hits = new Map();
function throttled(ip) {
  const now = Date.now();
  const cutoff = now - 3600_000;
  const list = (hits.get(ip) || []).filter((t) => t > cutoff);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => t > cutoff)) hits.delete(k);
  return list.length > 8;
}

/* ---------- Supabase ---------- */
async function saveLead(lead) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('supabase not configured');
  const notes = [
    lead.count && `Windows: ${lead.count}`,
    lead.existing && `Existing: ${lead.existing}`,
    lead.timeline && `Timeline: ${lead.timeline}`,
    lead.financing && `Financing: ${lead.financing}`,
    lead.note && `\n${lead.note}`,
  ].filter(Boolean).join('\n');

  const row = {
    name: lead.name,
    phone: lead.phone,
    email: lead.email || null,
    status: 'new',
    source: 'sebbywindows.com',
    project_type: 'Window Replacement',
    address_city: lead.city || null,
    address_state: 'TX',
    notes: notes || null,
    custom_fields: {
      window_count: lead.count || null,
      existing_windows: lead.existing || null,
      timeline: lead.timeline || null,
      financing_interest: lead.financing || null,
      submitted_from: 'sebbywindows.com/#contact',
    },
  };

  const r = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`supabase ${r.status}: ${await r.text()}`);
  const [saved] = await r.json();
  return saved;
}

/* ---------- Resend ---------- */
async function sendEmail(to, subject, html, replyTo) {
  if (!RESEND_API_KEY) return;
  const body = { from: FROM_EMAIL, to: [to], subject, html };
  if (replyTo) body.reply_to = replyTo;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`resend ${r.status}: ${await r.text()}`);
}

const emailShell = (inner) => `
<div style="background:#FAF9F7;padding:40px 20px;font-family:Arial,Helvetica,sans-serif">
 <div style="max-width:560px;margin:0 auto;border:1px solid #E4E0D8;background:#FFFFFF;padding:38px 34px">
  <div style="letter-spacing:4px;font-size:11px;color:#9A7A2E;text-transform:uppercase;margin-bottom:22px">SEBBY WINDOWS &middot; DALLAS &mdash; FORT WORTH</div>
  ${inner}
  <hr style="border:0;border-top:1px solid #E4E0D8;margin:30px 0 16px">
  <div style="font-size:11px;color:#7C766C;letter-spacing:2px;text-transform:uppercase">Windows, installed by a builder</div>
 </div></div>`;

const row = (label, value) => value
  ? `<tr><td style="padding:7px 14px 7px 0;color:#7C766C;font-size:13px;white-space:nowrap">${esc(label)}</td>
         <td style="padding:7px 0;color:#1A1A1A;font-size:14px;font-weight:bold">${esc(value)}</td></tr>`
  : '';

async function notify(lead, digits) {
  const ownerHtml = emailShell(`
    <div style="font-family:Georgia,serif;font-size:24px;color:#1A1A1A;margin-bottom:6px">New window quote request</div>
    <div style="font-size:13px;color:#7C766C;margin-bottom:20px">From sebbywindows.com &middot; saved to your leads</div>
    <table style="border-collapse:collapse">
      ${row('Name', lead.name)}
      ${row('Phone', lead.phone)}
      ${row('Email', lead.email)}
      ${row('City', lead.city)}
      ${row('Windows', lead.count)}
      ${row('Existing', lead.existing)}
      ${row('Timeline', lead.timeline)}
      ${row('Financing', lead.financing)}
    </table>
    ${lead.note ? `<div style="margin-top:18px;padding:14px 16px;background:#FAF9F7;border-left:2px solid #C9A24B;font-size:14px;color:#4A4742;white-space:pre-wrap">${esc(lead.note)}</div>` : ''}
    <a href="tel:${esc(digits)}" style="display:inline-block;margin-top:22px;background:#C9A24B;color:#0B0B0B;padding:13px 26px;text-decoration:none;font-weight:bold;font-size:12px;letter-spacing:2px;text-transform:uppercase">Call ${esc(lead.phone)}</a>
  `);

  await sendEmail(
    OWNER_EMAIL,
    `Window quote — ${lead.name}${lead.city ? ' · ' + lead.city : ''}`,
    ownerHtml,
    lead.email || undefined
  );

  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) {
    const leadHtml = emailShell(`
      <div style="font-family:Georgia,serif;font-size:24px;color:#1A1A1A;margin-bottom:12px">Got your request, ${esc(lead.name)}.</div>
      <p style="font-size:14px;line-height:1.7;color:#4A4742;margin:0 0 12px">
        Sebastien will call you back, usually the same day. If you would rather not wait,
        call or text <a href="tel:+14699963789" style="color:#9A7A2E">${PHONE}</a> directly.</p>
      <p style="font-size:14px;line-height:1.7;color:#4A4742;margin:0 0 12px">
        Photos of your windows help a lot. Text them to the same number and we can usually
        give you a range before anyone comes out.</p>
      <p style="font-size:14px;line-height:1.7;color:#4A4742;margin:0 0 12px">
        Asked about financing? We can get you pre-approved with our lending partner before
        the measure, so you know the monthly payment up front. On approved credit.</p>
      <p style="font-size:13px;line-height:1.7;color:#7C766C;margin:18px 0 0">
        Sebastien Pessy &middot; Owner, Sebby Windows<br>
        Licensed custom home builder &middot; Dallas&ndash;Fort Worth</p>
    `);
    await sendEmail(lead.email, 'We got your window quote request', leadHtml);
  }
}

/* ---------- server ---------- */
const readBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', (c) => {
    data += c;
    if (data.length > 20_000) { reject(new Error('too large')); req.destroy(); }
  });
  req.on('end', () => resolve(data));
  req.on('error', reject);
});

createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'OPTIONS') { res.writeHead(204, corsHeaders(origin)); return res.end(); }
  if (url.pathname === '/health' || url.pathname === '/') {
    return send(res, 200, { ok: true, service: 'sebby-windows-api', supabase: Boolean(SUPABASE_KEY), resend: Boolean(RESEND_API_KEY) }, origin);
  }
  if (url.pathname !== '/quote') return send(res, 404, { ok: false, error: 'not found' }, origin);
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method not allowed' }, origin);

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  if (throttled(ip)) return send(res, 429, { ok: false, error: 'too many requests' }, origin);

  let d;
  try { d = JSON.parse(await readBody(req)); }
  catch { return send(res, 400, { ok: false, error: 'bad json' }, origin); }

  const cut = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
  const lead = {
    name: cut(d.name, 120),
    phone: cut(d.phone, 40),
    email: cut(d.email, 160),
    city: cut(d.city, 80),
    count: cut(d.count, 40),
    existing: cut(d.existing, 60),
    timeline: cut(d.timeline, 60),
    financing: cut(d.financing, 60),
    note: cut(d.note, 2000),
  };
  const digits = lead.phone.replace(/\D/g, '');
  if (lead.name.length < 2 || digits.length < 10) {
    return send(res, 400, { ok: false, error: 'name and a valid phone are required' }, origin);
  }

  let saved;
  try {
    saved = await saveLead(lead);
  } catch (err) {
    console.error('save failed:', err.message);
    return send(res, 502, { ok: false, error: 'save failed' }, origin);
  }

  // Lead is banked. Email failures must not fail the request.
  try { await notify(lead, digits); }
  catch (err) { console.error('notify failed:', err.message); }

  console.log(`lead ${saved?.id} — ${lead.name} — ${lead.city || 'no city'}`);
  return send(res, 200, { ok: true }, origin);
}).listen(PORT, () => console.log(`sebby-windows-api listening on ${PORT}`));
