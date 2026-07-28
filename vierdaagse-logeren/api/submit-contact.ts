// Vercel serverless function — verwerkt algemene contactvragen (niet voor
// locatie-aanmeldingen, zie submit-location.ts daarvoor).
// Vereist dezelfde environment variables: RESEND_API_KEY en OWNER_EMAIL.

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { naam, email, telefoon, bericht, website_hp } = body;

    if (website_hp) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!naam || !email || !bericht) {
      return new Response(
        JSON.stringify({ error: 'Vul naam, e-mailadres en bericht in.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const ownerEmail = process.env.OWNER_EMAIL;

    if (!apiKey || !ownerEmail) {
      console.error('RESEND_API_KEY of OWNER_EMAIL ontbreekt in environment variables');
      return new Response(
        JSON.stringify({ error: 'Contactformulier is momenteel niet beschikbaar. Probeer het later opnieuw.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vierdaagse Logeren <contact@vierdaagselogeren.nl>',
        to: [ownerEmail],
        reply_to: email,
        subject: `Contactformulier: bericht van ${naam}`,
        text: [
          `Naam: ${naam}`,
          `E-mail: ${email}`,
          telefoon ? `Telefoon: ${telefoon}` : null,
          ``,
          `Bericht:`,
          bericht,
        ].filter(Boolean).join('\n'),
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error('Resend API fout:', errText);
      return new Response(
        JSON.stringify({ error: 'Versturen mislukt. Probeer het later opnieuw.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Onverwachte fout bij verwerken contactbericht:', error);
    return new Response(
      JSON.stringify({ error: 'Er ging iets mis. Probeer het later opnieuw.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
