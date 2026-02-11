import { describe, it, expect, vi } from 'vitest';
vi.mock('svelte-qrcode', () => {
    return {
        default: () => ({
            $$render() {
                return `<img alt="QR Code" role="img" />`;
            }
        })
    };
});

import { fireEvent, render, screen } from '@testing-library/svelte';
import QrCodePayment from './index.svelte';

describe('Qr Code Payment', () => {
    const onClickMock = vi.fn();
    it('Back Button to be displayed', async () => {
        render(QrCodePayment, {
            props: {
                qrCodeUrl: '',
                countdown: '',
                onBack: onClickMock
            }
        });
        const button = screen.getByText('Back to payment options');
        expect(button).toBeInTheDocument();
        await fireEvent.click(button);
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });
    it('QR dispays countdown', () => {
        render(QrCodePayment, {
            props: {
                qrCodeUrl: '',
                countdown: '5.00',
                onBack: () => { }
            }
        });
        const countdown = screen.getByText('Expires in 5.00');
        expect(countdown).toBeInTheDocument();
    });
    it('QR code image is displayed', async () => {
        render(QrCodePayment, {
            props: {
                qrCodeUrl: 'https://example.com',
                countdown: '5.00',
                onBack: () => { }
            }
        });
        const element = screen.getByTestId('qr-code');
        expect(element).toBeInTheDocument();
    })
})

