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
      const { name, email, phone, message } = await request.json();
      if (!name || !email || !message) {
        return Response.json(
          { error: 'Missing fields' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      // Sanitise for email body
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
          subject: `💬 Website Inquiry from ${safe(name)}`,
          text: `Name: ${safe(name)}\nEmail: ${safe(email)}\nPhone: ${safe(phone) || 'Not provided'}\n\nMessage:\n${safe(message)}`,
        }),
      });

      return Response.json(
        { success: true },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    } catch (err) {
      return Response.json(
        { error: 'Failed to send message.' },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
  },
};
