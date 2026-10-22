export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type RedirectAction = 'REDIRECT_ONLY' | 'AUTO_REDIRECT';
export type PaymentMethod = 'UPI_COLLECT' | 'UPI_INTENT' | 'CARD' | 'NET_BANKING';

export interface PaymentMetadata {
	amount: string; // Keep as string to avoid float issues
	currency: 'INR';
	method: PaymentMethod;
	customerVpa: string;
	customerReference: string;
}

export interface ApiRequestInfo {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	url: string;
}

export interface CheckoutSessionSuccessResponse {
	expiresAt: number; // epoch millis
	checkoutId: string; // UUID
	orderId: string;

	sessionStatus: SessionStatus;
	transactionStatus: TransactionStatus;

	redirectUrl: string;
	redirectAction: RedirectAction;

	transactionId: string; // MUST be string (Snowflake IDs break JS numbers)
	message: string;

	createdAt: string; // ISO 8601 string

	paymentMetadata: PaymentMetadata;
	request: ApiRequestInfo;
}
