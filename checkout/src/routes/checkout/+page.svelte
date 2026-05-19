<script lang="ts">
	import type { PageData } from './$types';
	import { createPaymentStore } from '$lib/stores/paymet.svelte';
	import { createQRPaymentStore } from '$lib/stores/qr-payment.svelte';
	import { createAppIntentPaymentStore, type UpiApp } from '$lib/stores/app-intent-payment.svelte';
	import UpiInput from '$lib/components/upi-input.svelte';
	import PaymentButton from '$lib/components/payment-button.svelte';
	import PaymentModal from '$lib/components/payment-modal.svelte';
	import QrCodePayment from '$lib/components/qr-code-payment.svelte';
	import type { QRPaymentStatusResponse } from '$lib/utils/types';
	import type { PaymentCheckoutToken } from '$lib/utils/types';
	import Modal from '$lib/components/modal.svelte';
	import { onMount } from 'svelte';
	import GooglePay from '$lib/icons/google-pay.svelte';
	import PhonePe from '$lib/icons/phone-pe.svelte';
	import Paytm from '$lib/icons/paytm.svelte';
	import Bhim from '$lib/icons/bhim.svelte';
	import AmazonPay from '$lib/icons/amazon-pay.svelte';
	let { data }: { data: PageData } = $props();
	$inspect(data);

	let tokenData = $derived(data.data as PaymentCheckoutToken | undefined);

	let txnAmount = $derived(parseFloat(tokenData?.transactionAmount ?? '0'));
	let gstAmount = $derived(txnAmount * 0.18);
	let totalAmount = $derived(txnAmount + gstAmount);

	let isMobile = $state(false);

	onMount(() => {
		const checkMobile = () => {
			isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
				navigator.userAgent
			);
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	});

	const upiApps: UpiApp[] = [
		{ id: 'gpay', name: 'Google Pay', prefix: 'tez:/', icon: GooglePay, color: '#4285F4' },
		{ id: 'phonepe', name: 'PhonePe', prefix: 'phonepe:/', icon: PhonePe, color: '#5F259F' },
		{ id: 'paytm', name: 'Paytm', prefix: 'paytmmp:/', icon: Paytm, color: '#00B9F1' },
		{ id: 'bhim', name: 'BHIM', prefix: 'upi:/', icon: Bhim, color: '#FF6600' },
		{ id: 'amazon', name: 'Amazon Pay', prefix: 'amazonpay:/', icon: AmazonPay, color: '#FF9900' }
		// { id: 'other', name: 'Other UPI', prefix: 'upi:/', icon: '📱', color: '#667eea' }
	];

	//Stores
	const upiStore = createPaymentStore();
	const qrStore = createQRPaymentStore();
	const appIntentStore = createAppIntentPaymentStore();
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
				{#if qrStore.qrFlag}
					<!-- Desktop QR view -->
					<QrCodePayment
						countdown={qrStore.timeRemaining}
						qrCodeUrl={qrStore.paymentData?.intentUrl}
						onBack={qrStore.handleBack}
					/>
				{:else}
					<div class="payment-card">
						<h2 class="text-xl font-semibold mb-6" style="color: var(--color-text-primary);">
							Payment method — UPI
						</h2>

						<!-- ════════════════════════════════════════════════════════
						     MOBILE: UPI App Selection → Proceed to Pay
						     ════════════════════════════════════════════════════════ -->
						{#if isMobile}
							<div class="mb-10">
								<p class="font-medium mb-1" style="color: var(--color-text-primary);">
									Pay using your UPI app
								</p>
								<p class="select-hint">Select an app to continue</p>

								<!-- App selection grid -->
								<div class="upi-app-grid">
									{#each upiApps as app}
										<button
											class="upi-app-btn"
											class:selected={appIntentStore.selectedApp?.id === app.id}
											style="--app-color: {app.color};"
											onclick={() => appIntentStore.selectApp(app)}
											disabled={appIntentStore.isProceeding}
											aria-label="Select {app.name}"
											aria-pressed={appIntentStore.selectedApp?.id === app.id}
										>
											<span class="app-icon"> <svelte:component this={app.icon} /></span>
											<span class="app-name">{app.name}</span>
											{#if appIntentStore.selectedApp?.id === app.id}
												<span class="selected-badge" aria-hidden="true">
													<svg viewBox="0 0 12 12" fill="none">
														<circle cx="6" cy="6" r="6" fill="var(--app-color)" />
														<path
															d="M3 6l2 2 4-4"
															stroke="#fff"
															stroke-width="1.5"
															stroke-linecap="round"
															stroke-linejoin="round"
														/>
													</svg>
												</span>
											{/if}
										</button>
									{/each}
								</div>

								<!-- Selected app summary bar -->
								{#if appIntentStore.selectedApp}
									<div class="selected-bar">
										<span class="selected-bar-icon">
											<svelte:component this={appIntentStore.selectedApp.icon} /></span
										>
										<span class="selected-bar-text">
											Paying with <strong>{appIntentStore.selectedApp.name}</strong>
										</span>
									</div>

									<!-- Proceed to Pay CTA -->
									<button
										class="proceed-btn"
										style="--app-color: {appIntentStore.selectedApp.color};"
										onclick={() => tokenData && appIntentStore.proceedToPayment(tokenData)}
										disabled={appIntentStore.isProceeding}
									>
										{#if appIntentStore.isProceeding}
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
											<span>Processing…</span>
										{:else}
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M17 8l4 4m0 0l-4 4m4-4H3"
												/>
											</svg>
											<span>Proceed to Pay ₹{txnAmount.toLocaleString('en-IN')}</span>
										{/if}
									</button>
								{/if}

								{#if appIntentStore.error}
									<div class="error-message animate-scale-in">
										<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<span>{appIntentStore.error}</span>
									</div>
								{/if}
							</div>

							<!-- ════════════════════════════════════════════════════════
						     DESKTOP: Generate QR Code Button
						     ════════════════════════════════════════════════════════ -->
						{:else}
							<div class="mb-10">
								<h3 class="font-medium mb-3" style="color: var(--color-text-primary);">
									Pay by any UPI app
								</h3>
								<button
									onclick={() => tokenData && qrStore.generateQR(tokenData)}
									class="generate-qr-button"
									disabled={qrStore.loading}
								>
									{#if qrStore.loading}
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

								{#if qrStore.error}
									<div class="error-message animate-scale-in">
										<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<span>{qrStore.error}</span>
									</div>
								{/if}
							</div>
						{/if}

						<div class="border mb-10"></div>

						<!-- UPI ID manual entry (same for both mobile & desktop) -->
						<UpiInput
							bind:inputUpiId={upiStore.inputUpiId}
							upiError={upiStore.upiError}
							isVerified={upiStore.isVerified}
							verificationMessage={upiStore.verificationMessage}
						/>

						<PaymentButton
							isVerified={upiStore.isVerified}
							onclick={() => tokenData && upiStore.handleSubmit(tokenData)}
							isValid={upiStore.isValid}
							isVerifying={upiStore.isVerifying}
							isInitiatingPayment={upiStore.isInitiatingPayment}
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
							<span>₹{txnAmount.toLocaleString('en-IN')}</span>
						</div>
						<div class="summary-item">
							<span>Processing fee</span>
							<span>₹0</span>
						</div>
						<div class="summary-item">
							<span>Tax (GST 18%)</span>
							<span>₹{gstAmount.toLocaleString('en-IN')}</span>
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
								{tokenData?.orderId ?? '—'}
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

{#if upiStore.paymentData}
	<PaymentModal
		inputUpiId={upiStore.inputUpiId}
		paymentData={upiStore.paymentData}
		showModal={upiStore.showModal}
		transactionStatus={(upiStore.transactionStatus ?? 'PENDING') as
			| 'PENDING'
			| 'SUCCESS'
			| 'FAILED'
			| 'EXPIRED'}
	/>
{/if}

{#if appIntentStore.showPaymentStatusModal}
	<PaymentModal
		bind:showModal={appIntentStore.showPaymentStatusModal}
		transactionStatus={(appIntentStore.transactionStatus ?? 'PENDING') as
			| 'PENDING'
			| 'SUCCESS'
			| 'FAILED'
			| 'EXPIRED'}
		paymentData={appIntentStore.paymentData ?? undefined}
		timeRemaining={appIntentStore.timeRemaining}
		onClose={() => appIntentStore.closePaymentStatusModal()}
	/>
{/if}

{#if qrStore.showPaymentStatusModal}
	<PaymentModal
		bind:showModal={qrStore.showPaymentStatusModal}
		transactionStatus={(qrStore.transactionStatus ?? 'PENDING') as
			| 'PENDING'
			| 'SUCCESS'
			| 'FAILED'
			| 'EXPIRED'}
		paymentData={qrStore.paymentData ?? undefined}
		timeRemaining={qrStore.timeRemaining}
		onClose={() => qrStore.closePaymentStatusModal()}
	/>
{/if}

<Modal
	bind:isOpen={qrStore.showExitConfirmation}
	onConfirm={qrStore.handleConfirmBack}
	onCancel={qrStore.handleCancelBack}
/>

<style>
	/* ── existing styles (unchanged) ───────────────────────────────────────── */
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

	/* ── Desktop: Generate QR button (unchanged) ────────────────────────── */
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

	/* ── Mobile: UPI App Grid ────────────────────────────────────────────── */
	.select-hint {
		font-size: 13px;
		color: var(--color-text-tertiary);
		margin-bottom: 14px;
	}

	.upi-app-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-top: 4px;
	}

	.upi-app-btn {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 7px;
		padding: 14px 8px 12px;
		border: 2px solid var(--color-border, #e5e7eb);
		border-radius: var(--radius-lg);
		background: var(--color-card, #fff);
		cursor: pointer;
		transition:
			border-color 0.18s ease,
			box-shadow 0.18s ease,
			transform 0.15s ease;
		font-size: 12px;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.upi-app-btn:hover:not(:disabled):not(.selected) {
		border-color: var(--app-color);
		transform: translateY(-1px);
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
	}

	/* ✅ Selected state */
	.upi-app-btn.selected {
		border-color: var(--app-color);
		background: color-mix(in srgb, var(--app-color) 8%, var(--color-card, #fff));
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--app-color) 20%, transparent);
		transform: none;
	}

	.upi-app-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.app-icon {
		font-size: 26px;
		line-height: 1;
	}
	.app-name {
		font-size: 11px;
		text-align: center;
		line-height: 1.3;
	}

	/* checkmark badge in top-right corner */
	.selected-badge {
		position: absolute;
		top: 6px;
		right: 6px;
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.selected-badge svg {
		width: 100%;
		height: 100%;
	}

	/* ── Selected-app summary bar ────────────────────────────────────────── */
	.selected-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 14px;
		padding: 10px 14px;
		border-radius: var(--radius-md);
		background: var(--color-bg, #f8f9fa);
		border: 1px solid var(--color-border, #e5e7eb);
		font-size: 14px;
		color: var(--color-text-secondary);
		animation: slideDown 0.2s ease;
	}
	.selected-bar-icon {
		font-size: 20px;
	}
	.selected-bar-text strong {
		color: var(--color-text-primary);
	}

	/* ── Proceed to Pay button ───────────────────────────────────────────── */
	.proceed-btn {
		width: 100%;
		margin-top: 12px;
		padding: 15px 20px;
		border: none;
		border-radius: var(--radius-lg);
		background: var(--app-color, #667eea);
		color: #fff;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		box-shadow: 0 4px 14px color-mix(in srgb, var(--app-color, #667eea) 45%, transparent);
		transition:
			opacity 0.15s ease,
			transform 0.15s ease,
			box-shadow 0.15s ease;
		animation: slideDown 0.22s ease;
	}
	.proceed-btn:hover:not(:disabled) {
		opacity: 0.92;
		transform: translateY(-1px);
		box-shadow: 0 6px 20px color-mix(in srgb, var(--app-color, #667eea) 50%, transparent);
	}
	.proceed-btn:active:not(:disabled) {
		transform: translateY(0);
	}
	.proceed-btn:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ── Shared: spinner ─────────────────────────────────────────────────── */
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
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
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

	/* ── Shared: error message ───────────────────────────────────────────── */
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
