import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Fix: leading slash added
  if (event.url.pathname === '/api/payment/callback') {
    const originalRequest = event.request;
    const origin  = event.request.headers.get('origin');
    const referer = event.request.headers.get('referer');
    console.log(origin,referer)
    // Create new request with spoofed origin to bypass CSRF
    event.request = new Request(originalRequest, {
      headers: (() => {
        const headers = new Headers(originalRequest.headers);
        headers.set('origin', event.url.origin);  // e.g. https://jpay-demo.netlify.app
        return headers;
      })()
    });
  }

  return resolve(event);
};