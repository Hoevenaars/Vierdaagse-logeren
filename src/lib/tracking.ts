export type TrackEvent =
  | 'impression'
  | 'result_click'
  | 'provider_view'
  | 'outbound_booking_click'
  | 'lead'
  | 'alert';

export function trackBrowserEvent(event: TrackEvent, payload: Record<string, string | number | null | undefined> = {}): void {
  const body = JSON.stringify({
    event,
    ...payload,
    path: typeof location !== 'undefined' ? location.pathname : undefined,
  });

  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {
    // Fall through to fetch.
  }

  void fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
