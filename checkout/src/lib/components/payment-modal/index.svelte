<script lang="ts">
	import type { PayinInitiateStatusResponse, QRPaymentStatusResponse } from '$lib/utils/types';

	let {
		showModal = $bindable(),
		transactionStatus = $bindable(),
		paymentData = $bindable(),
		inputUpiId = $bindable(),
		timeRemaining = $bindable(),
		onClose
	}: {
		showModal: boolean;
		transactionStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
		paymentData?: PayinInitiateStatusResponse | QRPaymentStatusResponse;
		qrData?: QRPaymentStatusResponse;
		inputUpiId?: string;
		timeRemaining?: string;
		onClose?: () => void;
	} = $props();

	function closeModal() {
		showModal = false;
		if (onClose) onClose();
	}
</script>

{#if showModal}
	<div class="fixed inset-0 bg-white/50 bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="payment-modal">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
			<!-- Close button - only show if not pending -->
			{#if transactionStatus !== 'PENDING'}
				<button
					onclick={closeModal}
					class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
					aria-label="Close"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			{/if}

			<!-- Status Icon -->
			<div class="flex justify-center mb-4">
				{#if transactionStatus === 'PENDING'}
					<div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
						<svg
							class="animate-spin h-8 w-8 text-yellow-600"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					</div>
				{:else if transactionStatus === 'SUCCESS'}
					<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
						<svg
							class="w-8 h-8 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
					</div>
				{:else if transactionStatus === 'FAILED'}
					<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
						<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</div>
				{:else if transactionStatus === 'EXPIRED'}
					<div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
						<svg
							class="w-8 h-8 text-gray-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
					</div>
				{/if}
			</div>

			<!-- Status Title -->
			<h2 class="text-2xl font-bold text-center mb-2">
				{#if transactionStatus === 'PENDING'}
					Payment Pending
				{:else if transactionStatus === 'SUCCESS'}
					Payment Successful!
				{:else if transactionStatus === 'FAILED'}
					Payment Failed
				{:else if transactionStatus === 'EXPIRED'}
					Payment Expired
				{/if}
			</h2>

			<!-- Status Message -->
			<p class="text-center text-gray-600 mb-6">
				{#if transactionStatus === 'PENDING'}
					Please check your UPI app and approve the payment request
				{:else if transactionStatus === 'SUCCESS'}
					Your payment has been processed successfully
				{:else if transactionStatus === 'FAILED'}
					Your payment could not be processed
				{:else if transactionStatus === 'EXPIRED'}
					The payment request has expired
				{/if}
			</p>

			<!-- Payment Details -->
			<!-- Payment Details -->
			{#if paymentData}
				<div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
					<div class="flex justify-between">
						<span class="text-gray-600">Amount:</span>
						<span class="font-semibold">
							₹{paymentData.paymentMetadata?.amount || 'N/A'}
						</span>
					</div>
					{#if 'intentUrl' in paymentData}
						<!-- QR Payment specific fields -->
						<div class="flex justify-between">
							<span class="text-gray-600">Payment Mode:</span>
							<span class="font-semibold">QR Code</span>
						</div>
					{:else}
						<!-- UPI ID Payment specific fields -->
						<div class="flex justify-between">
							<span class="text-gray-600">UPI ID:</span>
							<span class="font-semibold">
								{paymentData.paymentMetadata?.customerVpa || inputUpiId || 'N/A'}
							</span>
						</div>
					{/if}
					<div class="flex justify-between">
						<span class="text-gray-600">Order ID:</span>
						<span class="font-mono text-sm">{paymentData.orderId || 'N/A'}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Transaction ID:</span>
						<span class="font-mono text-sm">{paymentData.transactionId || 'N/A'}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Status:</span>
						<span
							class="font-semibold"
							class:text-yellow-600={transactionStatus === 'PENDING'}
							class:text-green-600={transactionStatus === 'SUCCESS'}
							class:text-red-600={transactionStatus === 'FAILED'}
							class:text-gray-600={transactionStatus === 'EXPIRED'}
						>
							{transactionStatus}
						</span>
					</div>
					{#if transactionStatus === 'PENDING' && timeRemaining}
						<div class="flex justify-between">
							<span class="text-gray-600">Time Remaining:</span>
							<span class="font-semibold text-yellow-600">{timeRemaining}</span>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="flex gap-3">
				{#if transactionStatus === 'SUCCESS'}
					<button
						onclick={closeModal}
						class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
					>
						Done
					</button>
				{:else if transactionStatus === 'FAILED' || transactionStatus === 'EXPIRED'}
					<button
						onclick={closeModal}
						class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
					>
						Try Again
					</button>
				{:else if transactionStatus === 'PENDING'}
					<div class="flex-1 text-center text-sm text-gray-500">Waiting for confirmation...</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
