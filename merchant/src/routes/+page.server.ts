import { PaymentOrderError, postUpi } from '$lib/api/upiCollect';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

function getRequiredField(formData: FormData, name: string): string {
	const value = formData.get(name);

	if (typeof value !== 'string' || !value.trim()) {
		throw new Error(`${name} is required`);
	}

	return value.trim();
}

export const actions: Actions = {
	default: async ({ fetch, request }) => {
		const formData = await request.formData();

		try {
			const amount = getRequiredField(formData, 'amount');
			if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
				return fail(400, { success: false, error: 'Amount must be greater than zero' });
			}

			const data = await postUpi(
				{
					amount,
					name: getRequiredField(formData, 'name'),
					email: getRequiredField(formData, 'email'),
					phone: getRequiredField(formData, 'phone'),
					city: getRequiredField(formData, 'city'),
					zipCode: getRequiredField(formData, 'zipCode'),
					description: 'Fine T-Shirt purchase'
				},
				fetch
			);

			return {
				success: true,
				response: data
			};
		} catch (error) {
			console.error('Payment order creation failed:', error);

			if (error instanceof PaymentOrderError) {
				const status = error.status >= 400 && error.status <= 599 ? error.status : 502;
				return fail(status, { success: false, error: error.message });
			}

			return fail(400, {
				success: false,
				error: error instanceof Error ? error.message : 'Invalid order details'
			});
		}
	}
};
