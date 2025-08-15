// Vercel serverless function: POST /api/set-mood
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { deviceId, mood } = req.body || {};
  if (!deviceId || !mood) return res.status(400).json({ error: 'deviceId and mood required' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // upsert: insert or update same device_id
  const { error } = await supabase
    .from('moods')
    .upsert({ device_id: deviceId, mood, updated_at: new Date().toISOString() });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true, updatedAt: new Date().toISOString() });
}
