// Vercel serverless function — verwerkt aanmeldingen van particuliere verhuur.
// Vereist: environment variable RESEND_API_KEY (aan te maken via resend.com, gratis tier)
// en OWNER_EMAIL (het e-mailadres waar meldingen naartoe moeten).
//
// Werking: een aanmelding wordt NIET automatisch gepubliceerd. De eigenaar ontvangt
// een e-mail met de gegevens en voegt de locatie zelf handmatig toe aan
// src/data/locations.json zodra deze is goedgekeurd (lichte moderatie, zie
// 24_DECISION_LOG.md — "Verdienmodel particuliere-verhuur-aanmeldingen").

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { naam, plaats, type, beschrijving, contact, categorie, website_hp } = body;

    // Honeypot-veld: bots vullen verborgen velden vaak automatisch in.
    // Een mens laat dit leeg; als het gevuld is, doen we alsof het gelukt is
    // maar sturen we niets door.
    if (website_hp) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basisvalidatie — server-side, ook al valideert de browser al
    if (!naam || !plaats || !contact) {
      return new Response(
        JSON.stringify({ error: 'Vul in ieder geval naam, plaats en contactgegevens in.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const ownerEmail = process.env.OWNER_EMAIL;

    if (!apiKey || !ownerEmail) {
      // Ontbrekende configuratie — geen silent fail, duidelijke serverfout loggen
      console.error('RESEND_API_KEY of OWNER_EMAIL ontbreekt in environment variables');
      return new Response(
        JSON.stringify({ error: 'Aanmelden is momenteel niet beschikbaar. Probeer het later opnieuw.' }),
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
        from: 'Vierdaagse Logeren <aanmeldingen@vierdaagselogeren.nl>',
        to: [ownerEmail],
        subject: `Nieuwe aanmelding (${categorie || 'onbekend type'}): ${naam}`,
        text: [
          `Nieuwe aanmelding via Vierdaagse Logeren:`,
          ``,
          `Categorie: ${categorie || '(niet opgegeven)'}`,
          `Naam: ${naam}`,
          `Plaats: ${plaats}`,
          `Type: ${type || '(niet opgegeven)'}`,
          `Beschrijving: ${beschrijving || '(niet opgegeven)'}`,
          `Contact: ${contact}`,
          ``,
          `Goedkeuren? Voeg dit toe aan het juiste databestand (src/data/locations.json voor`,
          `particulier, src/data/campings.json of src/data/hotels.json) en redeploy.`,
        ].join('\n'),
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
    console.error('Onverwachte fout bij verwerken aanmelding:', error);
    return new Response(
      JSON.stringify({ error: 'Er ging iets mis. Probeer het later opnieuw.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
