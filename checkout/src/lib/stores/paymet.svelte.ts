import { validateUpiFormat } from '$lib/utils/regx';
import { useDebouncedValue } from '$lib/utils/debounce.svelte';
import type { PayinInitiateStatusResponse, PaymentCheckoutToken } from '$lib/utils/types';

export function createPaymentStore() {
	// Payment method
	let paymentMethod = $state<'upi-id' | 'qr-code'>('qr-code');

	// UPI validation state
	let inputUpiId = $state<string>('');
	let upiError = $state<string | null>(null);
	let isValid = $state<boolean>(false);
	let isVerifying = $state<boolean>(false);
	let isVerified = $state<boolean>(false);
	let verificationMessage = $state<string>('');
	// Payment state
	let isInitiatingPayment = $state<boolean>(false);
	let isCheckingStatus = $state<boolean>(false);
	let transactionStatus = $state<string | undefined>(undefined);
	let transactionId = $state<string | undefined>(undefined);
	let pollingInterval: NodeJS.Timeout | null = null;
	let pollTick = 0; // used to control API frequency

	let showModal = $state<boolean>(false);
	let paymentData = $state<PayinInitiateStatusResponse | null>(null);
	let timeRemaining = $state<string>('');

	// Debounced UPI ID
	const debouncedUpiId = useDebouncedValue(() => inputUpiId, 800);

	// Auto-validate on debounced input change
	$effect(() => {
		if (debouncedUpiId.current) {
			upiError = validateUpiFormat(debouncedUpiId.current);
			isValid = upiError === null && debouncedUpiId.current.trim() !== '';
			isVerified = false;
			verificationMessage = '';
		} else {
			upiError = null;
			isValid = false;
			isVerified = false;
			verificationMessage = '';
		}
	});

	// Cleanup polling on destroy
	$effect(() => {
		return () => {
			if (pollingInterval) {
				clearInterval(pollingInterval);
			}
		};
	});

	function formatTime(ms: number): string {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	async function verifyUpiId() {
		if (!isValid) return;

		isVerifying = true;
		upiError = null;

		try {
			const response = await fetch('/api/vpa-validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ vpa: inputUpiId.trim() })
			});

			const data = await response.json();

			if (data.success) {
				isVerified = true;
				verificationMessage = data.message || 'UPI ID verified successfully!';
				return true;
			} else {
				isVerified = false;
				upiError = data.message || 'UPI ID verification failed';
				return false;
			}
		} catch (error) {
			console.error('Verification error:', error);
			upiError = 'Failed to verify UPI ID. Please try again.';
			isVerified = false;
			return false;
		} finally {
			isVerifying = false;
		}
	}

	async function initiatePayment(tokenData: PaymentCheckoutToken) {
		isInitiatingPayment = true;
		upiError = null;

		const requestBody = {
			amount: tokenData?.transactionAmount,
			currency: tokenData?.currency || 'INR',
			customerPhoneNumber: tokenData?.customerPhoneNumber,
			customerEmail: tokenData?.customerEmail,
			payerVPA: inputUpiId.trim(),
			orderId: tokenData?.orderId,
			callBackUrl: tokenData?.merchantRedirectUrl,
			orgId: Number(tokenData?.orgId),
			checkoutId: tokenData?.jti,
			paymentMethod: 'UPI_COLLECT'
		};

		try {
			const response = await fetch('/api/paymentmode', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestBody)
			});

			const data = await response.json();

			if (data.success) {
				paymentData = data.data as PayinInitiateStatusResponse;
				transactionId = paymentData?.transactionId;
				transactionStatus = paymentData?.transactionStatus;
				showModal = true;

				if (paymentData?.transactionStatus === 'PENDING') {
					startPolling(paymentData.transactionId, paymentData.expiresAt);
				} else if (paymentData?.transactionStatus === 'SUCCESS') {
					handlePaymentSuccess(paymentData);
				}
			} else {
				upiError = data.message || 'Failed to initiate payment';
				isVerified = false;
			}
		} catch (error) {
			console.error('Payment initiation error:', error);
			upiError = 'Failed to initiate payment. Please try again.';
			isVerified = false;
		} finally {
			isInitiatingPayment = false;
		}
	}

	function startPolling(txnId: string, expiresAt: number) {
		stopPolling(); // safety
		isCheckingStatus = true;
		pollTick = 0;
		pollingInterval = setInterval(async () => {
			const now = Date.now();
			const remaining = expiresAt - now;

			// ⏱ countdown
			if (remaining <= 0) {
				timeRemaining = '0:00';
				stopPolling();
				handlePaymentTimeout();
				return;
			}

			timeRemaining = formatTime(remaining);

			// 🔁 poll backend every 3 seconds
			pollTick++;
			if (pollTick % 3 !== 0) return;

			await checkPaymentStatus(txnId);
		}, 1000);

		// initial check immediately
		checkPaymentStatus(txnId);
	}

	function stopPolling() {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
		isCheckingStatus = false;
	}

	async function checkPaymentStatus(txnId: string) {
		if (!isCheckingStatus) return;

		try {
			const response = await fetch(`/api/paymentCheck/${txnId}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await response.json();
			if (!data.success) return;

			const statusData = data.data;
			console.log(statusData, 'verify');
			transactionStatus = statusData.transactionStatus || statusData.status;

			paymentData = paymentData ? { ...paymentData, ...statusData } : statusData;

			if (transactionStatus === 'SUCCESS') {
				stopPolling();
				handlePaymentSuccess(statusData);
			} else if (transactionStatus === 'FAILED') {
				stopPolling();
				handlePaymentFailure(statusData);
			}
		} catch (error) {
			console.error('Error checking payment status:', error);
		}
	}

	function handlePaymentSuccess(data: PayinInitiateStatusResponse) {
		transactionStatus = 'SUCCESS';
		console.log('Payment completed successfully:', data);
	}

	function handlePaymentFailure(data: PayinInitiateStatusResponse) {
		transactionStatus = 'FAILED';
		console.log('Payment failed:', data);
	}

	function handlePaymentTimeout() {
		transactionStatus = 'EXPIRED';
		console.log('Payment timeout');
	}

	function closeModal() {
		showModal = false;
		if (transactionStatus === 'SUCCESS') {
			inputUpiId = '';
			isVerified = false;
			paymentData = null;
		}
	}

	async function handleSubmit(tokenData: PaymentCheckoutToken) {
		const verified = await verifyUpiId();
		if (verified) {
			await initiatePayment(tokenData);
		}
	}

	return {
		get paymentMethod() {
			return paymentMethod;
		},
		set paymentMethod(value) {
			paymentMethod = value;
		},
		get inputUpiId() {
			return inputUpiId;
		},
		set inputUpiId(value) {
			inputUpiId = value;
		},
		get upiError() {
			return upiError;
		},
		get isValid() {
			return isValid;
		},
		get isVerifying() {
			return isVerifying;
		},
		get isVerified() {
			return isVerified;
		},
		get verificationMessage() {
			return verificationMessage;
		},
		get isInitiatingPayment() {
			return isInitiatingPayment;
		},
		get isCheckingStatus() {
			return isCheckingStatus;
		},
		get transactionStatus() {
			return transactionStatus;
		},
		get showModal() {
			return showModal;
		},
		get paymentData() {
			return paymentData;
		},
		get timeRemaining() {
			return timeRemaining;
		},
		get transactionId() {
			return transactionId;
		},
		handleSubmit,
		closeModal
	};
}
