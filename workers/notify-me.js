export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    try {
      const { email, productId, productName } = await request.json();
      if (!email || !productId) {
        return Response.json(
          { error: 'Missing fields' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const safe = s => String(s ?? '').replace(/[<>]/g, '');

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.RESEND_FROM_EMAIL,
          to: env.OWNER_EMAIL,
          subject: `🔔 Restock Request — ${safe(productName)}`,
          text: `${safe(email)} wants to be notified when ${safe(productName)} (ID: ${safe(productId)}) is back in stock.`,
        }),
      });

      return Response.json(
        { success: true },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    } catch (err) {
      return Response.json(
        { error: 'Failed to register.' },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
  },
};
