import type { PaymentCheckoutToken } from '$lib/utils/types';
import type { Handle } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';

export const handle: Handle = async ({ event, resolve }) => {
	const tokenParam = event.url.searchParams.get('token');
	const token = tokenParam?.split('/pay/')[1];
	if (token) {
		const decode = jwtDecode<PaymentCheckoutToken>(token);
		const checkoutKey = decode?.jti;
		if (checkoutKey) {
			event.cookies.set('checkoutId', checkoutKey, {
				path: '/'
			});
			event.locals.checkoutData = decode;
		}
	}

	const response = await resolve(event);

	return response;
};
