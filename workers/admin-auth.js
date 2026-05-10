export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://admin.rijal.in',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let uid, password;
    try {
      ({ uid, password } = await request.json());
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (typeof uid !== 'string' || typeof password !== 'string') {
      await sleep(500);
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const uidMatch = timingSafeEqual(uid, env.ADMIN_UID);
    const pwMatch  = timingSafeEqual(password, env.ADMIN_PASSWORD);

    if (!uidMatch || !pwMatch) {
      await sleep(500);
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    const payload   = `${uid}:${expiresAt}`;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(env.ADMIN_SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const hex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
    const token = btoa(`${payload}:${hex}`);

    return Response.json(
      { token, expiresAt },
      { headers: { 'Access-Control-Allow-Origin': 'https://admin.rijal.in' } }
    );
  },
};

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const lenA = a.length;
  const lenB = b.length;
  let diff = lenA ^ lenB;
  const maxLen = Math.max(lenA, lenB);
  for (let i = 0; i < maxLen; i++) {
    diff |= (a.charCodeAt(i % lenA) ^ b.charCodeAt(i % lenB));
  }
  return diff === 0;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
