// Vercel serverless function: GET /api/get-mood?deviceId=...
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const deviceId = req.query.deviceId;
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase
    .from('moods')
    .select('mood, updated_at')
    .eq('device_id', deviceId)
    .single();

  if (error && error.code !== 'PGRST116') { // not found
    return res.status(500).json({ error: error.message });
  }

  if (!data) return res.status(200).json({});
  return res.status(200).json({ mood: data.mood, updatedAt: data.updated_at });
}
