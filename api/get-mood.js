import { createClient } from '@supabase/supabase-js';
import { corsHeaders, isAllowedOrigin, hasValidToken } from './_security.js';

export default async function handler(req, res) {
  const originOk = isAllowedOrigin(req);
  const tokenOk  = hasValidToken(req);

  if (req.method === 'OPTIONS') {
    return res.writeHead(204, corsHeaders(originOk ? process.env.ALLOWED_ORIGIN : '')).end();
  }

  if (!originOk && !tokenOk) {
    return res.writeHead(403, { 'content-type': 'application/json', ...corsHeaders('') })
              .end(JSON.stringify({ error: 'Forbidden' }));
  }

  const deviceId = req.query.deviceId || (req.body && req.body.deviceId);
  if (!deviceId) {
    return res.writeHead(400, { 'content-type': 'application/json', ...corsHeaders(process.env.ALLOWED_ORIGIN) })
              .end(JSON.stringify({ error: 'deviceId required' }));
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // maybeSingle() = clean "not found" handling
  const { data, error } = await supabase
    .from('moods')
    .select('mood, updated_at')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    return res.writeHead(500, { 'content-type': 'application/json', ...corsHeaders(process.env.ALLOWED_ORIGIN) })
              .end(JSON.stringify({ error: error.message }));
  }

  const payload = data ? { mood: data.mood, updatedAt: data.updated_at } : {};
  return res.writeHead(200, { 'content-type': 'application/json', ...corsHeaders(process.env.ALLOWED_ORIGIN) })
            .end(JSON.stringify(payload));
}
