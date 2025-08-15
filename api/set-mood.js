import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = {};
  try { body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}'); } catch {}
  const { deviceId, mood } = body || {};
  const allowed = ['happy','sad','excited','tired'];
  if (!deviceId || !allowed.includes(mood)) return res.status(400).json({ error: 'Bad input' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} });
  const now = new Date().toISOString();

  const { error } = await supabase.from('moods').upsert({ device_id: deviceId, mood, updated_at: now });
  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ ok:true, updatedAt: now });
}
