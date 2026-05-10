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

    const PRICES = {
      'beard-oil': 39900,
      'combo':     49900,
      'comb':      19900,
    };

    const cors = { 'Access-Control-Allow-Origin': '*' };

    try {
      const body = await request.json();
      const { customer } = body;

      if (!customer?.name || !customer?.email || !customer?.phone) {
        return Response.json({ error: 'Missing customer details' }, { status: 400, headers: cors });
      }

      // Accept items array OR single productId+qty for backwards compat
      let orderItems;
      if (body.items && Array.isArray(body.items) && body.items.length > 0) {
        orderItems = body.items;
      } else if (body.productId) {
        orderItems = [{ productId: body.productId, qty: parseInt(body.qty) || 1 }];
      } else {
        return Response.json({ error: 'No items in order' }, { status: 400, headers: cors });
      }

      // Validate every item and tally amount
      let amount = 0;
      for (const item of orderItems) {
        if (!PRICES[item.productId]) {
          return Response.json({ error: `Invalid product: ${item.productId}` }, { status: 400, headers: cors });
        }
        const q = parseInt(item.qty) || 1;
        if (q < 1 || q > 5) {
          return Response.json({ error: 'Quantity must be 1–5 per item' }, { status: 400, headers: cors });
        }
        amount += PRICES[item.productId] * q;
      }

      const credentials = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
      const itemsSummary = orderItems.map(i => `${i.productId}×${i.qty}`).join(', ');

      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt: `rijal_${Date.now()}`,
          notes: { items: itemsSummary, customerName: customer.name },
        }),
      });

      if (!rzpRes.ok) throw new Error('Razorpay order creation failed');
      const order = await rzpRes.json();

      return Response.json(
        { razorpay_order_id: order.id, amount: order.amount, currency: order.currency },
        { headers: cors }
      );
    } catch (err) {
      return Response.json(
        { error: 'Order creation failed. Please try again.' },
        { status: 500, headers: cors }
      );
    }
  },
};
