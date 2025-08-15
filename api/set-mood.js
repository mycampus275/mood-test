import { createClient } from '@supabase/supabase-js';
import { corsHeaders, isAllowedOrigin, hasValidToken } from './_security.js';

const allowedMoods = ['happy', 'sad', 'excited', 'tired']; // whitelist

export default async function handler(req, res) {
  const originOk = isAllowedOrigin(req);
  const tokenOk  = hasValidToken(req);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.writeHead(204, corsHeaders(originOk ? process.env.ALLOWED_ORIGIN : '')).end();
  }

  // Block unknown origins unless a valid token is provided
  if (!originOk && !tokenOk) {
    return res.writeHead(403, { 'content-type': 'application/json', ...corsHeaders('') })
              .end(JSON.stringify({ error: 'Forbidden' }));
  }

  if (req.method !== 'POST') {
    return res.writeHead(405, { 'content-type': 'application/json', ...corsHeaders(process.env.ALLOWED_ORIGIN) })
              .end(JSON.stringify({ error: 'Method not allowed' }));
  }

  // Parse body safely
  let body = {};
  try { body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}'); }
  catch { /* ignore */ }

  const { deviceId, mood } = body || {};
  if (!deviceId || !mood) {
    return res.writeHead(400, { 'content-type': 'application/json', ...corsHeaders(process.env.ALLOWED_ORIGIN) })
              .end(JSON.stringify({ error: 'deviceId and mood required' }));
  }

  // Validate mood on the server
  if (!allowedMoods.includes(String(mood))) {
    return res.writeHead(400, { 'content-type': 'application/json', ...corsHeaders(process.env.ALLOWED_ORIGIN) })
              .end(JSON.stringify({ error: 'Invalid mood' }));
  }

  // Create Supabase server client with private keys
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // Use ONE timestamp for DB and response
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('moods')
    .upsert({ device_id: deviceId, mood, updated_at: now });

  if (error) {
    return res.writeHead(500, { 'content-type': 'application/json', ...corsHeaders(process.env.ALLOWED_ORIGIN) })
              .end(JSON.stringify({ error: error.message }));
  }

  return res.writeHead(200, { 'content-type': 'application/json', ...corsHeaders(process.env.ALLOWED_ORIGIN) })
            .end(JSON.stringify({ ok: true, updatedAt: now }));
}
