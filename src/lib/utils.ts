import { LineItem } from './types';

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    amount = 0;
  }
  const absAmount = Math.abs(amount);

  // Use fixed decimals for very large numbers to prevent overflow
  if (absAmount >= 1000000) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyShort(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    amount = 0;
  }
  return amount.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function calculateLineTotal(line: LineItem): { totalHT: number; totalTTC: number } {
  const totalHT = Math.round(line.quantity * line.unitPrice * 100) / 100;
  const totalTTC = Math.round(totalHT * (1 + line.tvaRate / 100) * 100) / 100;
  return { totalHT, totalTTC };
}

export function calculateDevisTotal(lines: LineItem[], discountPercent: number): {
  totalHT: number;
  totalTTC: number;
  totalTVA: number;
  discountAmount: number;
} {
  let totalHT = 0;
  let totalTTC = 0;

  lines.forEach(line => {
    totalHT += line.totalHT;
    totalTTC += line.totalTTC;
  });

  const discountAmount = Math.round(totalHT * (discountPercent / 100) * 100) / 100;
  const afterDiscount = totalHT - discountAmount;
  const totalTVA = totalTTC - totalHT;

  return {
    totalHT: afterDiscount,
    totalTTC: afterDiscount * (1 + 20 / 100) + totalTVA * (1 - discountPercent / 100),
    totalTVA: Math.round(totalTVA * (1 - discountPercent / 100) * 100) / 100,
    discountAmount,
  };
}

export function generateLineId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function createEmptyLine(): LineItem {
  return {
    id: generateLineId(),
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    unit: 'forfait',
    tvaRate: 20,
    totalHT: 0,
    totalTTC: 0,
  };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}