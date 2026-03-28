import {  render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import LandingPage from './+page.svelte';

describe('Landing Page', () => {
    it('renders the landing page with the correct title', () => {
        render(LandingPage);
        expect(screen.getByText('hello')).toBeInTheDocument();
    });
});