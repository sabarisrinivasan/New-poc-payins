import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import PaymentButton from './index.svelte';

describe('Button', () => {
    it('renders with text Verify & Pay ', () => {
        render(PaymentButton, {
            props: {
                isVerifying: false, isValid: false, isInitiatingPayment: false,
                isVerified: false,
                onclick: () => {}
            }
        });
        expect(screen.getByText('Verify & Pay')).toBeInTheDocument();
    });
    it('is disabled until isValid is false', () => {
        render(PaymentButton, {
            props: {
                isVerifying: false, isValid: false, isInitiatingPayment: false,
                isVerified: false,
                onclick: () => {}
            }
        });
        expect(screen.getByText('Verify & Pay')).toBeDisabled();
    });
    it('is enabled when isValid is true', () => {
        render(PaymentButton, {
            props: {
                isVerifying: false, isValid: true, isInitiatingPayment: false,
                isVerified: false,
                onclick: () => {}
            }
        });
        expect(screen.getByText('Verify & Pay')).not.toBeDisabled();
    });
    it('renders with text Verifying UPI ID ', () => {
        render(PaymentButton, {
            props: {
                isVerifying: true, isValid: true, isInitiatingPayment: false,
                isVerified: false,
                onclick: () => {}
            }
        });
        expect(screen.getByText('Verifying UPI ID...')).toBeInTheDocument();
    });
    it('renders with text Initiating Payment ', () => {
        render(PaymentButton, {
            props: {
                isVerifying: false, isValid: true, isInitiatingPayment: true,
                isVerified: false,
                onclick: () => {}
            }
        });
        expect(screen.getByText('Initiating Payment...')).toBeInTheDocument();
    });
     it('renders with text Payment Initiated', () => {
        render(PaymentButton, {
            props: {
                isVerifying: false, isValid: true, isInitiatingPayment: false,
                isVerified: true,
                onclick: () => {}
            }
        });
        expect(screen.getByText('Payment Initiated')).toBeInTheDocument();
    });
    it('calls on Click when button is clicked', async() => {
        const onClickMock = vi.fn();
        render(PaymentButton, {
            props: {
                isVerifying: false, isValid: true, isInitiatingPayment: false,
                isVerified: true,
                onclick: onClickMock
            }
        });
        const button = screen.getByRole('button')
        await fireEvent.click(button) 
		expect(onClickMock).toHaveBeenCalledTimes(1);
    });
});