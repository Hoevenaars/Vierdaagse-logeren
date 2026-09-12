import { z } from 'zod';

export const config = { runtime: 'edge' };

const schema = z.object({
  event: z.enum([
    'impression',
    'result_click',
    'provider_view',
    'outbound_booking_click',
    'lead',
    'alert',
  ]),
  provider: z.string().max(120).optional(),
  path: z.string().max(200).optional(),
});

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: 'Ongeldige trackingdata.' }, 400);
    }
    console.info('track', parsed.data);
    return json({ success: true });
  } catch {
    return json({ error: 'Tracking mislukt.' }, 400);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
