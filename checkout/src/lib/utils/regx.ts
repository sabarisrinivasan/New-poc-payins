const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export const validateUpiFormat = (upi: string): string | null => {
	if (!upi || !upi.trim()) {
		return null; // Don't show error for empty input
	}

	if (!UPI_REGEX.test(upi.trim())) {
		return 'Invalid UPI ID format (e.g., yourname@paytm)';
	}

	return null; // valid
};
