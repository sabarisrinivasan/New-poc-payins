import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const transactionId = params.transactionId;
    console.log(transactionId)
	if (!transactionId) {
		return json({ success: false, message: 'Transaction ID is required' }, { status: 400 });
	}

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
            console.log(errorData)
			return json({ success: false, message: errorData.message });
		}

		const data = await response.json();
        console.log(data,"status")
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