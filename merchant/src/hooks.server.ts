


export const handle = async ({ event, resolve }) => {
  // Allow cross-site POST for payment callback route
  if (event.url.pathname === 'api/payment/callback') {
    // Override the CSRF check by setting origin
    event.request.headers.set('origin', event.url.origin);
  }

  return resolve(event);
};