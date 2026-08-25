const PAYMENT_DESCRIPTIONS = [
	'Fine T-Shirt purchase',
	'Premium cotton apparel order',
	'Online fashion purchase',
	'Merchant product checkout'
] as const;

function getRandomPaymentDescription(): string {
	const randomIndex = Math.floor(Math.random() * PAYMENT_DESCRIPTIONS.length);
	return PAYMENT_DESCRIPTIONS[randomIndex];
}

export interface UpiPayload {
	amount: string;
	name: string;
	email: string;
	phone: string;
	city: string;
	zipCode: string;
}

const PAYMENT_METHODS = ['UPI', 'card', 'net_banking'] as const;

interface PaymentOrderRequest {
	orgId: string;
	amount: string;
	clientOrderId: string;
	customer: {
		phoneNumber: string;
		name: string;
		email: string;
		city: string;
		country: string;
		zipCode: string;
	};
	merchantUrl: {
		successUrl: string;
		cancelUrl: string;
		failureUrl: string;
	};
	description: string;
	PaymentMethods: readonly string[];
}

function generateClientOrderId(): string {
	const timestamp = Date.now().toString();
	const random = crypto.getRandomValues(new Uint32Array(1))[0] % 100;
	return `${timestamp}${random.toString().padStart(2, '0')}`;
}

export interface PaymentOrderResponse {
	amount: string;
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

function getRequiredConfig(name: string): string {
	const value = import.meta.env[name];

	if (!value) {
		throw new PaymentOrderError(`Missing server configuration: ${name}`, 500);
	}

	return value;
}

function getOrderEndpoint(): string {
	const baseUrl = getRequiredConfig('VITE_PUBLIC_PAYIN_URL');

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
		'checkoutUrl',
		'clientOrderId',
		'message',
		'orderId',
		'status'
	].every((field) => typeof response[field] === 'string');
}

function isFailedOrderStatus(status: string): boolean {
	return ['FAILED', 'FAILURE', 'ERROR'].includes(status.toUpperCase());
}

export async function postUpi(
	params: UpiPayload,
	fetcher: typeof fetch = fetch
): Promise<PaymentOrderResponse> {
	const payload: PaymentOrderRequest = {
		orgId: getRequiredConfig('VITE_PAYIN_ORG_ID'),
		amount: Number(params.amount).toFixed(2),
		clientOrderId: generateClientOrderId(),
		customer: {
			phoneNumber: params.phone,
			name: params.name,
			email: params.email,
			city: params.city,
			country: 'IND',
			zipCode: params.zipCode
		},
		merchantUrl: {
			successUrl: getRequiredConfig('VITE_PUBLIC_SUCCESS_URL'),
			cancelUrl: getRequiredConfig('VITE_PUBLIC_CANCEL_URL'),
			failureUrl: getRequiredConfig('VITE_PUBLIC_FAILURE_URL')
		},
		description: getRandomPaymentDescription(),
		PaymentMethods: PAYMENT_METHODS
	};

	const endpoint = getOrderEndpoint();
	const headers = {
		'Content-Type': 'application/json',
		'X-Client-Key': getRequiredConfig('VITE_PAYIN_CLIENT_KEY'),
		'X-Client-Secret': getRequiredConfig('VITE_PAYIN_CLIENT_SECRET')
	};
	const debugLogsEnabled = import.meta.env.VITE_PAYIN_DEBUG_LOGS === 'true';

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

	if (isFailedOrderStatus(data.status) || !data.checkoutUrl.trim()) {
		if (debugLogsEnabled) {
			console.error('Payment order API error response:', data);
		}

		throw new PaymentOrderError(data.message || 'Failed to create payment order', 502);
	}

	return data;
}
