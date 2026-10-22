export const checkUpiVerify = async (checkoutToken: string) => {
	console.log(checkoutToken);

	try {
		const response = await fetch(
			`https://dev-unbadgedserver.flipopay.com/api/v1/payins/checkout-session/verify?checkoutToken=${checkoutToken}`,
			{
				method: 'GET', // Optional, GET is default
				headers: {
					'Content-Type': 'application/json'
					// Add auth headers if needed
					// 'Authorization': 'Bearer YOUR_TOKEN'
				}
			}
		);
		console.log('Response status:', response.status);

		if (!response.ok) {
			const errorData = await response.json();
			console.log(errorData);
		}

		const data = await response.json();
		console.log('Verify success:', data);
		return { message: data.message, status: response.status };
	} catch (error) {
		console.log(error, 'error');
		return error;
	}
};
