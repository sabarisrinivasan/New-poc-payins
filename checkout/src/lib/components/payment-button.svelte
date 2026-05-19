<script lang="ts">
	let {
		isValid,
		isVerifying,
		isInitiatingPayment,
		isVerified,
		onclick
	}: {
		isValid: boolean;
		isVerifying: boolean;
		isInitiatingPayment: boolean;
		isVerified: boolean;
		onclick: () => void;
	} = $props();
</script>

<button class="pay-button" disabled={!isValid} {onclick}>
	{#if isVerifying}
		<span class="flex items-center justify-center gap-2">
			<svg
				class="animate-spin h-5 w-5"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			Verifying UPI ID...
		</span>
	{:else if isInitiatingPayment}
		<span class="flex items-center justify-center gap-2">
			<svg
				class="animate-spin h-5 w-5"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			Initiating Payment...
		</span>
	{:else if isVerified}
		Payment Initiated
	{:else}
		Verify & Pay
	{/if}
</button>

<style>
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
</style>
