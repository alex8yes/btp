'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function Table<T>({
  data,
  columns,
  keyField,
  onRowClick,
  emptyMessage = 'Aucun élément',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-secondary)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {columns.map(col => (
              <th
                key={col.key}
                className={cn(
                  'text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider py-3 px-4',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={cn(
                'border-b border-[var(--border)] last:border-0',
                onRowClick && 'cursor-pointer hover:bg-[var(--bg-secondary)]/50 transition-colors'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map(col => (
                <td key={col.key} className={cn('py-4 px-4 text-sm', col.className)}>
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}