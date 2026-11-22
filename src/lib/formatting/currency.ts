// Indian Currency & Tax Formatting Utilities

/**
 * Formats a number into Indian Rupee standard notation (e.g. ₹1,50,000.00)
 */
export function formatINR(amount: number, includeDecimals = true): string {
  if (isNaN(amount)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Calculates Indian GST components based on intra-state (CGST + SGST) or inter-state (IGST)
 */
export interface GSTBreakdown {
  taxableAmount: number;
  totalTax: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grossAmount: number;
}

export function calculateGST(
  amount: number,
  taxRatePercent = 18,
  isInclusive = false,
  isInterState = false
): GSTBreakdown {
  let taxableAmount = amount;
  let totalTax = 0;

  if (isInclusive) {
    taxableAmount = (amount * 100) / (100 + taxRatePercent);
    totalTax = amount - taxableAmount;
  } else {
    totalTax = (amount * taxRatePercent) / 100;
  }

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isInterState) {
    igstAmount = totalTax;
  } else {
    cgstAmount = totalTax / 2;
    sgstAmount = totalTax / 2;
  }

  const grossAmount = isInclusive ? amount : taxableAmount + totalTax;

  return {
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    igstAmount: Math.round(igstAmount * 100) / 100,
    grossAmount: Math.round(grossAmount * 100) / 100,
  };
}
