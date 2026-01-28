import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
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
			`https://dev-unbadgedserver.flipopay.com/api/v1/payins/checkout-session/verify?checkoutToken=${token}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			const errorData = await response.json();

			return {
				success: false,
				message: errorData.message || 'Verification failed',
				status: response.status
			};
		}

		const data = await response.json();
		return {
			success: true,
			message: data.message,
			status: response.status,
			data: token
		};
	} catch (error) {
		return {
			success: false,
			message: 'Server error occurred',
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
};

export const actions: Actions = {
	UpiPayment: async ({}) => {
		// const fo
	}
};
