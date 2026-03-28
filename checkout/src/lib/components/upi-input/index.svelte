<script lang="ts">
	import GooglePayIcon from '$lib/assets/icons/google-pay-icon.svelte';
	import Bhim from '$lib/icons/bhim.svelte';
	import GooglePay from '$lib/icons/google-pay.svelte';
	import Paytm from '$lib/icons/paytm.svelte';
	import PhonePe from '$lib/icons/phone-pe.svelte';

	let {
		inputUpiId = $bindable(),
		upiError,
		isVerified,
		verificationMessage
	}: {
		inputUpiId: string;
		upiError: string | null;
		isVerified: boolean;
		verificationMessage: string;
	} = $props();
</script>

<div class="payment-section">
	<div class="form-group">
		<label for="upiId" class="input-label"> Enter your UPI ID </label>
		<div class="input-wrapper">
			<input
				type="text"
				id="upiId"
				class="upi-input"
				class:error={upiError}
				class:success={isVerified && !upiError}
				bind:value={inputUpiId}
				placeholder="yourname@paytm / yourname@googlepay"
				aria-invalid={upiError !== null}
				aria-describedby={upiError ? 'upi-error' : 'upi-helper'}
			/>
			{#if isVerified && !upiError}
				<svg class="input-icon success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			{:else if upiError}
				<svg
					class="input-icon error-icon-svg"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			{/if}
		</div>

		{#if upiError}
			<p id="upi-error" class="feedback-text error-text">
				<svg class="feedback-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				{upiError}
			</p>
		{:else if isVerified && verificationMessage}
			<p id="upi-success" class="feedback-text success-text">
				<svg class="feedback-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				{verificationMessage}
			</p>
		{:else}
			<p id="upi-helper" class="feedback-text helper-text">
				Enter your UPI ID to complete the payment
			</p>
		{/if}
	</div>

	<div class="upi-apps-info">
		<p class="apps-title">Supported UPI apps:</p>
		<div class="apps-container">
			<div class="upi-app-badge">
				<GooglePay />
				<span class="app-name">Google Pay</span>
			</div>
			<div class="upi-app-badge">
				<PhonePe />
				<span class="app-name">PhonePe</span>
			</div>
			<div class="upi-app-badge">
				<Paytm />
				<span class="app-name">Paytm</span>
			</div>
			<div class="upi-app-badge">
				<Bhim />
				<span class="app-name">BHIM</span>
			</div>
		</div>
	</div>
</div>

<style>
	.payment-section {
		min-height: 200px;
		animation: fadeIn 0.3s ease-in-out;
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

	.form-group {
		position: relative;
		margin-bottom: var(--spacing-lg);
	}

	.input-label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		font-size: 14px;
		color: var(--color-text-primary);
	}

	.input-wrapper {
		position: relative;
	}

	.upi-input {
		width: 100%;
		padding: 14px 48px 14px 16px;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: 15px;
		color: var(--color-text-primary);
		background: white;
		transition: all var(--transition-base);
		outline: none;
	}

	.upi-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.upi-input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 4px rgba(99, 91, 255, 0.1);
		background: linear-gradient(to right, rgba(99, 91, 255, 0.02), white);
	}

	.upi-input.error {
		border-color: var(--color-error);
		background: rgba(223, 27, 65, 0.02);
	}

	.upi-input.error:focus {
		box-shadow: 0 0 0 4px rgba(223, 27, 65, 0.1);
	}

	.upi-input.success {
		border-color: var(--color-success);
		background: rgba(0, 217, 36, 0.02);
	}

	.upi-input.success:focus {
		box-shadow: 0 0 0 4px rgba(0, 217, 36, 0.1);
	}

	.input-icon {
		position: absolute;
		right: 16px;
		top: 50%;
		transform: translateY(-50%);
		width: 24px;
		height: 24px;
		animation: scaleIn 0.2s ease-out;
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: translateY(-50%) scale(0.8);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) scale(1);
		}
	}

	.success-icon {
		color: var(--color-success);
	}

	.error-icon-svg {
		color: var(--color-error);
	}

	.feedback-text {
		margin-top: 8px;
		font-size: 13px;
		display: flex;
		align-items: center;
		gap: 6px;
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.feedback-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.error-text {
		color: var(--color-error);
	}

	.success-text {
		color: var(--color-success);
	}

	.helper-text {
		color: var(--color-text-secondary);
	}

	.upi-apps-info {
		margin-top: var(--spacing-xl);
		padding: var(--spacing-lg);
		background: linear-gradient(135deg, rgba(99, 91, 255, 0.05), rgba(102, 126, 234, 0.05));
		border-radius: var(--radius-lg);
		border: 1px solid rgba(99, 91, 255, 0.1);
	}

	.apps-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-md);
	}

	.apps-container {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	.upi-app-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: var(--spacing-sm);
		background: white;
		border-radius: var(--radius-md);
		transition: all var(--transition-base);
		cursor: pointer;
		border: 1px solid var(--color-border);
		min-width: 80px;
	}

	.upi-app-badge:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.app-logo {
		width: 36px;
		height: 36px;
	}

	.app-name {
		font-size: 11px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	@media (max-width: 640px) {
		.payment-section {
			min-height: 350px;
		}

		.apps-container {
			justify-content: space-between;
		}

		.upi-app-badge {
			flex: 1;
			min-width: 70px;
		}
	}
</style>
