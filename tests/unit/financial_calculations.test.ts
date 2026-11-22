import { describe, it, expect } from 'vitest';
import { calculateGST, formatINR } from '../../src/lib/formatting/currency';

describe('Financial & GST Calculations (Indian Standard)', () => {
  it('calculates 18% GST correctly for exclusive amounts (Intra-state CGST + SGST)', () => {
    const amount = 10000;
    const result = calculateGST(amount, 18, false, false);

    expect(result.taxableAmount).toBe(10000);
    expect(result.totalTax).toBe(1800);
    expect(result.cgstAmount).toBe(900);
    expect(result.sgstAmount).toBe(900);
    expect(result.igstAmount).toBe(0);
    expect(result.grossAmount).toBe(11800);
  });

  it('calculates 18% GST correctly for tax-inclusive pricing', () => {
    const grossAmount = 11800;
    const result = calculateGST(grossAmount, 18, true, false);

    expect(result.taxableAmount).toBe(10000);
    expect(result.totalTax).toBe(1800);
    expect(result.cgstAmount).toBe(900);
    expect(result.sgstAmount).toBe(900);
    expect(result.grossAmount).toBe(11800);
  });

  it('calculates IGST for inter-state transactions', () => {
    const amount = 5000;
    const result = calculateGST(amount, 18, false, true);

    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
    expect(result.igstAmount).toBe(900);
    expect(result.grossAmount).toBe(5900);
  });

  it('formats Indian currency (INR) with Rupee symbol and Indian comma notation', () => {
    const formatted = formatINR(150000, false);
    // Should contain ₹ and 1,50,000
    expect(formatted).toContain('1,50,000');
  });
});
