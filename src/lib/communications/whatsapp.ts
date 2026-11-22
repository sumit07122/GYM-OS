// WhatsApp Communication & Deep Linking Engine for GymOS
import { formatINR } from '@/lib/formatting/currency';

/**
 * Normalizes Indian mobile numbers into international wa.me format (e.g. 919820198201)
 */
export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

export interface WhatsAppReceiptOptions {
  phone: string;
  memberName: string;
  gymName: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: string;
}

/**
 * Generates 1-click WhatsApp web/mobile link with formatted payment receipt message
 */
export function generateWhatsAppReceiptUrl(options: WhatsAppReceiptOptions): string {
  const { phone, memberName, gymName, invoiceNumber, amount, paymentMethod } = options;
  const targetPhone = formatWhatsAppPhone(phone);
  const formattedAmount = formatINR(amount);

  const message = [
    `*TAX INVOICE & RECEIPT — ${gymName}*`,
    ``,
    `Dear ${memberName},`,
    `Thank you for your payment! Here are your transaction details:`,
    ``,
    `📄 *Invoice No:* ${invoiceNumber}`,
    `💰 *Amount Paid:* ${formattedAmount}`,
    `💳 *Payment Method:* ${paymentMethod.toUpperCase()}`,
    `✅ *Status:* Confirmed & Active`,
    ``,
    `View your digital member pass and workout plans anytime on GymOS.`,
    `Stay fit, stay strong! 💪`,
  ].join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export interface WhatsAppReminderOptions {
  phone: string;
  memberName: string;
  gymName: string;
  balanceDue: number;
  dueDate?: string;
}

/**
 * Generates 1-click WhatsApp payment dues reminder link
 */
export function generateWhatsAppReminderUrl(options: WhatsAppReminderOptions): string {
  const { phone, memberName, gymName, balanceDue, dueDate } = options;
  const targetPhone = formatWhatsAppPhone(phone);
  const formattedDue = formatINR(balanceDue);

  const message = [
    `*PAYMENT REMINDER — ${gymName}*`,
    ``,
    `Dear ${memberName},`,
    `This is a gentle reminder regarding your outstanding gym membership balance:`,
    ``,
    `⚠️ *Outstanding Balance:* ${formattedDue}`,
    dueDate ? `📅 *Due Date:* ${dueDate}` : '',
    ``,
    `You can clear your dues via UPI or at the front desk.`,
    `Thank you for being a valued member of ${gymName}!`,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
