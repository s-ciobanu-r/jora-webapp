import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = 'ro-RO'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Handle invalid dates
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date, locale: string = 'ro-RO'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Handle invalid dates
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date, locale: string = 'ro-RO'): string {
  const dateStr = formatDate(date, locale);
  const timeStr = formatTime(date, locale);
  
  if (!dateStr) return '';
  return `${dateStr} ${timeStr}`;
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
