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
      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        customer,
        cart,
      } = await request.json();

      // HMAC-SHA256 verification
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(env.RAZORPAY_KEY_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
      const hex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');

      if (hex !== razorpay_signature) {
        return Response.json(
          { error: 'Payment verification failed' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const amountRupees = Math.round(cart.price / 100);

      // Write order to KV (fire-and-forget — don't block email sending on KV errors)
      if (env.KV) {
        try {
          const orderData = {
            orderId:     razorpay_order_id,
            paymentId:   razorpay_payment_id,
            productId:   cart.productId || '',
            productName: cart.productName,
            qty:         cart.qty || 1,
            amountPaise: cart.price,
            customer,
            status:      'paid',
            placedAt:    Date.now(),
          };
          await env.KV.put(`order:${razorpay_order_id}`, JSON.stringify(orderData));

          const index = JSON.parse(await env.KV.get('order_index') || '[]');
          index.unshift(razorpay_order_id);
          await env.KV.put('order_index', JSON.stringify(index));
        } catch (kvErr) {
          console.error('[verify-payment] KV write failed:', kvErr);
        }
      }

      await Promise.allSettled([
        sendEmail(env, {
          to: env.OWNER_EMAIL,
          subject: `🛒 New Order — ${cart.productName} × ${cart.qty} — ₹${amountRupees}`,
          text: `New order received on Rijal Store.\n\nOrder ID: ${razorpay_order_id}\nPayment ID: ${razorpay_payment_id}\nProduct: ${cart.productName} × ${cart.qty}\nAmount Paid: ₹${amountRupees}\n\nCustomer:\nName: ${customer.name}\nPhone: ${customer.phone}\nEmail: ${customer.email}\nAddress: ${customer.address}\n\nPlease fulfil and ship within 2 business days.`,
        }),
        sendEmail(env, {
          to: customer.email,
          subject: `Your Rijal Order is Confirmed! 🎉`,
          text: `Assalamu Alaikum ${customer.name},\n\nYour order has been placed successfully.\n\nOrder ID: ${razorpay_order_id}\nProduct: ${cart.productName} × ${cart.qty}\nAmount Paid: ₹${amountRupees} (Free Shipping)\n\nDelivery Address: ${customer.address}\n\nWe'll dispatch your order within 2 business days.\nFor queries: WhatsApp us at +91-9103998116 or email rijalstore1212@gmail.com\n\nJazakallah Khair,\nTeam Rijal`,
        }),
      ]);

      return Response.json(
        { success: true },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    } catch (err) {
      return Response.json(
        { error: 'Verification error' },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
  },
};

async function sendEmail(env, { to, subject, text }) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject,
      text,
    }),
  });
}
