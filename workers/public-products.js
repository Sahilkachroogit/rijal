// Public read-only endpoint — returns price, mrp, inStock only. No auth required.
// Used by shop.html, product pages, and checkout.html to get live prices from KV.
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://rijal.in',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const raw = await env.KV.get('products');
    if (!raw) {
      return new Response('{}', {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': 'https://rijal.in',
        },
      });
    }

    // Strip to only price, mrp, inStock — never expose order or customer data
    const all      = JSON.parse(raw);
    const safe     = {};
    for (const [id, val] of Object.entries(all)) {
      safe[id] = {
        price:   val.price,
        mrp:     val.mrp,
        inStock: val.inStock,
      };
    }

    return new Response(JSON.stringify(safe), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': 'https://rijal.in',
      },
    });
  },
};
