import { describe, it, expect } from 'vitest';
import {
  formatWhatsAppPhone,
  generateWhatsAppReceiptUrl,
  generateWhatsAppReminderUrl,
} from '@/lib/communications/whatsapp';

describe('WhatsApp Communication Engine', () => {
  it('formats 10-digit Indian mobile numbers with country code 91', () => {
    expect(formatWhatsAppPhone('9820198201')).toBe('919820198201');
    expect(formatWhatsAppPhone('+91 98201 98201')).toBe('919820198201');
    expect(formatWhatsAppPhone('09820198201')).toBe('919820198201');
  });

  it('generates a valid WhatsApp receipt link with pre-filled message text', () => {
    const url = generateWhatsAppReceiptUrl({
      phone: '9820198201',
      memberName: 'Aarav Mehta',
      gymName: 'Olympia Fitness Club',
      invoiceNumber: 'OLY-2026-0001',
      amount: 15000,
      paymentMethod: 'UPI',
    });

    expect(url).toContain('https://wa.me/919820198201?text=');
    expect(url).toContain(encodeURIComponent('OLY-2026-0001'));
    expect(url).toContain(encodeURIComponent('₹15,000'));
    expect(url).toContain(encodeURIComponent('Olympia Fitness Club'));
  });

  it('generates a valid WhatsApp dues reminder link', () => {
    const url = generateWhatsAppReminderUrl({
      phone: '9820198201',
      memberName: 'Aarav Mehta',
      gymName: 'Olympia Fitness Club',
      balanceDue: 5000,
      dueDate: '2026-12-01',
    });

    expect(url).toContain('https://wa.me/919820198201?text=');
    expect(url).toContain(encodeURIComponent('₹5,000'));
    expect(url).toContain(encodeURIComponent('2026-12-01'));
  });
});
