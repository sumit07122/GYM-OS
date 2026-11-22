// Indian Date & Time Formatting Utilities (Asia/Kolkata default)

import { format, parseISO, isValid, differenceInDays } from 'date-fns';

/**
 * Formats date string or object to Indian DD/MM/YYYY
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '-';
  return format(parsed, 'dd/MM/yyyy');
}

/**
 * Formats timestamp to DD/MM/YYYY, hh:mm a
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '-';
  return format(parsed, 'dd/MM/yyyy, hh:mm a');
}

/**
 * Returns human-readable remaining days or expiry status
 */
export function getExpiryStatus(endDate: string | Date): {
  daysLeft: number;
  label: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
} {
  const parsed = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysLeft = differenceInDays(parsed, today);
  const isExpired = daysLeft < 0;
  const isExpiringSoon = daysLeft >= 0 && daysLeft <= 7;

  let label = `${daysLeft} days left`;
  if (daysLeft === 0) label = 'Expires today';
  else if (daysLeft === 1) label = '1 day left';
  else if (daysLeft < 0) label = `Expired ${Math.abs(daysLeft)} days ago`;

  return { daysLeft, label, isExpired, isExpiringSoon };
}
