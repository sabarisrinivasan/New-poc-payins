<script>
	import { page } from '$app/state';
	const url = page.url;
	const status = url.searchParams.get('status');
	const txnId = url.searchParams.get('txn_id');

	const isSuccess = status === 'success';
</script>

<main class="min-h-screen flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<div class="success-card animate-scale-in">
			{#if isSuccess}
				<!-- Success State -->
				<div class="success-icon-wrapper">
					<div class="success-circle">
						<svg class="checkmark" viewBox="0 0 52 52">
							<circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
							<path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
						</svg>
					</div>
				</div>

				<h1 class="title">Payment Successful!</h1>
				<p class="subtitle">Your payment has been processed successfully</p>

				<!-- Transaction Details -->
				<div class="details-card">
					<div class="detail-row">
						<span class="detail-label">Transaction ID</span>
						<span class="detail-value">{txnId}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">Status</span>
						<span class="status-badge success">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Completed
						</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">Date & Time</span>
						<span class="detail-value"
							>{new Date().toLocaleString('en-IN', {
								dateStyle: 'medium',
								timeStyle: 'short'
							})}</span
						>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="action-buttons">
					<button class="btn-primary" onclick={() => (window.location.href = '/')}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
						Back to Home
					</button>
					<button class="btn-secondary" onclick={() => window.print()}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
						Download Receipt
					</button>
				</div>

				<!-- Info Box -->
				<div class="info-box">
					<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<p>A confirmation email has been sent to your registered email address.</p>
				</div>
			{:else}
				<!-- Error State -->
				<div class="error-icon-wrapper">
					<div class="error-circle">
						<svg class="error-icon" viewBox="0 0 52 52">
							<circle class="error-circle-bg" cx="26" cy="26" r="25" fill="none" />
							<path class="error-x" fill="none" d="M16 16 36 36 M36 16 16 36" />
						</svg>
					</div>
				</div>

				<h1 class="title error">Payment Failed</h1>
				<p class="subtitle">We couldn't process your payment</p>

				<!-- Error Details -->
				<div class="details-card">
					<div class="detail-row">
						<span class="detail-label">Transaction ID</span>
						<span class="detail-value">{txnId || 'N/A'}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">Status</span>
						<span class="status-badge error">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
							Failed
						</span>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="action-buttons">
					<button class="btn-primary" onclick={() => (window.location.href = '/')}>
						Try Again
					</button>
					<button class="btn-secondary" onclick={() => (window.location.href = '/support')}>
						Contact Support
					</button>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="footer">
			<p>Powered by <span class="brand">Jubiliantpay</span></p>
		</div>
	</div>
</main>

<style>
	.success-card {
		background: var(--color-card);
		border-radius: var(--radius-xl);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--color-border);
		text-align: center;
	}

	/* Success Icon Animation */
	.success-icon-wrapper {
		display: flex;
		justify-content: center;
		margin-bottom: var(--spacing-lg);
	}

	.success-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: linear-gradient(135deg, #00d924 0%, #00b81f 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: scaleIn 0.5s ease-out;
	}

	.checkmark {
		width: 52px;
		height: 52px;
	}

	.checkmark-circle {
		stroke: white;
		stroke-width: 2;
		stroke-dasharray: 166;
		stroke-dashoffset: 166;
		animation: checkmarkCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}

	.checkmark-check {
		stroke: white;
		stroke-width: 3;
		stroke-linecap: round;
		stroke-dasharray: 48;
		stroke-dashoffset: 48;
		animation: checkmarkCheck 0.3s 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}

	@keyframes checkmarkCircle {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes checkmarkCheck {
		to {
			stroke-dashoffset: 0;
		}
	}

	/* Error Icon Animation */
	.error-icon-wrapper {
		display: flex;
		justify-content: center;
		margin-bottom: var(--spacing-lg);
	}

	.error-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: linear-gradient(135deg, #df1b41 0%, #c41738 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: scaleIn 0.5s ease-out;
	}

	.error-icon {
		width: 52px;
		height: 52px;
	}

	.error-circle-bg {
		stroke: white;
		stroke-width: 2;
		stroke-dasharray: 166;
		stroke-dashoffset: 166;
		animation: checkmarkCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}

	.error-x {
		stroke: white;
		stroke-width: 3;
		stroke-linecap: round;
		stroke-dasharray: 57;
		stroke-dashoffset: 57;
		animation: errorX 0.3s 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}

	@keyframes errorX {
		to {
			stroke-dashoffset: 0;
		}
	}

	/* Typography */
	.title {
		font-size: 28px;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
		line-height: 1.2;
	}

	.title.error {
		color: var(--color-error);
	}

	.subtitle {
		font-size: 16px;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xl);
		line-height: 1.5;
	}

	/* Details Card */
	.details-card {
		background: var(--color-bg);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-lg);
		text-align: left;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm) 0;
		gap: var(--spacing-lg);
	}

	.detail-row:not(:last-child) {
		border-bottom: 1px solid var(--color-border);
	}

	.detail-label {
		font-size: 14px;
		color: var(--color-text-secondary);
		font-weight: 500;
		flex-shrink: 0;
		min-width: 100px;
	}

	.detail-value {
		font-size: 14px;
		color: var(--color-text-primary);
		font-weight: 600;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
		text-align: right;
		word-break: break-all;
	}

	/* Status Badge */
	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: var(--radius-md);
		font-size: 13px;
		font-weight: 600;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
	}

	.status-badge.success {
		background: rgba(0, 217, 36, 0.1);
		color: var(--color-success);
	}

	.status-badge.error {
		background: rgba(223, 27, 65, 0.1);
		color: var(--color-error);
	}

	/* Action Buttons */
	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
	}

	.btn-primary,
	.btn-secondary {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		padding: 14px 20px;
		border: none;
		border-radius: var(--radius-lg);
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.btn-primary {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(99, 91, 255, 0.3);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 91, 255, 0.4);
	}

	.btn-primary:active {
		transform: translateY(0);
	}

	.btn-secondary {
		background: var(--color-card);
		color: var(--color-text-primary);
		border: 1.5px solid var(--color-border);
	}

	.btn-secondary:hover {
		background: var(--color-card-hover);
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.btn-secondary:active {
		transform: translateY(0);
	}

	/* Info Box */
	.info-box {
		display: flex;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		background: rgba(99, 91, 255, 0.05);
		border: 1px solid rgba(99, 91, 255, 0.2);
		border-radius: var(--radius-lg);
		text-align: left;
		align-items: flex-start;
	}

	.info-box svg {
		flex-shrink: 0;
		margin-top: 2px;
	}

	.info-box p {
		font-size: 13px;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.6;
	}

	/* Footer */
	.footer {
		text-align: center;
		margin-top: var(--spacing-lg);
		padding-top: var(--spacing-lg);
	}

	.footer p {
		font-size: 14px;
		color: var(--color-text-tertiary);
		margin: 0;
	}

	.brand {
		font-weight: 700;
		color: var(--color-primary);
	}

	/* Responsive */
	@media (min-width: 640px) {
		.action-buttons {
			flex-direction: row;
		}

		.btn-primary,
		.btn-secondary {
			flex: 1;
		}
	}

	@media (max-width: 480px) {
		.success-card {
			padding: var(--spacing-lg);
		}

		.title {
			font-size: 24px;
		}

		.subtitle {
			font-size: 14px;
		}

		.detail-label,
		.detail-value {
			font-size: 13px;
		}
	}

	/* Print Styles */
	@media print {
		.action-buttons {
			display: none;
		}

		.info-box {
			border: 1px solid #ddd;
		}
	}
</style>
