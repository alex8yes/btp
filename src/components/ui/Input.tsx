'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-10 px-3 rounded-md border border-[var(--border)] bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60',
          'focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]',
          'transition-colors duration-150',
          error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'min-h-[100px] px-3 py-2 rounded-md border border-[var(--border)] bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 resize-y',
          'focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]',
          'transition-colors duration-150',
          error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'h-10 px-3 rounded-md border border-[var(--border)] bg-white text-[var(--text-primary)]',
          'focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]',
          'transition-colors duration-150 cursor-pointer',
          error && 'border-[var(--danger)]',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </div>
  );
}