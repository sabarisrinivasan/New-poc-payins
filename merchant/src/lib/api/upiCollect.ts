export const postUpi = async () => {
	const payload = {
		transactionAmount: '500',
		currency: 'INR',
		orderId: 'YQTQ23242193109292',
		customerPhoneNumber: '9305967058',
		orgId: parseInt('10094'),
		merchantRedirectUrl: 'http://localhost:5173/callback',
		customerEmail:'vicky@gmail.com'
	};
	try {
		const response = await fetch(
			'https://dev-unbadgedserver.flipopay.com/api/v1/payins/checkout-session',
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
