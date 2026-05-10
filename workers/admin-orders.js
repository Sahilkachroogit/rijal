const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://admin.rijal.in',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const VALID_STATUSES = ['paid', 'shipped', 'delivered'];

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const token = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
    if (!(await verifyAdminToken(token, env))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // PATCH /api/admin/orders/<orderId>
    if (request.method === 'PATCH') {
      const pathParts = url.pathname.split('/').filter(Boolean);
      const orderId   = pathParts[pathParts.length - 1];
      if (!orderId || orderId === 'orders') {
        return Response.json({ error: 'Order ID required' }, { status: 400, headers: CORS_HEADERS });
      }

      let status;
      try {
        ({ status } = await request.json());
      } catch {
        return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS });
      }

      if (!VALID_STATUSES.includes(status)) {
        return Response.json({ error: 'Invalid status' }, { status: 400, headers: CORS_HEADERS });
      }

      const raw = await env.KV.get(`order:${orderId}`);
      if (!raw) {
        return Response.json({ error: 'Order not found' }, { status: 404, headers: CORS_HEADERS });
      }

      const order = JSON.parse(raw);
      order.status = status;
      await env.KV.put(`order:${orderId}`, JSON.stringify(order));
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    // GET /api/admin/orders
    if (request.method === 'GET') {
      const page  = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
      const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));

      const index = JSON.parse(await env.KV.get('order_index') || '[]');
      const total = index.length;
      const slice = index.slice((page - 1) * limit, page * limit);

      const orders = await Promise.all(
        slice.map(async id => {
          const raw = await env.KV.get(`order:${id}`);
          return raw ? JSON.parse(raw) : null;
        })
      );

      // Compute stats from ALL orders (not just current page)
      let totalRevenue = 0;
      const statusCounts  = { paid: 0, shipped: 0, delivered: 0 };
      const productSales  = {};

      await Promise.all(
        index.map(async id => {
          const raw = await env.KV.get(`order:${id}`);
          if (!raw) return;
          const o = JSON.parse(raw);
          totalRevenue += o.amountPaise || 0;
          if (statusCounts[o.status] !== undefined) {
            statusCounts[o.status]++;
          }
          if (o.productId) {
            productSales[o.productId] = (productSales[o.productId] || 0) + (o.qty || 1);
          }
        })
      );

      return Response.json(
        {
          orders:     orders.filter(Boolean),
          pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
          stats:      { totalOrders: total, totalRevenue, statusCounts, productSales },
        },
        { headers: CORS_HEADERS }
      );
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
