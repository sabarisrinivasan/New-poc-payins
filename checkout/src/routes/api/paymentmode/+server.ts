import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const checkOutId = cookies.get('checkoutId');
	const requestData = await request.json();
   console.log(checkOutId)
	try {
		const response = await fetch(
			'https://dev-unbadgedserver.flipopay.com/api/v1/payins/upi/collect',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Checkout-Key': `${checkOutId}`
				},
				body: JSON.stringify(requestData)
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
              console.log(errorData,"error")
			return json({ success: false, message: errorData.message, data: errorData.data });
		}

		const data = await response.json();
        console.log(data,"success")
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

