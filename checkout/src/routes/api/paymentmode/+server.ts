import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const checkOutId = cookies.get('checkoutId');
	const requestData = await request.json();

	try {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/payins/upi/collect`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Checkout-Key': `${checkOutId}`
			},
			body: JSON.stringify(requestData)
		});

		if (!response.ok) {
			const errorData = await response.json();

			return json({ success: false, message: errorData.message, data: errorData.data });
		}

		const data = await response.json();

		return json({ success: true, data });
	} catch (error) {
		return json(
			{
				success: false,
				message: error instanceof Error ? error.message : 'An error occurred'
			},
			{ status: 500 }
		);
	}
};

export const GET: RequestHandler = async ({ url }) => {
	const transactionId = url.searchParams.get('crn');

	try {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/payins/status/${transactionId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorData = await response.json();

			return json({ success: false, message: errorData.message });
		}

		const data = await response.json();

		return json({ success: true, data });
	} catch (error) {
		return json(
			{
				success: false,
				message: error instanceof Error ? error.message : 'An error occurred'
			},
			{ status: 500 }
		);
	}
};
