import { env } from '$env/dynamic/private';

export interface UpiPayload {
	amount: string;
	name: string;
	email: string;
	phone: string;
	city: string;
	zipCode: string;
	description: string;
}

interface PaymentOrderRequest {
	amount: string;
	clientOrderId: string;
	customer: {
		city: string;
		country: string;
		email: string;
		name: string;
		phoneNumber: string;
		zipCode: string;
	};
	description: string;
	merchantUrl: {
		cancelUrl: string;
		failureUrl: string;
		successUrl: string;
	};
	orgId: string;
}

export interface PaymentOrderResponse {
	amount: string;
	checkoutExpiry: string;
	checkoutUrl: string;
	clientOrderId: string;
	message: string;
	orderId: string;
	status: string;
}

export class PaymentOrderError extends Error {
	constructor(
		message: string,
		public readonly status: number
	) {
		super(message);
		this.name = 'PaymentOrderError';
	}
}

function getRequiredConfig(name: string, legacyName?: string): string {
	const value = env[name] ?? (legacyName ? env[legacyName] : undefined);

	if (!value) {
		throw new PaymentOrderError(`Missing server configuration: ${name}`, 500);
	}

	return value;
}

function getOrderEndpoint(): string {
	const baseUrl = getRequiredConfig('PAYIN_API_URL', 'VITE_PUBLIC_PAYIN_URL');

	try {
		return new URL('/api/v1/payment/orders', baseUrl).toString();
	} catch {
		throw new PaymentOrderError('PAYIN_API_URL must be a valid URL', 500);
	}
}

function getErrorMessage(value: unknown): string {
	if (!value || typeof value !== 'object') return 'Unable to create payment order';

	const error = value as Record<string, unknown>;
	if (typeof error.message === 'string' && error.message.trim()) return error.message;

	if (Array.isArray(error.errors)) {
		const messages = error.errors.flatMap((item) => {
			if (!item || typeof item !== 'object') return [];
			const message = (item as Record<string, unknown>).message;
			if (typeof message === 'string') return [message];
			if (Array.isArray(message))
				return message.filter((entry): entry is string => typeof entry === 'string');
			return [];
		});

		if (messages.length > 0) return messages.join(', ');
	}

	return 'Unable to create payment order';
}

function isPaymentOrderResponse(value: unknown): value is PaymentOrderResponse {
	if (!value || typeof value !== 'object') return false;

	const response = value as Record<string, unknown>;
	return [
		'amount',
		'checkoutExpiry',
		'checkoutUrl',
		'clientOrderId',
		'message',
		'orderId',
		'status'
	].every((field) => typeof response[field] === 'string');
}

export async function postUpi(
	params: UpiPayload,
	fetcher: typeof fetch = fetch
): Promise<PaymentOrderResponse> {
	const payload: PaymentOrderRequest = {
		amount: params.amount,
		clientOrderId: `ORDER-${crypto.randomUUID()}`,
		customer: {
			city: params.city,
			country: 'India',
			email: params.email,
			name: params.name,
			phoneNumber: params.phone,
			zipCode: params.zipCode
		},
		description: params.description,
		merchantUrl: {
			cancelUrl: getRequiredConfig('PAYIN_CANCEL_URL', 'VITE_PUBLIC_CANCEL_URL'),
			failureUrl: getRequiredConfig('PAYIN_FAILURE_URL', 'VITE_PUBLIC_FAILURE_URL'),
			successUrl: getRequiredConfig('PAYIN_SUCCESS_URL', 'VITE_PUBLIC_SUCCESS_URL')
		},
		orgId: env.PAYIN_ORG_ID ?? '10001'
	};

	const endpoint = getOrderEndpoint();
	const headers = {
		'Content-Type': 'application/json',
		'X-Client-Key': getRequiredConfig('PAYIN_CLIENT_KEY'),
		'X-Client-Secret': getRequiredConfig('PAYIN_CLIENT_SECRET')
	};
	const debugLogsEnabled = env.PAYIN_DEBUG_LOGS === 'true';

	if (debugLogsEnabled) {
		console.info('Payment order API request:', {
			url: endpoint,
			method: 'POST',
			headers: {
				...headers,
				'X-Client-Secret': '[REDACTED]'
			},
			payload
		});
	}

	let response: Response;

	try {
		response = await fetcher(endpoint, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload)
		});
	} catch {
		throw new PaymentOrderError('Payment service is unavailable', 502);
	}

	const data: unknown = await response.json().catch(() => null);
	if (debugLogsEnabled) {
		console.info('Payment order API response:', {
			status: response.status,
			ok: response.ok,
			data
		});
	}

	if (!response.ok) {
		throw new PaymentOrderError(getErrorMessage(data), response.status);
	}

	if (!isPaymentOrderResponse(data)) {
		throw new PaymentOrderError('Payment service returned an invalid order response', 502);
	}

	if (data.status.toUpperCase() === 'FAILED' || !data.checkoutUrl.trim()) {
		if (debugLogsEnabled) {
			console.error('Payment order API error response:', data);
		}

		throw new PaymentOrderError(data.message || 'Failed to create payment order', 502);
	}

	return data;
}
