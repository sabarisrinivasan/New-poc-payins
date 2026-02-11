<!-- ConfirmBackModal.svelte -->
<script lang="ts">
	let {
		isOpen = $bindable(),
		onConfirm,
		onCancel
	}: {
		isOpen: boolean;
		onConfirm?: () => void;
		onCancel?: () => void;
	} = $props();

	const handleBackdropClick = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			isOpen = false;
			onCancel?.();
		}
	};

	const handleStay = () => {
		isOpen = false;
		onCancel?.();
	};

	const handleGoBack = () => {
		isOpen = false;
		onConfirm?.();
	};
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={handleBackdropClick} role="presentation">
		<div class="modal-container">
			<div class="modal-content">
				<div class="modal-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
						/>
					</svg>
				</div>

				<h2 class="modal-title">Cancel Payment?</h2>

				<p class="modal-message">
					If you go back now, your QR code will expire and you'll need to generate a new one. Are
					you sure you want to go back?
				</p>

				<div class="modal-actions">
					<button class="btn btn-secondary" onclick={handleStay}> Stay on Page </button>
					<button class="btn btn-danger" onclick={handleGoBack}> Yes, Go Back </button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease-in-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-container {
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		max-width: 400px;
		width: 90%;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		text-align: center;
	}

	.modal-icon {
		width: 64px;
		height: 64px;
		margin: 0 auto 1.5rem;
		background: #fef2f2;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-icon svg {
		width: 36px;
		height: 36px;
		color: #dc2626;
	}

	.modal-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.75rem;
	}

	.modal-message {
		color: #6b7280;
		font-size: 0.95rem;
		line-height: 1.6;
		margin: 0 0 2rem;
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		flex-direction: column-reverse;
	}

	@media (min-width: 640px) {
		.modal-actions {
			flex-direction: row;
		}
	}

	.btn {
		flex: 1;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		font-size: 0.95rem;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary {
		background: #f3f4f6;
		color: #374151;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
	}

	.btn-danger {
		background: #dc2626;
		color: white;
	}

	.btn-danger:hover {
		background: #b91c1c;
	}

	.btn:active {
		transform: scale(0.98);
	}
</style>
