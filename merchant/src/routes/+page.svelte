<script lang="ts">
	import Tshirt from '$lib/images/t-shirt.png';
	import { enhance } from '$app/forms';

	let { form } = $props();

	$effect(() => {
		if (form?.success && form?.response) {
			const token1 = form.response.checkoutUrl;
			window.location.href = token1;
		}
	});

	let loading = $state(false);
	let quantity = $state(1);
	let unitPrice = $state(2);

	// Customer info
	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let addressLine1 = $state('');
	let addressLine2 = $state('');
	let city = $state('');
	let stateField = $state('');
	let zipCode = $state('');

	let totalAmount = $derived(unitPrice * quantity);

	function incrementQuantity() {
		if (quantity < 10) quantity++;
	}

	function decrementQuantity() {
		if (quantity > 1) quantity--;
	}

	// Prefill with random realistic test data
	const testProfiles = [
		{
			name: 'John Doe ',
			email: 'arjun.sharma@gmail.com',
			phone: '9876543210',
			addressLine1: '42 MG Road',
			addressLine2: 'Indiranagar',
			city: 'Bengaluru',
			state: 'Karnataka',
			zipCode: '560038',
			unitPrice: 2,
			quantity: 1
		},
		{
			name: 'Jane Doe ',
			email: 'priya.nair@outlook.com',
			phone: '9042173493',
			addressLine1: '7 Anna Salai',
			addressLine2: 'Near Central Station',
			city: 'Chennai',
			state: 'Tamil Nadu',
			zipCode: '600002',
			unitPrice: 2,
			quantity: 1
		},
		{
			name: 'Joe Schmoe',
			email: 'rahul.mehta@yahoo.com',
			phone: '9123456789',
			addressLine1: '15 Linking Road',
			addressLine2: 'Bandra West',
			city: 'Mumbai',
			state: 'Maharashtra',
			zipCode: '400050',
			unitPrice: 2,
			quantity: 1
		}
	];

	function prefillRandom() {
		const profile = testProfiles[Math.floor(Math.random() * testProfiles.length)];
		name = profile.name;
		email = profile.email;
		phone = profile.phone;
		addressLine1 = profile.addressLine1;
		addressLine2 = profile.addressLine2;
		city = profile.city;
		stateField = profile.state;
		zipCode = profile.zipCode;
		unitPrice = profile.unitPrice;
		quantity = profile.quantity;
	}
</script>

<main class="min-h-screen flex items-center justify-center p-4">
	<div class="container">
		<div class="bg-decoration bg-decoration-1"></div>
		<div class="bg-decoration bg-decoration-2"></div>

		<div class="page-grid animate-slide-up">
			<!-- Product Card -->
			<div class="product-card">
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

				<div class="product-info">
					<div class="category-badge">Fashion</div>
					<h1 class="product-title">Fine T-Shirt</h1>
					<p class="product-subtitle">Premium Cotton Collection</p>

					<!-- Editable Unit Price -->
					<div class="price-section">
						<div class="price-row">
							<span class="price-label">Unit Price (₹)</span>
							<input type="number" class="price-input" bind:value={unitPrice} min="1" step="1" />
						</div>
						<div class="price-total">
							<span class="total-label">Total</span>
							<div class="total-amount">
								<span class="currency">₹</span>
								<span class="amount">{totalAmount.toLocaleString('en-IN')}</span>
							</div>
						</div>
						{#if quantity > 1}
							<div class="price-breakdown">
								₹{unitPrice.toLocaleString('en-IN')} × {quantity} items
							</div>
						{/if}
					</div>

					<!-- Features -->
					<div class="features-section">
						{#each ['100% Organic Cotton', 'Free Shipping Worldwide', '30-Day Easy Returns'] as feature (feature)}
							<div class="feature-item">
								<svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<span>{feature}</span>
							</div>
						{/each}
					</div>

					<!-- Quantity -->
					<div class="quantity-section">
						<span class="quantity-label">Quantity</span>
						<div class="quantity-controls">
							<button
								title="decrease"
								class="quantity-btn"
								onclick={decrementQuantity}
								disabled={quantity <= 1}
							>
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
							<button
								title="increase"
								class="quantity-btn"
								onclick={incrementQuantity}
								disabled={quantity >= 10}
							>
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
				</div>
			</div>

			<!-- Checkout Form -->
			<div class="checkout-card">
				<div class="checkout-header">
					<h2 class="checkout-title">Customer Details</h2>
					<button type="button" class="prefill-btn" onclick={prefillRandom}>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						Prefill Test Data
					</button>
				</div>

				<form
					method="POST"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							await update();
							loading = false;
						};
					}}
				>
					<!-- Hidden fields -->
					<input type="hidden" name="amount" value={totalAmount} />

					<div class="form-grid">
						<div class="form-group">
							<label class="form-label" for="name">Full Name</label>
							<input
								id="name"
								name="name"
								type="text"
								class="form-input"
								placeholder="John Doe"
								bind:value={name}
								required
							/>
						</div>

						<div class="form-group">
							<label class="form-label" for="email">Email</label>
							<input
								id="email"
								name="email"
								type="email"
								class="form-input"
								placeholder="john@example.com"
								bind:value={email}
								required
							/>
						</div>

						<div class="form-group">
							<label class="form-label" for="phone">Phone Number</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								class="form-input"
								placeholder="9876543210"
								bind:value={phone}
								required
							/>
						</div>

						<div class="form-group full-width">
							<label class="form-label" for="addressLine1">Address Line 1</label>
							<input
								id="addressLine1"
								name="addressLine1"
								type="text"
								class="form-input"
								placeholder="12 Anna Nagar"
								bind:value={addressLine1}
								required
							/>
						</div>

						<div class="form-group full-width">
							<label class="form-label" for="addressLine2"
								>Address Line 2 <span class="optional">(optional)</span></label
							>
							<input
								id="addressLine2"
								name="addressLine2"
								type="text"
								class="form-input"
								placeholder="Near Bus Stand"
								bind:value={addressLine2}
							/>
						</div>

						<div class="form-group">
							<label class="form-label" for="city">City</label>
							<input
								id="city"
								name="city"
								type="text"
								class="form-input"
								placeholder="Chennai"
								bind:value={city}
								required
							/>
						</div>

						<div class="form-group">
							<label class="form-label" for="state">State</label>
							<input
								id="state"
								name="state"
								type="text"
								class="form-input"
								placeholder="Tamil Nadu"
								bind:value={stateField}
								required
							/>
						</div>

						<div class="form-group">
							<label class="form-label" for="zipCode">ZIP Code</label>
							<input
								id="zipCode"
								name="zipCode"
								type="text"
								class="form-input"
								placeholder="600001"
								bind:value={zipCode}
								required
							/>
						</div>
					</div>

					<!-- Order Summary -->
					<div class="order-summary">
						<div class="summary-row">
							<span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
							<span>₹{totalAmount.toLocaleString('en-IN')}</span>
						</div>
						<div class="summary-row">
							<span>Shipping</span>
							<span class="free-tag">Free</span>
						</div>
						<div class="summary-divider"></div>
						<div class="summary-row total-row">
							<span>Total</span>
							<span>₹{totalAmount.toLocaleString('en-IN')}</span>
						</div>
					</div>

					{#if form?.success === false && form.error}
						<p class="payment-error" role="alert">{form.error}</p>
					{/if}

					<button type="submit" class="purchase-btn" disabled={loading}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
							/>
						</svg>
						<span>{loading ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}</span>
					</button>

					<div class="security-badge">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
						<span>Secure payment</span>
					</div>
				</form>
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

	/* Two-column layout */
	.page-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
		position: relative;
		z-index: 1;
	}

	/* Product Card */
	.product-card {
		background: var(--color-card);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--color-border);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.image-section {
		background: linear-gradient(135deg, #f6f9fc 0%, #e9ecef 100%);
		padding: var(--spacing-xl);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image-wrapper {
		position: relative;
		width: 100%;
		max-width: 320px;
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
		transform: scale(1.04);
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
	}

	.product-info {
		padding: var(--spacing-xl);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
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
		width: fit-content;
	}

	.product-title {
		font-size: 28px;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.2;
	}

	.product-subtitle {
		font-size: 15px;
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Price Section */
	.price-section {
		background: linear-gradient(135deg, rgba(99, 91, 255, 0.05) 0%, rgba(99, 91, 255, 0.02) 100%);
		padding: var(--spacing-md);
		border-radius: var(--radius-lg);
		border: 1px solid rgba(99, 91, 255, 0.1);
	}

	.price-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
	}

	.price-label {
		font-size: 13px;
		color: var(--color-text-secondary);
		font-weight: 500;
		white-space: nowrap;
	}

	.price-input {
		width: 120px;
		padding: 6px 10px;
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text-primary);
		background: var(--color-card);
		text-align: right;
		transition: border-color var(--transition-fast);
	}

	.price-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: var(--shadow-focus);
	}

	.price-total {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.total-label {
		font-size: 14px;
		color: var(--color-text-secondary);
	}

	.total-amount {
		display: flex;
		align-items: baseline;
		gap: 3px;
	}

	.currency {
		font-size: 20px;
		font-weight: 700;
		color: var(--color-primary);
	}

	.amount {
		font-size: 32px;
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1;
	}

	.price-breakdown {
		font-size: 12px;
		color: var(--color-text-tertiary);
		margin-top: var(--spacing-xs);
		text-align: right;
	}

	/* Features */
	.features-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 13px;
		color: var(--color-text-secondary);
	}

	.feature-icon {
		width: 16px;
		height: 16px;
		color: var(--color-success);
		flex-shrink: 0;
	}

	/* Quantity */
	.quantity-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.quantity-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background: var(--color-bg);
		padding: 6px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.quantity-btn {
		width: 30px;
		height: 30px;
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
	}

	.quantity-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.quantity-value {
		min-width: 36px;
		text-align: center;
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	/* Checkout Card */
	.checkout-card {
		background: var(--color-card);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--color-border);
		padding: var(--spacing-xl);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.checkout-title {
		font-size: 20px;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
	}

	.checkout-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
	}

	.prefill-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 14px;
		background: rgba(99, 91, 255, 0.08);
		color: var(--color-primary);
		border: 1.5px dashed rgba(99, 91, 255, 0.4);
		border-radius: var(--radius-md);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-base);
		white-space: nowrap;
	}

	.prefill-btn:hover {
		background: rgba(99, 91, 255, 0.15);
		border-color: var(--color-primary);
		transform: translateY(-1px);
	}

	.prefill-btn:active {
		transform: translateY(0);
	}

	/* Form */
	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.optional {
		font-weight: 400;
		color: var(--color-text-tertiary);
	}

	.form-input {
		padding: 10px 14px;
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 14px;
		color: var(--color-text-primary);
		background: var(--color-bg);
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
		width: 100%;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: var(--shadow-focus);
		background: var(--color-card);
	}

	.form-input::placeholder {
		color: var(--color-text-tertiary);
	}

	/* Order Summary */
	.order-summary {
		background: var(--color-bg);
		border-radius: var(--radius-lg);
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		font-size: 14px;
		color: var(--color-text-secondary);
	}

	.free-tag {
		color: var(--color-success);
		font-weight: 600;
	}

	.summary-divider {
		height: 1px;
		background: var(--color-border);
		margin: 4px 0;
	}

	.total-row {
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.payment-error {
		padding: 10px 14px;
		border: 1px solid #fecaca;
		border-radius: var(--radius-md);
		background: #fef2f2;
		color: #b91c1c;
		font-size: 13px;
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
	}

	.purchase-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(99, 91, 255, 0.4);
	}

	.purchase-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
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
	}

	.security-badge strong {
		color: var(--color-primary);
		font-weight: 700;
	}

	/* Responsive */
	@media (max-width: 968px) {
		.page-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.form-group.full-width {
			grid-column: 1;
		}

		.product-title {
			font-size: 22px;
		}

		.amount {
			font-size: 26px;
		}
	}
</style>
