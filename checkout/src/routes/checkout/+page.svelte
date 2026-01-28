<script lang="ts">
	import { page } from '$app/state';
	import CircleCheck from '$lib/assets/icons/circleCheck.svelte';
	import Error from '$lib/assets/icons/error.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import QrCode from 'svelte-qrcode';
	import PhonepeIcon from '$lib/assets/icons/phonepe-icon.svelte';
	import GooglePay from '$lib/assets/icons/google-pay-icon.svelte';
	import PaytmLogo from '$lib/assets/icons/paytm-logo.svelte';
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

	// svelte-ignore state_referenced_locally
	const decoded = jwtDecode<PayinCheckoutPayload>(data?.data || '');


	let session: PayinCheckoutPayload | undefined = $state(decoded);

	let isProcessing = $state(false);
	let paymentSuccess = $state(false);
	let selectedMethod = $state('card');
	let upiId = $state('');
	let upiError = $state('');
	let isValidating = $state(false);
	let isUpiIdValid = $state(false);
	let touched = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let selectedUpiApp = $state('');
	let isMobile = $state(false);
	let qrCodeUrl = $state('');
	let openQR = $state(false);

	onMount(() => {
		if (browser) {
			isMobile = window.innerWidth <= 768;

			qrCodeUrl = 'https://github.com/';

			const handleResize = () => {
				isMobile = window.innerWidth <= 768;
			};
			window.addEventListener('resize', handleResize);
			return () => window.removeEventListener('resize', handleResize);
		}
	});

	const gst = $derived(session ? Number(session?.transactionAmount) * 0.18 : 0);
	const totalAmount = $derived(Number(session?.transactionAmount) + gst);
	let loading = $state(false);
	let successResult = $state<CheckoutSessionSuccessResponse>();
	$inspect(successResult, 'successResult');

	let failureResult = $state();
	$inspect(failureResult, 'failureResult');

	// $inspect(result);

	async function validateUPI(value: string) {
		isValidating = true;
		try {
			const response = await fetch('/api/vpa-validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ vpa: upiId })
			});

			const validation = await response.json();
			if (validation.success) {
				upiError = validation.message;
				isUpiIdValid = true;
			} else {
				upiError = validation.message;
				isUpiIdValid = false;
			}
		} catch (error) {
			upiError = 'Error verifying UPI ID';
			isUpiIdValid = false;
		} finally {
			isValidating = false;
		}
	}

	const upiApps = [
		{ id: 'googlepay', name: 'Google Pay', icon: GooglePay },
		{ id: 'phonepe', name: 'PhonePe', icon: PhonepeIcon },
		{ id: 'paytm', name: 'Paytm', icon: PaytmLogo }
	];

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const upi = target.value;
		touched = true;
		isUpiIdValid = false;

		clearTimeout(debounceTimer);

		upiError = '';
		isValidating = false;

		// If empty, don't validate
		if (!upi.trim()) {
			return;
		}

		// Set new timer - validate after 2 seconds of inactivity
		debounceTimer = setTimeout(() => {
			validateUPI(upi);
		}, 2000);
	}

	function parseUPITimestamp(ts: string | null) {
		if (!ts) return null;
		return new Date(
			Number(ts.slice(0, 4)), // year
			Number(ts.slice(4, 6)) - 1, // month (0-based)
			Number(ts.slice(6, 8)), // day
			Number(ts.slice(8, 10)), // hour
			Number(ts.slice(10, 12)), // minute
			Number(ts.slice(12, 14)) // second
		);
	}

	let timeLeft = $state(0);
	let timer: ReturnType<typeof setInterval> | null = $state(null);

	function extractQRTime(upiUrl: string) {
		timer && clearInterval(timer);

		const params = new URLSearchParams(upiUrl.split('?')[1]);
		const endTs = params.get('QRexpire');

		const endTime = parseUPITimestamp(endTs);
		if (!endTime) return;

		const update = () => {
			const diff = Math.floor((endTime.getTime() - Date.now()) / 1000);
			timeLeft = Math.max(diff, 0);

			if (timeLeft === 0) {
				timer && clearInterval(timer);
				extractQRTime(qrCodeUrl);
			}
		};

		update(); // run immediately
		timer = setInterval(update, 1000);
	}

	function formatMMSS(seconds: number) {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}.${s.toString().padStart(2, '0')}`;
	}

	async function getIntentUrl() {
		const qrRequestData = {
			orgId: session?.orgId ? parseInt(String(session.orgId)) : undefined,
			customerPhoneNumber: session?.customerPhoneNumber,
			transactionAmount: session?.transactionAmount,
			currency: session?.currency,
			mode: 'DYNAMIC_SECURE_QR',
			orderId: session?.orderId,
			callbackUrl: session?.merchantRedirectUrl,
			checkoutId: session?.jti,
			clientDescription: 'first intent test',
			source: 'WEB'
		};

		try {
			const response = await fetch('/api/upi-intent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(qrRequestData)
			});

			const qrResponse = await response.json();
			return qrResponse;
		} catch (error) {
			//    openQR = false
		} finally {
			//    openQR = false
		}
	}

	let qrLoader = $state(false);

	async function generateQR() {
		qrLoader = true;
		const response = await getIntentUrl();
		if (response.success) {
			const upiString = response.data.intentUrl;
			openQR = true;
			qrCodeUrl = upiString;
			extractQRTime(upiString);
			successResult = response.data;
		} else {
			openQR = false;
			failureResult = response.data;
		}
		qrLoader = false;
	}

	async function handleUpiAppClick(appId: 'phonepe' | 'googlepay' | 'paytm') {
		const response = await getIntentUrl();

		if (response?.success) {
			const upiString = response.data.intentUrl;
			const params = upiString.split('?')[1];

			// Detect platform
			const isAndroid = /android/i.test(navigator.userAgent);
			const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

			const appUrls: Record<'phonepe' | 'googlepay' | 'paytm', { android: string; ios: string }> = {
				phonepe: {
					android: `intent://pay?${params}#Intent;scheme=upi;package=com.phonepe.app;end`,
					ios: `phonepe://pay?${params}`
				},
				googlepay: {
					android: `intent://pay?${params}#Intent;scheme=upi;package=com.google.android.apps.nfc.gpay;end`,
					ios: `gpay://upi/pay?${params}`
				},
				paytm: {
					android: `intent://pay?${params}#Intent;scheme=upi;package=net.one97.paytm;end`,
					ios: `paytmmp://upi/pay?${params}`
				}
			};

			let targetUrl = '';

			if (isAndroid && appUrls[appId]?.android) {
				targetUrl = appUrls[appId].android;
			} else if (isIOS && appUrls[appId]?.ios) {
				targetUrl = appUrls[appId].ios;
			} else if (!isAndroid && !isIOS) {
				return;
			} else {
				// Fallback to generic UPI URL
				targetUrl = upiString;
			}

			window.location.href = targetUrl;

			// Fallback: If app doesn't open in 2 seconds, show message
			setTimeout(() => {
				if (document.hidden) return;

				if (isIOS) {
					// iOS: Suggest App Store
					const appStoreUrls = {
						phonepe: 'https://apps.apple.com/in/app/phonepe/id1170055821',
						googlepay: 'https://apps.apple.com/in/app/google-pay/id1193357041',
						paytm: 'https://apps.apple.com/in/app/paytm-secure-payments/id473941634'
					};
					if (confirm(`App not installed. Would you like to download it from App Store?`)) {
						window.location.href = appStoreUrls[appId];
					}
				}
			}, 2000);
		} else {
			console.log('retry');
		}
	}

	async function handleSubmit() {
		loading = true;
		const upiCollectData = {
			amount: session?.transactionAmount,
			currency: session?.currency,
			customerPhoneNumber: session?.customerPhoneNumber,
			customerEmail: session?.customerEmail,
			payerVPA: upiId,
			orderId: session?.orderId,
			callBackUrl: session?.merchantRedirectUrl,
			// orgId: session?.orgId ? parseInt(String(session.orgId)) : undefined,
			orgId: 10094,
			checkoutId: session?.jti,
			paymentMethod: 'UPI_COLLECT'
		};
		try {
			const response = await fetch('/api/paymentmode', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(upiCollectData)
			});

			const result = await response.json();
			if (result?.success) {
				successResult = result.data;
			}
			if (!result?.success) {
				failureResult = result.data;
			}
		} catch (error) {
			// result = { success: false, message: 'Request failed' };
		} finally {
			loading = false;
		}
	}
	let transactionStatus = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;
	function stopPolling() {
		if (intervalId) {
			clearInterval(intervalId);
		}
	}
	async function pollTransactionStatus(crn: string) {

		const transactionStatusApi = successResult?.request?.url;

		try {
			const response = await fetch(`/api/paymentmode?crn=${crn}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});
			if (response.ok) {
				const result = await response.json();
				transactionStatus = result.data?.status;
				if (transactionStatus) {
					stopPolling();
				}
			}
		} catch (error) {
			console.log(error);
		}
	}
	function startPolling() {
		intervalId = setInterval(() => {
			if (successResult?.transactionId) {
				pollTransactionStatus(successResult?.transactionId);
			}
		}, 5000);
	}

	$effect(() => {
		if (transactionStatus === false) {
			startPolling();
		}
	});

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
{:else if transactionStatus}
	<div class="min-h-screen flex items-center justify-center p-4">
		<div class="text-center">
			<div class="text-6xl mb-4">✅</div>
			<h1 class="text-2xl font-semibold mb-2" style="color: var(--color-text-primary);">
				Payment Successful
			</h1>
			<p style="color: var(--color-text-secondary);">
				Your payment has been processed successfully.
			</p>
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
							<!-- <button
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
							</button> -->
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
									<label for="upiId" class="form-label">Pay with UPI ID</label>
									<input
										type="text"
										id="upiId"
										class="form-input mb-2"
										placeholder="yourname@upi"
										oninput={handleInput}
										bind:value={upiId}
									/>
									{#if upiError !== ''}
										<span
											class=" flex gap-2 items-center text-xs {!isUpiIdValid
												? 'text-red-500'
												: 'text-green-500'}"
										>
											{#if !isUpiIdValid}
												<Error width={'14'} height={'14'} />
											{:else}
												<CircleCheck width={'16'} height={'16'} stroke="#5bb98c" />
											{/if}
											{upiError}
										</span>
										{#if isUpiIdValid}
											<p class="text-green-500 text-sm mt-2">
												Please press pay to complete the payment
											</p>
										{/if}
									{/if}
								</div>
								{#if !isMobile}
									<div>
										<h3 class="text-sm font-semibold text-gray-700 mb-4">Scan QR code to pay</h3>
										<div
											class=" relative flex flex-col items-center p-6 bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
										>
											<div
												class="bg-white rounded-xl p-4 w-[180px] shadow-lg flex items-center justify-center"
												class:blur-sm={!openQR || timeLeft === 0}
											>
												<QrCode value={qrCodeUrl} size={160} />
											</div>
											{#if openQR}
												{#if timeLeft === 0}
													<p class="text-[16px] font-medium text-red-600 text-center mt-4 mb-2">
														QR code is expired!
													</p>
												{:else}
													<p class="text-[16px] font-medium text-gray-600 text-center mt-4 mb-2">
														QR code is valid for <span class="text-red-800"
															>{formatMMSS(timeLeft)}</span
														> minutes
													</p>
												{/if}
											{/if}
											<p class="text-sm text-gray-600 text-center mt-4 mb-2">
												Scan with any UPI app
											</p>
											<div class="flex gap-2 items-center">
												{#each upiApps as app}
													<div
														class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
														title={app.name}
													>
														<app.icon />
													</div>
												{/each}
											</div>
											{#if !openQR}
												<div
													class="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg"
												>
													{#if !qrLoader}
														<button
															onclick={generateQR}
															class="bg-white text-black px-4 py-2 rounded-md font-medium"
														>
															Pay via QR
														</button>
													{:else}
														<span class="h-8 w-8 rounded-full  animate-spin border-2 border-gray-300 border-t-gray-600"></span>
													{/if}
												</div>
											{/if}
										</div>
									</div>
								{:else}
									<div class="form-group">
										<label for="upiId" class="form-label">Pay With UPI APPS</label>
										<div class="upi-apps">
											{#each upiApps as apps, index (index)}
												<button class="upi-app" onclick={() => handleUpiAppClick('googlepay')}>
													<div
														class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
													>
														<apps.icon />
													</div>
													<span>{apps.name}</span>
												</button>
											{/each}
											<!-- <button class="upi-app" onclick={() => handleUpiAppClick('googlepay')}>
												<div
													class="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold"
												>
													GP
												</div>
												<span>Google Pay</span>
											</button>
											<button class="upi-app" onclick={() => handleUpiAppClick('phonepe')}>
												<div
													class="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold"
												>
													PP
												</div>
												<span>PhonePe</span>
											</button>
											<button class="upi-app" onclick={() => handleUpiAppClick('paytm')}>
												<div
													class="w-12 h-12 bg-linear-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold"
												>
													PT
												</div>
												<span>Paytm</span>
											</button> -->
										</div>
									</div>
								{/if}
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
							disabled={isProcessing || paymentSuccess || !isUpiIdValid}
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
								Pay ₹{totalAmount.toLocaleString('en-IN')}
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
								<p
									class="text-sm"
									style="color: var(--color-text-tertiary); font-family: monospace;"
								>
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
