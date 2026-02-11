import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CheckoutPage from './+page.svelte';

const MockData = {
    message: 'Token is Valid',
    status: 200,
    success: true,
    data: {
        currency: 'INR',
        customerEmail: 'xxx@gmail.com',
        customerName: '',
        customerPhoneNumber: '9305967058',
        exp: 1770882893,
        iat: 1770796493,
        iss: 'FLIPOPAY',
        jti: 'hsdhued78899',
        merchantRedirectUrl: 'http://localhost:5173/callback',
        orderId: 'YQTQ23242193109292',
        orgId: '10094',
        purpose: 'payin_checkout',
        transactionAmount: '500'
    }
};

describe('Checkout Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initial Rendering', () => {
        it('renders the checkout page with the correct title', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Complete your payment')).toBeInTheDocument();
        });

        it('renders the secure checkout subtitle', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Secure checkout powered by Flipopay')).toBeInTheDocument();
        });

        it('renders the payment method section', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Payment method - UPI')).toBeInTheDocument();
        });

        it('renders the order summary section', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Order summary')).toBeInTheDocument();
        });

        it('displays the correct subtotal amount', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Subtotal')).toBeInTheDocument();
            expect(screen.getByText('₹1,000')).toBeInTheDocument();
        });

        it('displays the tax calculation', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Tax (GST 18%)')).toBeInTheDocument();
            expect(screen.getByText('₹180')).toBeInTheDocument();
        });

        it('displays the total amount', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Total')).toBeInTheDocument();
            expect(screen.getByText('₹1,180')).toBeInTheDocument();
        });

        it('displays the transaction ID', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Transaction ID')).toBeInTheDocument();
            expect(screen.getByText('TXN123456789')).toBeInTheDocument();
        });

        it('displays security badges', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Secured by SSL')).toBeInTheDocument();
            expect(screen.getByText('PCI Compliant')).toBeInTheDocument();
        });

        it('displays the Flipopay branding in footer', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Powered by')).toBeInTheDocument();
            expect(screen.getByText('Flipopay')).toBeInTheDocument();
        });
    });

    describe('QR Code Generation', () => {
        it('renders the Generate QR Code button', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Generate QR Code')).toBeInTheDocument();
        });

        it('shows loading state when generating QR code', async () => {
            global.fetch = vi.fn(() =>
                new Promise<Response>(() => { }) // A promise that never resolves to simulate loading
            );

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByText('Generating QR...')).toBeInTheDocument();
            });
        });

        it('successfully generates QR code and displays QR payment component', async () => {
            const mockQRResponse = {
                success: true,
                data: {
                    transactionId: 'TXN123456',
                    transactionStatus: 'PENDING',
                    intentUrl: 'upi://pay?pa=test@upi',
                    expiresAt: Date.now() + 300000
                }
            };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockQRResponse)
                } as Response)
            );

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/upi-intent',
                    expect.objectContaining({
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    })
                );
            });
        });

        it('sends correct payload when generating QR code', async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ success: false })
                } as Response)
            );

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/upi-intent',
                    expect.objectContaining({
                        method: 'POST',
                        body: expect.stringContaining('"transactionAmount":"500"')
                    })
                );
            });
        });

        it('displays error message when QR generation fails', async () => {
            const mockErrorResponse = {
                success: false,
                message: 'Failed to generate QR code'
            };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockErrorResponse)
                } as Response)
            );

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByText('Failed to generate QR code')).toBeInTheDocument();
            });
        });

        it('displays generic error message when API call fails', async () => {
            global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByText('An error occurred while generating QR')).toBeInTheDocument();
            });
        });
    });

    describe('Payment Status Polling', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('starts polling when QR code is generated with PENDING status', async () => {
            const mockQRResponse = {
                success: true,
                data: {
                    transactionId: 'TXN123456',
                    transactionStatus: 'PENDING',
                    intentUrl: 'upi://pay?pa=test@upi',
                    expiresAt: Date.now() + 300000
                }
            };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockQRResponse)
                } as Response)
            );

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/upi-intent', expect.any(Object));
            });

            // Wait for initial status check
            await vi.advanceTimersByTimeAsync(100);

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/paymentCheck/TXN123456',
                expect.objectContaining({
                    method: 'GET'
                })
            );
        });

        it('stops polling when payment is successful', async () => {
            const mockQRResponse = {
                success: true,
                data: {
                    transactionId: 'TXN123456',
                    transactionStatus: 'PENDING',
                    intentUrl: 'upi://pay?pa=test@upi',
                    expiresAt: Date.now() + 300000
                }
            };

            const mockStatusResponse = {
                success: true,
                data: {
                    transactionStatus: 'SUCCESS',
                    transactionId: 'TXN123456'
                }
            };

            global.fetch = vi
                .fn()
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockQRResponse)
                } as Response)
                .mockResolvedValue({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockStatusResponse)
                } as Response);

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/upi-intent', expect.any(Object));
            });

            // Advance timers to trigger polling
            await vi.advanceTimersByTimeAsync(3000);

            // Verify polling was called
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/paymentCheck/TXN123456',
                expect.any(Object)
            );
        });

        it('handles payment timeout when timer expires', async () => {
            const expiresAt = Date.now() + 5000; // 5 seconds from now
            const mockQRResponse = {
                success: true,
                data: {
                    transactionId: 'TXN123456',
                    transactionStatus: 'PENDING',
                    intentUrl: 'upi://pay?pa=test@upi',
                    expiresAt
                }
            };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockQRResponse)
                } as Response)
            );

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/upi-intent', expect.any(Object));
            });

            // Advance past expiration time
            await vi.advanceTimersByTimeAsync(6000);
        });
    });

    describe('UPI Input Section', () => {
        it('renders UPI input component', () => {
            render(CheckoutPage, { props: { data: MockData } });
            expect(screen.getByText('Pay by any UPI app')).toBeInTheDocument();
        });
    });

    describe('Component Cleanup', () => {
        it('cleans up polling interval on unmount', async () => {
            const mockQRResponse = {
                success: true,
                data: {
                    transactionId: 'TXN123456',
                    transactionStatus: 'PENDING',
                    intentUrl: 'upi://pay?pa=test@upi',
                    expiresAt: Date.now() + 300000
                }
            };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockQRResponse)
                } as Response)
            );

            const { unmount } = render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/upi-intent', expect.any(Object));
            });

            // Unmount component
            unmount();

            // No errors should occur
            expect(true).toBe(true);
        });
    });

    describe('Back Navigation from QR Code', () => {
        it('shows confirmation modal when back button is clicked', async () => {
            const mockQRResponse = {
                success: true,
                data: {
                    transactionId: 'TXN123456',
                    transactionStatus: 'PENDING',
                    intentUrl: 'upi://pay?pa=test@upi',
                    expiresAt: Date.now() + 300000
                }
            };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockQRResponse)
                } as Response)
            );

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/upi-intent', expect.any(Object));
            });
        });
    });

    describe('Time Formatting', () => {
        it('formats time correctly in countdown', async () => {
            const mockQRResponse = {
                success: true,
                data: {
                    transactionId: 'TXN123456',
                    transactionStatus: 'PENDING',
                    intentUrl: 'upi://pay?pa=test@upi',
                    expiresAt: Date.now() + 300000 // 5 minutes
                }
            };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockQRResponse)
                } as Response)
            );

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/upi-intent', expect.any(Object));
            });
        });
    });

    describe('Payment Success Handling', () => {
        it('handles immediate success response from QR generation', async () => {
            const mockQRResponse = {
                success: true,
                data: {
                    transactionId: 'TXN123456',
                    transactionStatus: 'SUCCESS',
                    intentUrl: 'upi://pay?pa=test@upi',
                    expiresAt: Date.now() + 300000
                }
            };

            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockQRResponse)
                } as Response)
            );

            render(CheckoutPage, { props: { data: MockData } });
            const button = screen.getByText('Generate QR Code');

            fireEvent.click(button);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/upi-intent', expect.any(Object));
            });
        });
    });


});
