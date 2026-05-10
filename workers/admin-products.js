const ALLOWED_IDS = ['beard-oil', 'combo', 'comb', 'cap-black', 'cap-grey', 'hoodie-beige', 'hoodie-black'];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://admin.rijal.in',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const token = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
    if (!(await verifyAdminToken(token, env))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    if (request.method === 'GET') {
      const data = await env.KV.get('products');
      return Response.json(
        data ? JSON.parse(data) : {},
        { headers: CORS_HEADERS }
      );
    }

    if (request.method === 'POST') {
      let updates;
      try {
        updates = await request.json();
      } catch {
        return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS });
      }

      for (const [id, val] of Object.entries(updates)) {
        if (!ALLOWED_IDS.includes(id)) {
          return Response.json({ error: `Invalid product ID: ${id}` }, { status: 400, headers: CORS_HEADERS });
        }
        if (typeof val.price !== 'number' || val.price < 1 || !Number.isFinite(val.price)) {
          return Response.json({ error: `Invalid price for ${id}` }, { status: 400, headers: CORS_HEADERS });
        }
        if (typeof val.inStock !== 'boolean') {
          return Response.json({ error: `Invalid inStock for ${id}` }, { status: 400, headers: CORS_HEADERS });
        }
      }

      const existing = JSON.parse(await env.KV.get('products') || '{}');
      const merged = { ...existing };
      for (const [id, val] of Object.entries(updates)) {
        merged[id] = { ...existing[id], ...val };
      }
      await env.KV.put('products', JSON.stringify(merged));
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
  },
};

async function verifyAdminToken(token, env) {
  try {
    if (!token) return false;
    const decoded  = atob(token);
    const parts    = decoded.split(':');
    if (parts.length < 3) return false;
    const hex      = parts.pop();
    const payload  = parts.join(':');
    const segments = payload.split(':');
    const expiresAt = parseInt(segments[segments.length - 1]);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(env.ADMIN_SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16)));
    return await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}
