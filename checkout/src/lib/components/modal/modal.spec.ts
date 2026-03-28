import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Modal from './index.svelte';

describe('Modal', () => {
    const onConfirmMock = vi.fn();
    const onCancelMock = vi.fn();
    it('renders with text Cancel Payment? ', () => {
        render(Modal, {
            props: {
                isOpen: true,
                onConfirm: () => { }, // Mock
                onCancel: () => { }, // Mock  
            }
        });
        expect(screen.getByText('Cancel Payment?')).toBeInTheDocument();
    });
    it('calls onConfirm when button is clicked ', async() => {
        render(Modal, {
            props: {
                isOpen: true,
                onConfirm: onConfirmMock, // Mock
                onCancel: () => { }, // Mock  
            }
        });
        const confirmButton = screen.getByText('Yes, Go Back')
       await fireEvent.click(confirmButton);
       expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });
    it('calls onCancel when button is clicked ', async() => {
        render(Modal, {
            props: {
                isOpen: true,
                onConfirm: () => { }, // Mock
                onCancel: onCancelMock, // Mock  
            }
        });
       const cancelButton = screen.getByText('Stay on Page')
       await fireEvent.click(cancelButton);
       expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
})