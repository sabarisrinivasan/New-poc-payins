import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

interface CallbackPayload {
	[key: string]: unknown;
}

function getFirstString(payload: CallbackPayload, keys: string[]): string | null {
	for (const key of keys) {
		const value = payload[key];
		if (typeof value === 'string' && value.trim()) return value.trim();
	}

	return null;
}

function normalizeStatus(status: string | null): 'SUCCESS' | 'FAILED' | 'CANCELLED' {
	switch (status?.toUpperCase()) {
		case 'SUCCESS':
		case 'SUCCESSFUL':
		case 'COMPLETED':
		case 'PAID':
			return 'SUCCESS';
		case 'FAILED':
		case 'FAILURE':
		case 'ERROR':
			return 'FAILED';
		default:
			return 'CANCELLED';
	}
}

async function readCallbackPayload(request: Request): Promise<CallbackPayload> {
	const contentType = request.headers.get('content-type') ?? '';

	if (contentType.includes('application/json')) {
		const data: unknown = await request.json();
		return data && typeof data === 'object' ? (data as CallbackPayload) : {};
	}

	const formData = await request.formData();
	return Object.fromEntries(
		Array.from(formData.entries(), ([key, value]) => [
			key,
			typeof value === 'string' ? value : value.name
		])
	);
}

export const actions: Actions = {
	default: async ({ request, url }) => {
		const payload = await readCallbackPayload(request);
		const status = normalizeStatus(
			getFirstString(payload, ['status', 'paymentStatus', 'payment_status']) ??
				url.searchParams.get('status')
		);
		const paymentId = getFirstString(payload, [
			'paymentId',
			'payment_id',
			'transactionId',
			'transaction_id',
			'txnid',
			'orderId'
		]);

		const redirectParams = new URLSearchParams({ status });
		if (paymentId) redirectParams.set('paymentId', paymentId);

		redirect(303, `/callback?${redirectParams.toString()}`);
	}
};
