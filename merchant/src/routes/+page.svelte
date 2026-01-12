<script lang="ts">
	import Tshirt from '$lib/images/t-shirt.png';

	let quantity = 1;

	function createPayment() {
		const txnId = 'txn_' + Date.now();
		const callbackUrl = encodeURIComponent('http://localhost:5175/callback');
		const token = btoa(
			JSON.stringify({
				txn_id: txnId,
				amount: 1000 * quantity,
				callback_url: 'http://localhost:5174/callback'
			})
		);

		const paymentUrl = `http://localhost:5173/checkout?token=${token}`;
		window.location.href = paymentUrl;
	}

	function incrementQuantity() {
		if (quantity < 10) quantity++;
	}

	function decrementQuantity() {
		if (quantity > 1) quantity--;
	}
</script>

<main class="min-h-screen flex items-center justify-center p-4">
	<div class="container">
		<!-- Decorative Background Elements -->
		<div class="bg-decoration bg-decoration-1"></div>
		<div class="bg-decoration bg-decoration-2"></div>

		<div class="product-card animate-slide-up">
			<div class="product-grid">
				<!-- Product Image Section -->
				<div class="image-section">
					<div class="image-wrapper">
						<img src={Tshirt} alt="Premium Fine T-Shirt" class="product-image" />
						<div class="image-badge">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Premium Quality
						</div>
					</div>
				</div>

				<!-- Product Details Section -->
				<div class="details-section">
					<div class="product-header">
						<div class="category-badge">Fashion</div>
						<h1 class="product-title">Fine T-Shirt</h1>
						<p class="product-subtitle">Premium Cotton Collection</p>
					</div>

					<!-- Price Section -->
					<div class="price-section">
						<div class="price-wrapper">
							<span class="price-label">Price</span>
							<div class="price-amount">
								<span class="currency">$</span>
								<span class="amount">{(1000 * quantity).toLocaleString()}</span>
							</div>
						</div>
						{#if quantity > 1}
							<div class="price-breakdown">
								$1,000 × {quantity} items
							</div>
						{/if}
					</div>

					<!-- Product Description -->
					<div class="description-section">
						<h3 class="section-title">Product Details</h3>
						<p class="description-text">
							Experience ultimate comfort with our premium fine t-shirt. Crafted from 100% organic
							cotton, this piece combines luxury with sustainability. Perfect for any occasion,
							featuring a modern fit and breathable fabric that keeps you comfortable all day long.
						</p>
					</div>

					<!-- Features List -->
					<div class="features-section">
						<div class="feature-item">
							<svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span>100% Organic Cotton</span>
						</div>
						<div class="feature-item">
							<svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span>Free Shipping Worldwide</span>
						</div>
						<div class="feature-item">
							<svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span>30-Day Easy Returns</span>
						</div>
					</div>

					<!-- Quantity Selector -->
					<div class="quantity-section">
						<label class="quantity-label">Quantity</label>
						<div class="quantity-controls">
							<button class="quantity-btn" onclick={decrementQuantity} disabled={quantity <= 1}>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M20 12H4"
									/>
								</svg>
							</button>
							<span class="quantity-value">{quantity}</span>
							<button class="quantity-btn" onclick={incrementQuantity} disabled={quantity >= 10}>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4v16m8-8H4"
									/>
								</svg>
							</button>
						</div>
					</div>

					<!-- Purchase Button -->
					<button onclick={createPayment} class="purchase-btn">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
							/>
						</svg>
						<span>Proceed to Payment</span>
					</button>

					<!-- Security Badge -->
					<div class="security-badge">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
						<span>Secure payment powered by <strong>Flipopay</strong></span>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		position: relative;
	}

	/* Decorative Background Elements */
	.bg-decoration {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.15;
		pointer-events: none;
		z-index: 0;
	}

	.bg-decoration-1 {
		width: 400px;
		height: 400px;
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
		top: -100px;
		left: -100px;
	}

	.bg-decoration-2 {
		width: 300px;
		height: 300px;
		background: linear-gradient(135deg, var(--color-success), #00ff88);
		bottom: -50px;
		right: -50px;
	}

	/* Product Card */
	.product-card {
		background: var(--color-card);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--color-border);
		overflow: hidden;
		position: relative;
		z-index: 1;
	}

	.product-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0;
	}

	/* Image Section */
	.image-section {
		background: linear-gradient(135deg, #f6f9fc 0%, #e9ecef 100%);
		padding: var(--spacing-xl);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.image-wrapper {
		position: relative;
		width: 100%;
		max-width: 400px;
		aspect-ratio: 1;
	}

	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--radius-lg);
		transition: transform var(--transition-slow);
	}

	.product-card:hover .product-image {
		transform: scale(1.05);
	}

	.image-badge {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		background: rgba(0, 217, 36, 0.95);
		color: white;
		padding: 8px 14px;
		border-radius: var(--radius-md);
		font-size: 12px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 6px;
		box-shadow: 0 4px 12px rgba(0, 217, 36, 0.3);
		animation: slideUp 0.6s ease-out 0.3s both;
	}

	/* Details Section */
	.details-section {
		padding: var(--spacing-xl);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.product-header {
		animation: fadeIn 0.6s ease-out 0.2s both;
	}

	.category-badge {
		display: inline-block;
		background: rgba(99, 91, 255, 0.1);
		color: var(--color-primary);
		padding: 6px 12px;
		border-radius: var(--radius-md);
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: var(--spacing-sm);
	}

	.product-title {
		font-size: 36px;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 var(--spacing-xs) 0;
		line-height: 1.2;
	}

	.product-subtitle {
		font-size: 16px;
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Price Section */
	.price-section {
		background: linear-gradient(135deg, rgba(99, 91, 255, 0.05) 0%, rgba(99, 91, 255, 0.02) 100%);
		padding: var(--spacing-lg);
		border-radius: var(--radius-lg);
		border: 1px solid rgba(99, 91, 255, 0.1);
		animation: fadeIn 0.6s ease-out 0.3s both;
	}

	.price-wrapper {
		display: flex;
		align-items: baseline;
		gap: var(--spacing-sm);
	}

	.price-label {
		font-size: 14px;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.price-amount {
		display: flex;
		align-items: baseline;
		gap: 4px;
	}

	.currency {
		font-size: 24px;
		font-weight: 700;
		color: var(--color-primary);
	}

	.amount {
		font-size: 40px;
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1;
	}

	.price-breakdown {
		font-size: 13px;
		color: var(--color-text-tertiary);
		margin-top: var(--spacing-xs);
	}

	/* Description Section */
	.description-section {
		animation: fadeIn 0.6s ease-out 0.4s both;
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--spacing-sm) 0;
	}

	.description-text {
		font-size: 15px;
		color: var(--color-text-secondary);
		line-height: 1.7;
		margin: 0;
	}

	/* Features Section */
	.features-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		animation: fadeIn 0.6s ease-out 0.5s both;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 14px;
		color: var(--color-text-secondary);
	}

	.feature-icon {
		width: 18px;
		height: 18px;
		color: var(--color-success);
		flex-shrink: 0;
	}

	/* Quantity Section */
	.quantity-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		animation: fadeIn 0.6s ease-out 0.6s both;
	}

	.quantity-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		background: var(--color-bg);
		padding: 6px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.quantity-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all var(--transition-base);
		color: var(--color-text-primary);
	}

	.quantity-btn:hover:not(:disabled) {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
		transform: scale(1.05);
	}

	.quantity-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.quantity-value {
		min-width: 40px;
		text-align: center;
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	/* Purchase Button */
	.purchase-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		padding: 16px 24px;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-base);
		box-shadow: 0 4px 16px rgba(99, 91, 255, 0.3);
		animation: fadeIn 0.6s ease-out 0.7s both;
	}

	.purchase-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(99, 91, 255, 0.4);
	}

	.purchase-btn:active {
		transform: translateY(0);
	}

	/* Security Badge */
	.security-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		font-size: 13px;
		color: var(--color-text-tertiary);
		padding-top: var(--spacing-md);
		border-top: 1px solid var(--color-border);
		animation: fadeIn 0.6s ease-out 0.8s both;
	}

	.security-badge strong {
		color: var(--color-primary);
		font-weight: 700;
	}

	/* Responsive Design */
	@media (max-width: 968px) {
		.product-grid {
			grid-template-columns: 1fr;
		}

		.image-section {
			padding: var(--spacing-lg);
		}

		.product-title {
			font-size: 28px;
		}

		.amount {
			font-size: 32px;
		}
	}

	@media (max-width: 480px) {
		.details-section {
			padding: var(--spacing-lg);
		}

		.product-title {
			font-size: 24px;
		}

		.amount {
			font-size: 28px;
		}

		.currency {
			font-size: 20px;
		}

		.purchase-btn {
			padding: 14px 20px;
			font-size: 15px;
		}
	}
</style>
