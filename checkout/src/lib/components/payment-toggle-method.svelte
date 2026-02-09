<script lang="ts">
	let {
		paymentMethod,
		onMethodChange
	}: {
		paymentMethod: 'upi-id' | 'qr-code';
		onMethodChange: (method: 'upi-id' | 'qr-code') => void;
	} = $props();
</script>

<div class="payment-toggle">
	<button
		class="toggle-option {paymentMethod === 'upi-id' ? 'active' : ''}"
		onclick={() => onMethodChange('upi-id')}
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
			/>
		</svg>
		Pay with UPI ID
	</button>
	<button
		class="toggle-option {paymentMethod === 'qr-code' ? 'active' : ''}"
		onclick={() => onMethodChange('qr-code')}
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
			/>
		</svg>
		Scan QR Code
	</button>
</div>

<style>
	.payment-toggle {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-sm);
		padding: 4px;
		background: var(--color-bg);
		border-radius: var(--radius-md);
	}

	.toggle-option {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-md);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		font-weight: 500;
		font-size: 14px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.toggle-option:hover {
		color: var(--color-text-primary);
		background: rgba(99, 91, 255, 0.05);
	}

	.toggle-option.active {
		background: var(--color-card);
		color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	@media (max-width: 640px) {
		.payment-toggle {
			grid-template-columns: 1fr;
		}
	}
</style>
