<script lang="ts">
	import type { PageData } from './$types';
	import { createPaymentStore } from '$lib/stores/paymet.svelte';
	import UpiInput from '$lib/components/upi-input.svelte';
	import PaymentButton from '$lib/components/payment-button.svelte';
	import PaymentModal from '$lib/components/payment-modal.svelte';
	import QrCodePayment from '$lib/components/qr-code-payment.svelte';
	import type { QRPaymentStatusResponse } from '$lib/utils/types';
	import Modal from '$lib/components/modal.svelte';

	let { data }: { data: PageData } = $props();
	// State for payment method selection
	$inspect(data);
	let tokenData = $derived(data.data);
	// Static dummy data for UI display only
	// const qrCodeUrl = 'upi://pay?pa=merchant@upi&pn=MerchantName&am=1000&cu=INR';
	const session = {
		transactionAmount: 1000,
		orderId: 'TXN123456789'
	};
	const totalAmount = session.transactionAmount * 1.18;

	let qrFlag = $state(false);
	let successModal = $state(false);
	let loading = $state(false);
	let error: string | null = $state(null);
	let isCheckingStatus = $state(false);
	let timeRemaining = $state('0:00');
	let pollTick = 0;
	let pollingInterval: NodeJS.Timeout | null = null;
	let transactionStatus = $state<string | undefined>(undefined);
	let paymentData = $state<QRPaymentStatusResponse | null>(null);
	let showModal = $state(false);

	function formatTime(ms: number): string {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	$effect(() => {
		return () => {
			if (pollingInterval) {
				clearInterval(pollingInterval);
			}
		};
	});

	function handlePaymentSuccess(data: QRPaymentStatusResponse) {
		transactionStatus = 'SUCCESS';
		console.log('Payment completed successfully:', data);
	}

	function handlePaymentFailure(data: QRPaymentStatusResponse) {
		transactionStatus = 'FAILED';
		console.log('Payment failed:', data);
	}

	function handlePaymentTimeout() {
		transactionStatus = 'EXPIRED';
		console.log('Payment timeout');
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
			console.log('Time remaining:', timeRemaining);
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
	const handleGenerateQr = async () => {
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
					clientDescription: 'hello'
				})
			});

			const result = await response.json();

			if (result.success) {
				qrFlag = true;
				paymentData = result.data as QRPaymentStatusResponse;
				console.log('QR generation successful:', paymentData);
				if (paymentData?.transactionStatus === 'PENDING') {
					console.log(
						'Initiating payment status polling for transaction:',
						paymentData.transactionId
					);
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
	};

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
			transactionStatus = statusData.transactionStatus || statusData.status;

			paymentData = paymentData ? { ...paymentData, ...statusData } : statusData;

			if (transactionStatus === 'SUCCESS') {
				console.log('Payment successful:', statusData);
				successModal = true;
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

	const store = createPaymentStore();

	const handleBack = () => {
		// Show confirmation modal instead of directly going back
		showModal = true;
	};

	const handleConfirmBack = () => {
		// User confirmed they want to go back
		qrFlag = false;
		stopPolling();
		showModal = false;
	};

	const handleCancelBack = () => {
		// User wants to stay on QR page
		showModal = false;
	};
</script>

<main class="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-8 animate-fade-in">
			<h1 class="text-3xl font-bold mb-2" style="color: var(--color-text-primary);">
				Complete your payment
			</h1>
			<p style="color: var(--color-text-secondary);">Secure checkout powered by Flipopay</p>
		</div>

		<!-- Main Content -->
		<div class="grid lg:grid-cols-2 gap-8">
			<!-- Payment Form -->
			<div class="animate-slide-up">
				{#if qrFlag}
					<QrCodePayment
						countdown={timeRemaining}
						qrCodeUrl={paymentData?.intentUrl}
						onBack={handleBack}
					/>
				{:else}
					<div class="payment-card">
						<h2 class="text-xl font-semibold mb-6" style="color: var(--color-text-primary);">
							Payment method - UPI
						</h2>

						<!-- Payment Method Toggle -->
						<!-- <PaymentToggleMethod
						paymentMethod={store.paymentMethod}
						onMethodChange={(method) => (store.paymentMethod = method)}
					/> -->

						<!-- UPI ID Input Section -->

						<div class="mb-10">
							<h1 class="font-medium text-gray-900 mb-3">Pay by any UPI app</h1>
							<button onclick={handleGenerateQr} class="generate-qr-button" disabled={loading}>
								{#if loading}
									<svg class="spinner" viewBox="0 0 24 24">
										<circle
											class="spinner-circle"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
											fill="none"
										/>
									</svg>
									<span>Generating QR...</span>
								{:else}
									<svg class="qr-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 0 00-1-1H5a1 0 00-1 1v2a1 0 001 1zm12 0h2a1 1 0 001-1V5a1 0 00-1-1h-2a1 0 00-1 1v2a1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 0 00-1-1H5a1 0 00-1 1v2a1 0 001 1z"
										/>
									</svg>
									<span>Generate QR Code</span>
								{/if}
							</button>
							{#if error}
								<div class="error-message animate-scale-in">
									<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<span>{error}</span>
								</div>
							{/if}
						</div>
						<div class="border mb-10"></div>
						<UpiInput
							bind:inputUpiId={store.inputUpiId}
							upiError={store.upiError}
							isVerified={store.isVerified}
							verificationMessage={store.verificationMessage}
						/>

						<!-- {#if store.paymentMethod === 'qr-code'}
						<QrCodePayment {qrCodeUrl} />
					{/if} -->

						<PaymentButton
							isVerified={store.isVerified}
							onclick={() => tokenData && store.handleSubmit(tokenData)}
							isValid={store.isValid}
							isVerifying={store.isVerifying}
							isInitiatingPayment={store.isInitiatingPayment}
						/>
						<!-- Security Badges -->
						<div class="security-badges">
							<div class="badge">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
								<span>Secured by SSL</span>
							</div>
							<div class="badge">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
								<span>PCI Compliant</span>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Order Summary -->
			<div class="animate-slide-up" style="animation-delay: 100ms;">
				<div class="payment-card summary-card">
					<h2 class="text-xl font-semibold mb-6" style="color: var(--color-text-primary);">
						Order summary
					</h2>

					<div class="space-y-4 mb-6">
						<div class="summary-item">
							<span>Subtotal</span>
							<span>₹{session.transactionAmount.toLocaleString('en-IN')}</span>
						</div>
						<div class="summary-item">
							<span>Processing fee</span>
							<span>₹0</span>
						</div>
						<div class="summary-item">
							<span>Tax (GST 18%)</span>
							<span>₹{(session.transactionAmount * 0.18).toLocaleString('en-IN')}</span>
						</div>
						<div class="divider"></div>
						<div class="summary-item total">
							<span>Total</span>
							<span>₹{totalAmount.toLocaleString('en-IN')}</span>
						</div>
					</div>

					<div class="info-box">
						<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>
							<p class="font-medium mb-1">Transaction ID</p>
							<p class="text-sm" style="color: var(--color-text-tertiary); font-family: monospace;">
								{session.orderId}
							</p>
						</div>
					</div>

					<div class="info-box mt-4">
						<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
						<div>
							<p class="text-sm" style="color: var(--color-text-secondary);">
								Your payment information is encrypted and secure. We never store your card details.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="text-center mt-8 animate-fade-in" style="animation-delay: 200ms;">
			<p class="text-sm" style="color: var(--color-text-tertiary);">
				Powered by <span class="font-semibold" style="color: var(--color-primary);">Flipopay</span>
			</p>
		</div>
	</div>
</main>
{#if store.paymentData}
	<PaymentModal
		inputUpiId={store.inputUpiId}
		paymentData={store.paymentData}
		showModal={store.showModal}
		transactionStatus={(store.transactionStatus ?? 'PENDING') as
			| 'PENDING'
			| 'SUCCESS'
			| 'FAILED'
			| 'EXPIRED'}
	/>
{/if}

<PaymentModal
	showModal={successModal}
	transactionStatus={(transactionStatus ?? 'PENDING') as
		| 'PENDING'
		| 'SUCCESS'
		| 'FAILED'
		| 'EXPIRED'}
></PaymentModal>

<Modal bind:isOpen={showModal} onConfirm={handleConfirmBack} onCancel={handleCancelBack} />

<style>
	.payment-card {
		background: var(--color-card);
		border-radius: var(--radius-xl);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-md);
		border: 1px solid var(--color-border);
		transition: all var(--transition-base);
	}

	.payment-card:hover {
		box-shadow: var(--shadow-lg);
	}

	.summary-card {
		position: sticky;
		top: 2rem;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.security-badges {
		display: flex;
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-border);
	}

	.badge {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--color-text-tertiary);
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 15px;
		color: var(--color-text-secondary);
	}

	.summary-item.total {
		font-size: 18px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.divider {
		height: 1px;
		background: var(--color-border);
		margin: var(--spacing-md) 0;
	}

	.info-box {
		display: flex;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		background: var(--color-bg);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
	}

	@media (max-width: 1024px) {
		.summary-card {
			position: static;
		}
	}

	/* Generate QR Button */
	.generate-qr-button {
		width: 100%;
		margin-top: var(--spacing-md);
		padding: 16px;
		border: none;
		border-radius: var(--radius-lg);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-base);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
	}

	.generate-qr-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
	}

	.generate-qr-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.generate-qr-button:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.qr-icon {
		width: 24px;
		height: 24px;
	}

	.spinner {
		width: 20px;
		height: 20px;
		animation: spin 1s linear infinite;
	}

	.spinner-circle {
		stroke-dasharray: 60;
		stroke-dashoffset: 0;
		animation: spinCircle 1.5s ease-in-out infinite;
	}

	@keyframes spinCircle {
		0% {
			stroke-dashoffset: 60;
		}
		50% {
			stroke-dashoffset: 15;
		}
		100% {
			stroke-dashoffset: 60;
		}
	}

	/* Error Message */
	.error-message {
		margin-top: var(--spacing-md);
		padding: 12px 16px;
		background: rgba(223, 27, 65, 0.1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-size: 14px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.error-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}
</style>
