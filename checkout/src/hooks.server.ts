import type { Handle } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';

export const handle: Handle = async ({ event, resolve }) => {
	const tokenParam = event.url.searchParams.get('token');
	const token = tokenParam?.split('/pay/')[1];
	if (token) {
		try {
			const decode = jwtDecode(token);
			const checkoutKey = decode?.jti;

			if (checkoutKey) {
				event.cookies.set('checkoutId', checkoutKey, {
					path: '/'
				});
			}
		} catch (error) {
			console.error('Failed to decode token:', error);
		}
	}

	const response = await resolve(event);

	return response;
};
