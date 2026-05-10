'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { DevisStatus, FactureStatus, DEVIS_STATUS_LABELS, FACTURE_STATUS_LABELS } from '@/lib/types';

type BadgeVariant = DevisStatus | FactureStatus | 'default' | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variants = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  refused: 'bg-red-100 text-red-700',
  expired: 'bg-red-100 text-red-700',
  unpaid: 'bg-orange-100 text-orange-700',
  partial: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  default: 'bg-gray-100 text-gray-700',
  accent: 'bg-[var(--accent)]/10 text-[var(--accent)]',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide',
        variants[variant] || variants.default
      )}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: DevisStatus | FactureStatus;
  type: 'devis' | 'facture';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const labels = type === 'devis'
    ? DEVIS_STATUS_LABELS as Record<string, string>
    : FACTURE_STATUS_LABELS as Record<string, string>;
  return <Badge variant={status}>{labels[status]}</Badge>;
}