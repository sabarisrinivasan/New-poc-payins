import {  render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import UpiInput from './index.svelte';

describe('Upi Input section', () => {
    it('Upi id field displays the upiId value passed in props', () => {
        render(UpiInput, {
            props: {
                inputUpiId :'1234567890@upi',
                upiError:'',
                isVerified:false,
                verificationMessage:''
            }
        });
        expect(screen.getByPlaceholderText('yourname@paytm / yourname@googlepay')).toHaveValue('1234567890@upi');
    });
     it('Upi id field displays Upi Error passed in props', () => {
        render(UpiInput, {
            props: {
                inputUpiId :'123456',
                upiError:'Enter Valid UPI ID',
                isVerified:false,
                verificationMessage:''
            }
        });
        expect(screen.getByText('Enter Valid UPI ID')).toBeInTheDocument()
    });
    it('Displays Verification Message', () => {
        render(UpiInput, {
            props: {
                inputUpiId :'1234567890@upi',
                upiError:'',
                isVerified:true,
                verificationMessage:'UPI ID Verified'
            }
        });
        expect(screen.getByText('UPI ID Verified')).toBeInTheDocument()
    });
})