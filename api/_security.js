// Simple CORS + auth helpers

export function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin'
  };
}

export function isAllowedOrigin(req) {
  const allowed = process.env.ALLOWED_ORIGIN; // e.g. https://mood-test.vercel.app
  if (!allowed) return false;                  // safe default
  const origin = req.headers.origin || req.headers.Origin;
  if (!origin) return true;                    // same-origin/server-to-server
  try {
    const a = new URL(allowed);
    const o = new URL(origin);
    return a.protocol === o.protocol && a.host === o.host;
  } catch { return false; }
}

export function hasValidToken(req) {
  const expected = process.env.API_SECRET;     // optional
  if (!expected) return false;
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${expected}`;
}
