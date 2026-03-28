import {  render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Modal from './index.svelte';
import type { PayinInitiateStatusResponse } from '$lib/utils/types';

const sampleData : PayinInitiateStatusResponse = {
    expiresAt: 0,
    checkoutId: "chk_1234567890",
    orderId: "ord_0987654321",
    sessionStatus: "IN_PROGRESS" ,
    transactionStatus: "PENDING" ,
    redirectUrl: "https://example.com/redirect",
    transactionId: "txn_1122334455",
    message: "Payment is pending",
    redirectAction: "REDIRECT_ONLY",
    createdAt: "2024-12-01T12:00:00Z",
    paymentMetadata: {
        amount: '1000',
        currency: "INR" ,
        method: "UPI_COLLECT" ,
        customerVpa: "",
        customerReference: "Ref12345"
},
    request: {
        method: "GET" ,
        url: "https://api.example.com/payment-status" ,
    }
}


describe('Modal', () => {
    
    it('renders with text Cancel Payment? ', () => {
        render(Modal, {
            props: {
                showModal : true,
            }
        });
        expect(screen.getByTestId('payment-modal')).toBeInTheDocument();
    });
    it('when transaction status is Pending',() => {
        render(Modal, {
            props: {
                showModal : true,
                transactionStatus : 'PENDING'
            }
        });
        expect(screen.getByText('Payment Pending')).toBeInTheDocument();
         expect(screen.getByText('Please check your UPI app and approve the payment request')).toBeInTheDocument();
        expect(screen.getByText('Waiting for confirmation...')).toBeInTheDocument();
    })
    it('when transaction status is Success',() => {
        render(Modal, {
            props: {
                showModal : true,
                transactionStatus : 'SUCCESS'
            }
        });
    
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
        expect(screen.getByText('Your payment has been processed successfully')).toBeInTheDocument();
        expect(screen.getByRole('button',{name:'Done'})).toBeInTheDocument();
    })
    it('when transaction status is Failed',() => {
        render(Modal, {
            props: {
                showModal : true,
                transactionStatus : 'FAILED'
            }
        });
        expect(screen.getByText('Payment Failed')).toBeInTheDocument();
        expect(screen.getByText('Your payment could not be processed')).toBeInTheDocument();
        expect(screen.getByRole('button',{name:'Try Again'})).toBeInTheDocument();
    })
    it('when transaction status is Expired',() => {
        render(Modal, {
            props: {
                showModal : true,
                transactionStatus : 'EXPIRED'
            }
        });
        expect(screen.getByText('Payment Expired')).toBeInTheDocument();
        expect(screen.getByText('The payment request has expired')).toBeInTheDocument();
        expect(screen.getByRole('button',{name:'Try Again'})).toBeInTheDocument();
    })
    it('inputUpiId', async () => {
        render(Modal, {
            props: {
                showModal : true,
                paymentData : sampleData,
                inputUpiId: 'test@upi',
               
            }
        });
        expect(screen.getByText('test@upi')).toBeInTheDocument();
       
    })
    it('inputUpiId', async () => {
        render(Modal, {
            props: {
                showModal : true,
                paymentData : sampleData,
                transactionStatus : 'PENDING',
                timeRemaining: '10:00',
               
            }
        });
        expect(screen.getByText('10:00')).toBeInTheDocument();
       
    })
})