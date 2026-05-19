export type PaymentCheckoutToken = {
	currency: string;
	customerEmail: string;
	customerName: string;
	customerPhoneNumber: string;
	exp: number;
	iat: number;
	iss: string;
	jti: string;
	merchantRedirectUrl: string;
	orderId: string;
	orgId: string;
	purpose: string;
	transactionAmount: string;
};

export type PayinInitiateStatusResponse = {
	expiresAt: number;
	checkoutId: string;
	orderId: string;
	sessionStatus: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
	transactionStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
	redirectUrl: string;
	transactionId: string;
	message: string;
	redirectAction: 'REDIRECT_ONLY' | 'REDIRECT_WITH_POST';
	createdAt: string;
	paymentMetadata: {
		amount: string;
		currency: 'INR' | string;
		method: 'UPI_COLLECT' | string;
		customerVpa: string;
		customerReference: string;
	};
	request: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE';
		url: string;
	};
};

export type QRPaymentStatusResponse = {
	expiresAt: number;
	checkoutId: string;
	orderId: string;
	sessionStatus: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'FAILED';
	transactionStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
	redirectUrl: string;
	transactionId: string;
	message: string;
	intentUrl: string;
	intentMode: 'DYNAMIC_SECURE_QR' | string;
	redirectAction: 'REDIRECT_ONLY' | 'REDIRECT_AND_POLL' | string;
	createdAt: string;
	paymentMetadata: {
		amount: string;
		currency: 'INR' | string;
		method: 'UPI_INTENT' | 'UPI_QR' | string;
		customerReference: string;
	};
	request: {
		method: 'GET' | 'POST' | string;
		url: string;
	};
};
