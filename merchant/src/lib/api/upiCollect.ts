export interface UpiPayload {
	amount: string;
	name: string;
	email: string;
	phone: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	zipCode: string;
}

export const postUpi = async (params: UpiPayload) => {
	const payload = {
		amount: params.amount,
		currency: 'INR',
		orderId: `ORDERSAB${+new Date()}`,
		customer: {
			phoneNumber: params.phone,
			name: params.name,
			email: params.email
		},
		address: {
			line1: params.addressLine1,
			line2: params.addressLine2,
			city: params.city,
			state: params.state,
			country: 'India',
			zipCode: params.zipCode
		},
		orgId: 10094,
		merchantUrl: {
			successUrl: 'http://localhost:5173/callback',
			failureUrl: 'http://localhost:5173/callback',
			cancelUrl: 'http://localhost:5173/callback'
		}
	};
	try {
		const response = await fetch(
			'https://ubs.jubiliantpay.com/api/v1/payins/checkout-session',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			return errorData;
		}
		const successData = await response.json();
		return successData;
	} catch (error) {
		console.log(error, 'error');
		return error;
	}
};
