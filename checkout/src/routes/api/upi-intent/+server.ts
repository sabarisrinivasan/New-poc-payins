import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const intentRequest = await request.json();
   console.log(intentRequest)
	try {
		const res = await fetch(`${import.meta.env.VITE_API_URL}/payins/upi/intent`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(intentRequest)
		});

		const data = await res.json();
		

		return json({ success: true, data: data });
	} catch (error) {
		console.log(error);
		return json({ success: false, message: 'Failed to generate QR' }, { status: 500 });
	}
};
