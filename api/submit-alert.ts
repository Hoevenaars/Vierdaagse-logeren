import { z } from 'zod';

export const config = { runtime: 'edge' };

const schema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  accommodation_type: z.string().max(40).optional(),
  party_size: z.coerce.number().int().min(1).max(12).optional(),
  preferred_region: z.string().max(80).optional(),
  website_hp: z.string().optional(),
  privacy: z.union([z.literal('1'), z.literal(true), z.literal('true')]),
});

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: 'Vul een geldig e-mailadres in en bevestig de privacyverklaring.' }, 400);
    }
    if (parsed.data.website_hp) {
      return json({ success: true });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const ownerEmail = process.env.OWNER_EMAIL;
    if (!apiKey || !ownerEmail) {
      return json({ error: 'Alert instellen is nu niet beschikbaar.' }, 500);
    }

    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vierdaagse Logeren <contact@vierdaagselogeren.nl>',
        to: [ownerEmail],
        reply_to: parsed.data.email,
        subject: 'Booking alert 2027',
        text: [
          `E-mail: ${parsed.data.email}`,
          `Verblijf: ${parsed.data.accommodation_type ?? ''}`,
          `Personen: ${parsed.data.party_size ?? ''}`,
          `Regio: ${parsed.data.preferred_region ?? ''}`,
          '',
          'Doel: seintje wanneer Vierdaagsecampings 2027 openen. Geen nieuwsbrief.',
        ].join('\n'),
      }),
    });

    if (!sent.ok) {
      return json({ error: 'Versturen mislukt. Probeer het later opnieuw.' }, 502);
    }
    return json({ success: true });
  } catch {
    return json({ error: 'Er ging iets mis.' }, 500);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
