import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from './format';

describe('Format Utilities', () => {
    describe('formatCurrency', () => {
        it('formats number to ARS currency', () => {
            const result = formatCurrency(150000);
            expect(result).toContain('$');
            expect(result).toMatch(/150\.000|150,000/); // Depends on locale, but should be formatted
        });

        it('handles zero correctly', () => {
            const result = formatCurrency(0);
            expect(result).toContain('0');
        });
    });

    describe('formatDate', () => {
        it('formats date string correctly', () => {
            const result = formatDate('2026-12-25');
            expect(result).toBeTruthy();
        });
    });
});
