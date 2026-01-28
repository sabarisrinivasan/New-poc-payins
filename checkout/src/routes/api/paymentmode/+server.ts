import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const checkOutId = cookies.get('checkoutId');
	const payinRequest = {
		amount: '1500.00',
		currency: 'INR',
		customerPhoneNumber: '74444545484',
		customerEmail: 'vicky@gmail.com',
		payerVPA: 'testuser@upi',
		orderId: 'YQTQ23242193102434',
		callBackUrl: 'https://yourapp.com/api/payin/callback',
		orgId: 10094,
		checkoutId: `${checkOutId}`,
		paymentMethod: 'UPI_COLLECT'
	};

	try {
		const response = await fetch(
			'https://dev-unbadgedserver.flipopay.com/api/v1/payins/upi/collect',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Checkout-Key': `${checkOutId}`
				},
				body: JSON.stringify(payinRequest)
			}
		);

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
		const response = await fetch(
			`https://dev-unbadgedserver.flipopay.com/api/v1/payins/status/${transactionId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			const errorData = await response.json();

			return json({ success: false, message: errorData.message });
		}

		const data = await response.json();
		console.log(data, 'data');

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
