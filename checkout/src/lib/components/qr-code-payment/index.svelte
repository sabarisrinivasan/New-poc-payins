<script lang="ts">
	import QrCode from 'svelte-qrcode';

	let {
		qrCodeUrl,
		countdown,
		onBack
	}: {
		qrCodeUrl: string | undefined;
		countdown: string;
		onBack?: () => void;
	} = $props();
</script>

<div class="payment-section">
	<!-- Back Button -->
	{#if onBack}
		<div class="back-button-container animate-slide-in-left">
			<button onclick={onBack} class="back-button">
				<svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				<span>Back to payment options</span>
			</button>
		</div>
	{/if}

	<div class="qr-container">
		<!-- Header -->
		<div class="qr-header">
			<h3 class="qr-title">Scan QR Code to Pay</h3>
			<p class="qr-subtitle">Use any UPI app to complete your payment</p>
		</div>

		<!-- QR Code Display -->
		<div class="qr-display-wrapper">
			<div class="qr-code-box" >
				{#if qrCodeUrl}
					<div class="qr-code-inner animate-pulse" data-testid="qr-code">
						<QrCode value={qrCodeUrl} size={220} />
					</div>
				{:else}
					<div class="qr-skeleton">
						<div class="skeleton-pulse"></div>
					</div>
				{/if}
			</div>

			<!-- Countdown Timer -->
			{#if countdown}
				<div class="countdown-badge">
					<svg class="timer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span class="countdown-text">Expires in {countdown}</span>
				</div>
			{/if}
		</div>

		<!-- UPI Apps -->
		<div class="upi-apps-section">
			<p class="apps-label">Supported UPI Apps</p>
			<div class="apps-grid">
				<div class="app-badge">
					<svg viewBox="0 0 48 48" class="app-icon">
						<path
							fill="#4285F4"
							d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
						/>
						<path
							fill="#34A853"
							d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
						/>
						<path
							fill="#FBBC05"
							d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
						/>
						<path
							fill="#EA4335"
							d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
						/>
					</svg>
					<span>GPay</span>
				</div>
				<div class="app-badge">
					<svg viewBox="0 0 48 48" class="app-icon">
						<circle cx="24" cy="24" r="24" fill="#5F259F" />
						<path
							fill="white"
							d="M24 12c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z"
						/>
					</svg>
					<span>PhonePe</span>
				</div>
				<div class="app-badge">
					<svg viewBox="0 0 48 48" class="app-icon">
						<rect width="48" height="48" rx="8" fill="#00BAF2" />
						<path fill="white" d="M24 12l-8 8 8 8 8-8-8-8zm0 4l4 4-4 4-4-4 4-4z" />
					</svg>
					<span>Paytm</span>
				</div>
				<div class="app-badge">
					<svg viewBox="0 0 48 48" class="app-icon">
						<rect width="48" height="48" rx="8" fill="#097939" />
						<path fill="white" d="M24 14v20m-6-14l6-6 6 6m-12 8l6 6 6-6" />
					</svg>
					<span>BHIM</span>
				</div>
			</div>
		</div>

		<!-- Instructions -->
		<div class="instructions-box">
			<div class="instruction-step">
				<div class="step-number">1</div>
				<p>Open any UPI app</p>
			</div>
			<div class="instruction-step">
				<div class="step-number">2</div>
				<p>Scan the QR code</p>
			</div>
			<div class="instruction-step">
				<div class="step-number">3</div>
				<p>Complete payment</p>
			</div>
		</div>
	</div>
</div>

<style>
	.payment-section {
		min-height: 500px;
		animation: fadeIn 0.4s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.qr-container {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: var(--radius-xl);
		padding: var(--spacing-xl);
		box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
		position: relative;
		overflow: hidden;
	}

	.qr-container::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		animation: shimmer 3s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%) translateY(-100%) rotate(45deg);
		}
		100% {
			transform: translateX(100%) translateY(100%) rotate(45deg);
		}
	}

	.qr-header {
		text-align: center;
		margin-bottom: var(--spacing-lg);
		position: relative;
		z-index: 1;
	}

	.qr-title {
		font-size: 24px;
		font-weight: 700;
		color: white;
		margin-bottom: 8px;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.qr-subtitle {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.9);
	}

	.qr-display-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
		position: relative;
		z-index: 1;
	}

	.qr-code-box {
		background: white;
		border-radius: var(--radius-xl);
		padding: var(--spacing-lg);
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
		position: relative;
	}

	.qr-code-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.animate-pulse {
		animation: qrPulse 2s ease-in-out infinite;
	}

	@keyframes qrPulse {
		0%,
		100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(99, 91, 255, 0.4);
		}
		50% {
			transform: scale(1.02);
			box-shadow: 0 0 0 10px rgba(99, 91, 255, 0);
		}
	}

	.qr-skeleton {
		width: 220px;
		height: 220px;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
		border-radius: var(--radius-md);
	}

	@keyframes loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.countdown-badge {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(255, 255, 255, 0.95);
		padding: 12px 20px;
		border-radius: 50px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		animation: bounce 2s ease-in-out infinite;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}

	.timer-icon {
		width: 20px;
		height: 20px;
		color: var(--color-primary);
	}

	.countdown-text {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.upi-apps-section {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border-radius: var(--radius-lg);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		position: relative;
		z-index: 1;
	}

	.apps-label {
		font-size: 13px;
		font-weight: 600;
		color: white;
		text-align: center;
		margin-bottom: var(--spacing-sm);
		opacity: 0.95;
	}

	.apps-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-sm);
	}

	.app-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: var(--spacing-sm);
		background: rgba(255, 255, 255, 0.9);
		border-radius: var(--radius-md);
		transition: all var(--transition-base);
		cursor: pointer;
	}

	.app-badge:hover {
		transform: translateY(-2px);
		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.app-icon {
		width: 32px;
		height: 32px;
	}

	.app-badge span {
		font-size: 11px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.instructions-box {
		display: flex;
		justify-content: space-around;
		gap: var(--spacing-sm);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: var(--radius-lg);
		padding: var(--spacing-md);
		position: relative;
		z-index: 1;
	}

	.instruction-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.step-number {
		width: 32px;
		height: 32px;
		background: white;
		color: var(--color-primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.instruction-step p {
		font-size: 12px;
		color: white;
		text-align: center;
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.qr-container {
			padding: var(--spacing-lg);
		}

		.qr-title {
			font-size: 20px;
		}

		.qr-code-box {
			padding: var(--spacing-md);
		}

		.qr-code-inner :global(canvas) {
			width: 180px !important;
			height: 180px !important;
		}

		.apps-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-xs);
		}

		.instructions-box {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.instruction-step {
			flex-direction: row;
			justify-content: flex-start;
			gap: 12px;
		}

		.instruction-step p {
			text-align: left;
		}
	}

	/* Back Button Styles */
	.back-button-container {
		margin-bottom: var(--spacing-lg);
	}

	.back-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: white;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text-secondary);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-base);
		box-shadow: var(--shadow-sm);
	}

	.back-button:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
		transform: translateX(-4px);
		box-shadow: var(--shadow-md);
	}

	.back-button:active {
		transform: translateX(-2px);
	}

	.back-icon {
		width: 20px;
		height: 20px;
		transition: transform var(--transition-base);
	}

	.back-button:hover .back-icon {
		transform: translateX(-2px);
	}

	@keyframes slideInFromLeft {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.animate-slide-in-left {
		animation: slideInFromLeft 0.3s ease-out;
	}
</style>
