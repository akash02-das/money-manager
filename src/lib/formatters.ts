import { format, parseISO, isValid } from 'date-fns';
import type { CurrencyCode } from '@/types/finance';

/**
 * Currency symbol mapping with fallback
 */
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Format a numeric amount into local currency string.
 * Formats BDT with Indian/Bangladeshi numbering system (e.g., ৳ 1,25,000.00).
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'BDT',
  options?: {
    showSign?: boolean;
    hideDecimals?: boolean;
  }
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const symbol = CURRENCY_SYMBOLS[currency] || '৳';

  const minimumFractionDigits = options?.hideDecimals ? 0 : 2;
  const maximumFractionDigits = options?.hideDecimals ? 0 : 2;

  // Use en-IN for South Asian grouping (lakhs/crores) which is standard in Bangladesh
  const locale = currency === 'BDT' ? 'en-IN' : 'en-US';

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(absAmount);

  let prefix = '';
  if (options?.showSign) {
    prefix = isNegative ? '- ' : '+ ';
  } else if (isNegative) {
    prefix = '- ';
  }

  return `${prefix}${symbol} ${formattedNumber}`;
}

/**
 * Format date string (ISO) into human-readable format.
 * e.g., "24 Oct 2026", "24 Oct 2026, 04:30 PM"
 */
export function formatDate(
  dateString: string,
  formatPattern: string = 'dd MMM yyyy'
): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, formatPattern);
  } catch {
    return dateString;
  }
}

/**
 * Format percentage value (e.g., 18.5 -> "+18.5%" or "-4.2%")
 */
export function formatPercentage(value: number, includeSign: boolean = true): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
