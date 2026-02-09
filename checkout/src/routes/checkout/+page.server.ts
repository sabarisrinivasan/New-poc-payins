import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const tokenParam = url.searchParams.get('token');
	const token = tokenParam?.split('/pay/')[1];
	if (!token) {
		return {
			success: false,
			message: 'No checkout token provided'
		};
	}

	try {
		const response = await fetch(
			`${env.VITE_API_URL}/payins/checkout-session/verify?checkoutToken=${token}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			console.log(errorData, 'error');
			throw redirect(303, '/session-expired');
		}

		const data = await response.json();
		console.log(data, 'data');
		return {
			success: true,
			message: data.message,
			status: response.status,
			data: locals.checkoutData
		};
	} catch (error) {
		return {
			success: false,
			message: 'Server error occurred',
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
};
