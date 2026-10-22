import type { QRPaymentStatusResponse, PaymentCheckoutToken } from '$lib/utils/types';

export function createQRPaymentStore() {
	// QR Payment state
	let qrFlag = $state(false);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let isCheckingStatus = $state(false);
	let timeRemaining = $state('0:00');
	let pollTick = 0;
	let pollingInterval: ReturnType<typeof setInterval> | null = null;
	let transactionStatus = $state<string | undefined>(undefined);
	let paymentData = $state<QRPaymentStatusResponse | null>(null);
	let showExitConfirmation = $state(false);
	let showPaymentStatusModal = $state(false);

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

	function startPolling(txnId: string, expiresAt: number) {
		stopPolling();
		isCheckingStatus = true;
		pollTick = 0;
		pollingInterval = setInterval(async () => {
			const remaining = expiresAt - Date.now();
			if (remaining <= 0) {
				timeRemaining = '0:00';
				stopPolling();
				transactionStatus = 'EXPIRED';
				showPaymentStatusModal = true;
				return;
			}
			timeRemaining = formatTime(remaining);
			if (++pollTick % 3 !== 0) return;
			await checkPaymentStatus(txnId);
		}, 1000);
		checkPaymentStatus(txnId); // immediate first check
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
			const res = await fetch(`/api/paymentCheck/${txnId}`, {
				headers: { 'Content-Type': 'application/json' }
			});
			const json = await res.json();
			console.log(json);
			if (!json.success) return;
			transactionStatus = json.data.status;
			if (transactionStatus === 'SUCCESS') {
				stopPolling();
				handlePaymentSuccess(json.data);
			} else if (transactionStatus === 'FAILED') {
				stopPolling();
				handlePaymentFailure(json.data);
			}
		} catch (err) {
			console.error('checkPaymentStatus error:', err);
		}
	}

	async function generateQR(tokenData: PaymentCheckoutToken) {
		loading = true;
		error = null;

		try {
			const response = await fetch('/api/upi-intent', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					transactionAmount: tokenData?.transactionAmount,
					currency: tokenData?.currency || 'INR',
					customerPhoneNumber: tokenData?.customerPhoneNumber,
					customerEmail: tokenData?.customerEmail,
					orderId: tokenData?.orderId,
					callBackUrl: tokenData?.merchantRedirectUrl,
					orgId: Number(tokenData?.orgId),
					checkoutId: tokenData?.jti,
					mode: 'DYNAMIC_SECURE_QR',
					source: 'WEB',
					clientDescription: tokenData?.purpose ?? 'Payment'
				})
			});

			const result = await response.json();

			if (result.success) {
				qrFlag = true;
				paymentData = result.data as QRPaymentStatusResponse;
				console.log('QR generation successful:', paymentData);
				if (paymentData?.transactionStatus === 'PENDING') {
					startPolling(paymentData.transactionId, paymentData.expiresAt);
				} else if (paymentData?.transactionStatus === 'SUCCESS') {
					handlePaymentSuccess(paymentData);
				}
			} else {
				error = result.message || 'Failed to generate QR';
				qrFlag = false;
			}
		} catch (err) {
			console.error('Error generating QR:', err);
			error = 'An error occurred while generating QR';
			qrFlag = false;
		} finally {
			loading = false;
		}
	}

	function handlePaymentSuccess(data: QRPaymentStatusResponse) {
		transactionStatus = 'SUCCESS';
		showPaymentStatusModal = true;
		console.log('Payment completed successfully:', data);
	}

	function handlePaymentFailure(data: QRPaymentStatusResponse) {
		transactionStatus = 'FAILED';
		showPaymentStatusModal = true;
		console.log('Payment failed:', data);
	}

	function handlePaymentTimeout() {
		transactionStatus = 'EXPIRED';
		showPaymentStatusModal = true;
		console.log('Payment timeout');
	}

	function handleBack() {
		showExitConfirmation = true;
	}

	function handleConfirmBack() {
		qrFlag = false;
		stopPolling();
		showExitConfirmation = false;
	}

	function handleCancelBack() {
		showExitConfirmation = false;
	}

	function reset() {
		qrFlag = false;
		loading = false;
		error = null;
		stopPolling();
		transactionStatus = undefined;
		paymentData = null;
		showExitConfirmation = false;
		showPaymentStatusModal = false;
	}

	function closePaymentStatusModal() {
		showPaymentStatusModal = false;
		if (transactionStatus === 'SUCCESS') {
			reset();
		}
	}

	return {
		get qrFlag() {
			return qrFlag;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get isCheckingStatus() {
			return isCheckingStatus;
		},
		get timeRemaining() {
			return timeRemaining;
		},
		get transactionStatus() {
			return transactionStatus;
		},
		get paymentData() {
			return paymentData;
		},
		get showExitConfirmation() {
			return showExitConfirmation;
		},
		set showExitConfirmation(v) {
			showExitConfirmation = v;
		},
		get showPaymentStatusModal() {
			return showPaymentStatusModal;
		},
		set showPaymentStatusModal(v) {
			showPaymentStatusModal = v;
		},
		generateQR,
		handleBack,
		handleConfirmBack,
		handleCancelBack,
		reset,
		stopPolling,
		closePaymentStatusModal
	};
}
