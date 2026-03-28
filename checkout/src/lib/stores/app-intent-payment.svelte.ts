import type { QRPaymentStatusResponse, PaymentCheckoutToken } from '$lib/utils/types';
import type { Component } from 'svelte';

// UPI App interface
export interface UpiApp {
	id: string;
	name: string;
	prefix: string;
	icon: Component;
	color: string;
}

export function createAppIntentPaymentStore() {
	// App Intent Payment state
	let selectedApp = $state<UpiApp | null>(null);
	let isProceeding = $state(false);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let isCheckingStatus = $state(false);
	let timeRemaining = $state('0:00');
	let pollTick = 0;
	let pollingInterval: ReturnType<typeof setInterval> | null = null;
	let transactionStatus = $state<string | undefined>(undefined);
	let paymentData = $state<QRPaymentStatusResponse | null>(null);
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
				showPaymentStatusModal = true;
			} else if (transactionStatus === 'FAILED') {
				stopPolling();
				showPaymentStatusModal = true;
			}
		} catch (err) {
			console.error('checkPaymentStatus error:', err);
		}
	}

	/**
	 * Swap the scheme of a UPI intent URL to open a specific app.
	 * Input:  "upi://pay?pa=merchant@upi&am=500&..."
	 * Output: "phonepe://pay?pa=merchant@upi&am=500&..." (for PhonePe)
	 */
	function buildAppIntentUrl(intentUrl: string, app: UpiApp): string {
		// intentUrl always starts with "upi:/" — replace only that prefix
		return intentUrl.replace(/^upi:\//i, app.prefix);
	}

	async function generateIntent(
		mode: 'DYNAMIC_SECURE_QR' | 'SECURE_INTENT',
		tokenData: PaymentCheckoutToken
	): Promise<QRPaymentStatusResponse | null> {
		loading = true;
		error = null;
		try {
			const res = await fetch('/api/upi-intent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					transactionAmount: tokenData?.transactionAmount,
					currency: tokenData?.currency ?? 'INR',
					customerPhoneNumber: tokenData?.customerPhoneNumber,
					customerEmail: tokenData?.customerEmail,
					orderId: tokenData?.orderId,
					callBackUrl: tokenData?.merchantRedirectUrl,
					orgId: Number(tokenData?.orgId),
					checkoutId: tokenData?.jti,
					mode,
					source: 'WEB',
					clientDescription: tokenData?.purpose ?? 'Payment'
				})
			});
			const result = await res.json();
			if (result.success) {
				paymentData = result.data as QRPaymentStatusResponse;
				return paymentData;
			}
			error = result.message ?? 'Failed to initiate payment';
			return null;
		} catch (err) {
			console.error('generateIntent error:', err);
			error = 'An error occurred. Please try again.';
			return null;
		} finally {
			loading = false;
		}
	}

	function selectApp(app: UpiApp) {
		selectedApp = selectedApp?.id === app.id ? null : app;
		error = null;
	}

	async function proceedToPayment(tokenData: PaymentCheckoutToken) {
		if (!selectedApp) return;
		isProceeding = true;
		error = null;
		try {
			const data = await generateIntent('SECURE_INTENT', tokenData);
			if (!data?.intentUrl) return; // error already set by generateIntent
			const appUrl = buildAppIntentUrl(data.intentUrl, selectedApp);
			// Start polling before redirecting so we catch the result on return
			if (data.transactionStatus === 'PENDING') {
				startPolling(data.transactionId, data.expiresAt);
			}

			window.location.href = appUrl;
		} finally {
			isProceeding = false;
		}
	}

	function reset() {
		selectedApp = null;
		isProceeding = false;
		loading = false;
		error = null;
		stopPolling();
		transactionStatus = undefined;
		paymentData = null;
		showPaymentStatusModal = false;
	}

	function closePaymentStatusModal() {
		showPaymentStatusModal = false;
		if (transactionStatus === 'SUCCESS') {
			reset();
		}
	}

	return {
		get selectedApp() {
			return selectedApp;
		},
		get isProceeding() {
			return isProceeding;
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
		get showPaymentStatusModal() {
			return showPaymentStatusModal;
		},
		set showPaymentStatusModal(v) {
			showPaymentStatusModal = v;
		},
		selectApp,
		proceedToPayment,
		reset,
		stopPolling,
		closePaymentStatusModal
	};
}
