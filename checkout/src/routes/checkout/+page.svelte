<script lang="ts">
	import { jwtDecode } from 'jwt-decode';

	import type { PageData } from './$types';
	import type { CheckoutSessionSuccessResponse } from './types';
	import { onDestroy } from 'svelte';
	

	type PayinCheckoutPayload = {
		orderId?: string;
		orgId?: number | string | undefined;
		purpose?: string;
		currency?: string;
		transactionAmount: number;

		customerName?: string;
		customerEmail?: string;
		customerPhoneNumber?: string;

		merchantRedirectUrl?: string;

		iss?: string;
		iat?: number;
		exp?: number;
		jti?: string | undefined;
	};

	let { data }: { data: PageData } = $props();

	const decoded = jwtDecode<PayinCheckoutPayload>(data?.data || '');
 
	//

	let session: PayinCheckoutPayload | undefined = $state(decoded);
	

	let isProcessing = $state(false);
	let paymentSuccess = $state(false);
	let selectedMethod = $state('card');

	
	let loading = $state(false);
	let successResult = $state<CheckoutSessionSuccessResponse>();
$inspect(successResult,"successResult");
		
	let failureResult = $state();
$inspect(failureResult,"failureResult");	

	// $inspect(result);
	
	const upiCollectData = {
		
  amount: session?.transactionAmount,
  currency: session?.currency,
  customerPhoneNumber: session?.customerPhoneNumber,
  customerEmail: "vicky@gmail.com",
  payerVPA: "testuser@upi",
  orderId: session?.orderId,
  callBackUrl: "https://yourapp.com/api/payin/callback",
  orgId: session?.orgId ? parseInt(String(session.orgId)) : undefined,
  checkoutId: session?.jti,
  paymentMethod: "UPI_COLLECT"


	}


 	async function handleSubmit() {
		loading = true;
		try {
			const response = await fetch('/api/paymentmode', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(upiCollectData)
			});
			
			
			

		const	result = await response.json();
		console.log(result,"result")
		if (result?.success) {
			successResult= result.data
		}
		if (!result?.success) {
			failureResult= result.data
		}

			
		} catch (error) {
			// result = { success: false, message: 'Request failed' };
		} finally {
			loading = false;
		}
	}
	let transactionStatus = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;
		function stopPolling(){
		if(intervalId){
			clearInterval(intervalId);
		}
	}
	async function pollTransactionStatus(crn  :string){
		const transactionStatusApi = successResult?.request?.url
		console.log(transactionStatusApi,"transactionStatusApi");

		try {
			const response = await fetch(`/api/paymentmode?crn=${crn}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
				
				
			});
			if(response.ok){
				const result = await response.json();
				transactionStatus = result.data?.status
				if(transactionStatus){
					stopPolling();
				}
			}
			
		} catch (error) {
			console.log(error)
		}
		
	}
	function startPolling(){
		intervalId = setInterval(() => {
		if (successResult?.transactionId) {
			
			pollTransactionStatus(successResult?.transactionId);
		}
		}, 5000);
	}
	
	$effect(() => {
		if(transactionStatus===false){
			startPolling();
		}
	});
	
	// setInterval(() => {
		
	// 	if(successResult?.transactionId){
	// 		// console.log("count");
	// 		pollTransactionStatus(successResult?.transactionId)
	// 	}
		
	// }, 5000);

		onDestroy(() => {
		stopPolling();
	});
</script>

{#if !session}
	<div class="min-h-screen flex items-center justify-center p-4">
		<div class="text-center">
			<div class="text-6xl mb-4">⚠️</div>
			<h1 class="text-2xl font-semibold mb-2" style="color: var(--color-text-primary);">
				Invalid Session
			</h1>
			<p style="color: var(--color-text-secondary);">The payment link is invalid or has expired.</p>
		</div>
	</div>
	{:else if transactionStatus }
		<div class="min-h-screen flex items-center justify-center p-4">
			<div class="text-center">
				<div class="text-6xl mb-4">✅</div>
				<h1 class="text-2xl font-semibold mb-2" style="color: var(--color-text-primary);">
					Payment Successful
				</h1>
				<p style="color: var(--color-text-secondary);">Your payment has been processed successfully.</p>
			</div>
		</div>
{:else}
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
					<div class="payment-card">
						<h2 class="text-xl font-semibold mb-6" style="color: var(--color-text-primary);">
							Payment method
						</h2>

						<!-- Payment Method Tabs -->
						<div class="payment-tabs mb-6">
							<button
								class="payment-tab {selectedMethod === 'card' ? 'active' : ''}"
								onclick={() => (selectedMethod = 'card')}
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
									/>
								</svg>
								Card
							</button>
							<button
								class="payment-tab {selectedMethod === 'upi' ? 'active' : ''}"
								onclick={() => (selectedMethod = 'upi')}
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
									/>
								</svg>
								UPI
							</button>
							<button
								class="payment-tab {selectedMethod === 'wallet' ? 'active' : ''}"
								onclick={() => (selectedMethod = 'wallet')}
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
									/>
								</svg>
								Wallet
							</button>
						</div>

						<!-- Card Payment Form -->
						{#if selectedMethod === 'card'}
							<div class="space-y-4">
								<div class="form-group">
									<label for="cardNumber" class="form-label">Card number</label>
									<div class="input-wrapper">
										<input
											type="text"
											id="cardNumber"
											class="form-input"
											placeholder="1234 5678 9012 3456"
											maxlength="19"
										/>
										<div class="card-brands">
											<svg class="w-8 h-5" viewBox="0 0 32 20" fill="none">
												<rect width="32" height="20" rx="3" fill="#1434CB" />
												<circle cx="12" cy="10" r="5" fill="#EB001B" />
												<circle cx="20" cy="10" r="5" fill="#FF5F00" />
											</svg>
										</div>
									</div>
								</div>

								<div class="grid grid-cols-2 gap-4">
									<div class="form-group">
										<label for="expiry" class="form-label">Expiry date</label>
										<input
											type="text"
											id="expiry"
											class="form-input"
											placeholder="MM / YY"
											maxlength="7"
										/>
									</div>
									<div class="form-group">
										<label for="cvc" class="form-label">CVC</label>
										<input
											type="text"
											id="cvc"
											class="form-input"
											placeholder="123"
											maxlength="3"
										/>
									</div>
								</div>

								<div class="form-group">
									<label for="name" class="form-label">Cardholder name</label>
									<input type="text" id="name" class="form-input" placeholder="John Doe" />
								</div>
							</div>
						{/if}

						{#if selectedMethod === 'upi'}
							<div class="space-y-4">
								<div class="form-group">
									<label for="upiId" class="form-label">UPI ID</label>
									<input type="text" id="upiId" class="form-input" placeholder="yourname@upi" />
								</div>
								<div class="upi-apps">
									<button class="upi-app">
										<div
											class="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold"
										>
											GP
										</div>
										<span>Google Pay</span>
									</button>
									<button class="upi-app">
										<div
											class="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold"
										>
											PP
										</div>
										<span>PhonePe</span>
									</button>
									<button class="upi-app">
										<div
											class="w-12 h-12 bg-linear-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold"
										>
											PT
										</div>
										<span>Paytm</span>
									</button>
								</div>
							</div>
						{/if}

						{#if selectedMethod === 'wallet'}
							<div class="space-y-3">
								<button class="wallet-option">
									<div class="flex items-center gap-3">
										<div
											class="w-10 h-10 bg-linear-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center text-white font-bold"
										>
											AZ
										</div>
										<span class="font-medium">Amazon Pay</span>
									</div>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</button>
								<button class="wallet-option">
									<div class="flex items-center gap-3">
										<div
											class="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold"
										>
											PT
										</div>
										<span class="font-medium">Paytm Wallet</span>
									</div>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</button>
								<button class="wallet-option">
									<div class="flex items-center gap-3">
										<div
											class="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold"
										>
											PP
										</div>
										<span class="font-medium">PhonePe Wallet</span>
									</div>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</button>
							</div>
						{/if}

						<!-- Pay Button -->
						<button
							class="pay-button {isProcessing ? 'processing' : ''} {paymentSuccess
								? 'success'
								: ''}"
							onclick={handleSubmit}
							disabled={isProcessing || paymentSuccess}
						>
							{#if paymentSuccess}
								<svg
									class="w-6 h-6 checkmark"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="3"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								Payment Successful
							{:else if isProcessing}
								<div class="spinner"></div>
								Processing...
							{:else}
								<!-- Pay ₹{session.toLocaleString('en-IN')} -->
								Pay ₹{session.transactionAmount}
							{/if}
						</button>

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
								<!-- <span>₹{session.amount.toLocaleString('en-IN')}</span> -->
								<span>₹{session.transactionAmount}</span>
							</div>
							<div class="summary-item">
								<span>Processing fee</span>
								<span>₹0</span>
							</div>
							<div class="summary-item">
								<span>Tax (GST 18%)</span>
								<!-- <span>₹{(session.amount * 0.18).toLocaleString('en-IN')}</span> -->
								<span>₹{session?.transactionAmount * 0.18}</span>
							</div>
							<div class="divider"></div>
							<div class="summary-item total">
								<span>Total</span>
								<!-- <span>₹{(session.amount * 1.18).toLocaleString('en-IN')}</span> -->
								<span>₹{session?.transactionAmount * 1.18}</span>
							</div>
						</div>

						<div class="info-box">
							<svg
								class="w-5 h-5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div>
								<p class="font-medium mb-1">Transaction ID</p>
								<p
									class="text-sm"
									style="color: var(--color-text-tertiary); font-family: monospace;"
								>
									{session.orderId}
								</p>
							</div>
						</div>

						<div class="info-box mt-4">
							<svg
								class="w-5 h-5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
							<div>
								<p class="text-sm" style="color: var(--color-text-secondary);">
									Your payment information is encrypted and secure. We never store your card
									details.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="text-center mt-8 animate-fade-in" style="animation-delay: 200ms;">
				<p class="text-sm" style="color: var(--color-text-tertiary);">
					Powered by <span class="font-semibold" style="color: var(--color-primary);">Flipopay</span
					>
				</p>
			</div>
		</div>
	</main>
{/if}

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

	.payment-tabs {
		display: flex;
		gap: var(--spacing-sm);
		padding: 4px;
		background: var(--color-bg);
		border-radius: var(--radius-md);
	}

	.payment-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		font-weight: 500;
		font-size: 14px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.payment-tab:hover {
		color: var(--color-text-primary);
		background: rgba(99, 91, 255, 0.05);
	}

	.payment-tab.active {
		background: var(--color-card);
		color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.form-group {
		position: relative;
	}

	.form-label {
		display: block;
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xs);
	}

	.form-input {
		width: 100%;
		padding: 12px 16px;
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 15px;
		color: var(--color-text-primary);
		background: var(--color-card);
		transition: all var(--transition-fast);
		font-family: inherit;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-border-focus);
		box-shadow: var(--shadow-focus);
	}

	.form-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.input-wrapper {
		position: relative;
	}

	.card-brands {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		gap: 4px;
	}

	.upi-apps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);
	}

	.upi-app {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-md);
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-card);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-size: 13px;
		color: var(--color-text-secondary);
	}

	.upi-app:hover {
		border-color: var(--color-primary);
		background: var(--color-card-hover);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.wallet-option {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md);
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-card);
		cursor: pointer;
		transition: all var(--transition-fast);
		color: var(--color-text-primary);
	}

	.wallet-option:hover {
		border-color: var(--color-primary);
		background: var(--color-card-hover);
		transform: translateX(4px);
		box-shadow: var(--shadow-md);
	}

	.pay-button {
		width: 100%;
		margin-top: var(--spacing-lg);
		padding: 16px;
		border: none;
		border-radius: var(--radius-lg);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: white;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-base);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		box-shadow: 0 4px 12px rgba(99, 91, 255, 0.3);
	}

	.pay-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 91, 255, 0.4);
	}

	.pay-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.pay-button:disabled {
		cursor: not-allowed;
		opacity: 0.8;
	}

	.pay-button.processing {
		background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
	}

	.pay-button.success {
		background: linear-gradient(135deg, var(--color-success) 0%, #00b81f 100%);
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.checkmark {
		animation: scaleIn 0.3s ease-out;
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

	@media (max-width: 640px) {
		.payment-card {
			padding: var(--spacing-lg);
		}

		.upi-apps {
			grid-template-columns: repeat(2, 1fr);
		}

		.payment-tabs {
			flex-direction: column;
		}
	}
</style>
