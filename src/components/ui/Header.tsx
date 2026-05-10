'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-semibold font-[Outfit] text-[var(--text-primary)]">
        {title}
      </h1>
    </div>
  );
}