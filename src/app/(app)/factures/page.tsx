'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { store } from '@/lib/store';
import { Facture, Client } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Receipt, ArrowRight } from 'lucide-react';

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setFactures(store.getFactures());
    setClients(store.getClients());
  }, []);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Client inconnu';
  };

  const getTotal = (lines: { totalTTC: number }[]) => {
    return lines.reduce((sum, line) => sum + line.totalTTC, 0);
  };

  const filteredFactures = factures.filter(f =>
    (statusFilter === '' || f.status === statusFilter) &&
    (getClientName(f.clientId).toLowerCase().includes(search.toLowerCase()) ||
     f.number.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const columns = [
    {
      key: 'number',
      label: 'N° Facture',
      render: (f: Facture) => <span className="font-mono font-medium">{f.number}</span>,
    },
    { key: 'client', label: 'Client', render: (f: Facture) => getClientName(f.clientId) },
    { key: 'date', label: 'Date', render: (f: Facture) => formatDate(f.date) },
    { key: 'dueDate', label: 'Échéance', render: (f: Facture) => formatDate(f.dueDate) },
    {
      key: 'total',
      label: 'Montant TTC',
      render: (f: Facture) => <span className="font-mono font-medium">{formatCurrency(getTotal(f.lines))}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (f: Facture) => <StatusBadge status={f.status} type="facture" />,
    },
    {
      key: 'actions',
      label: '',
      render: (f: Facture) => (
        <Link
          href={`/factures/${f.id}`}
          className="flex items-center justify-end gap-1 text-sm text-[var(--accent)] hover:underline"
        >
          Voir <ArrowRight className="w-4 h-4" />
        </Link>
      ),
      className: 'w-20',
    },
  ];

  return (
    <>
      <Header title="Factures" />

      <div className="p-8 animate-in">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Rechercher une facture..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                <option value="unpaid">Non payée</option>
                <option value="partial">Partiellement payée</option>
                <option value="paid">Payée</option>
              </select>
            </div>
            <Link href="/factures/new">
              <Button>
                <Plus className="w-4 h-4" />
                Nouvelle facture
              </Button>
            </Link>
          </div>

          {filteredFactures.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="w-12 h-12 text-[var(--text-secondary)]/40 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-4">
                {factures.length === 0 ? 'Aucune facture pour le moment' : 'Aucun résultat pour cette recherche'}
              </p>
              {factures.length === 0 && (
                <Link href="/factures/new">
                  <Button>
                    <Plus className="w-4 h-4" />
                    Créer ma première facture
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table
              data={filteredFactures}
              columns={columns}
              keyField="id"
              onRowClick={(f) => window.location.href = `/factures/${f.id}`}
            />
          )}
        </Card>
      </div>
    </>
  );
}