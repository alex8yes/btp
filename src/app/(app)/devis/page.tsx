'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { store } from '@/lib/store';
import { Devis, Client } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, FileText, ArrowRight } from 'lucide-react';

export default function DevisPage() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setDevis(store.getDevis());
    setClients(store.getClients());
  }, []);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Client inconnu';
  };

  const getTotal = (lines: { totalTTC: number }[]) => {
    return lines.reduce((sum, line) => sum + line.totalTTC, 0);
  };

  const filteredDevis = devis.filter(d =>
    (statusFilter === '' || d.status === statusFilter) &&
    (getClientName(d.clientId).toLowerCase().includes(search.toLowerCase()) ||
     d.number.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const columns = [
    {
      key: 'number',
      label: 'N° Devis',
      render: (d: Devis) => <span className="font-mono font-medium">{d.number}</span>,
    },
    { key: 'client', label: 'Client', render: (d: Devis) => getClientName(d.clientId) },
    { key: 'date', label: 'Date', render: (d: Devis) => formatDate(d.date) },
    {
      key: 'total',
      label: 'Montant TTC',
      render: (d: Devis) => <span className="font-mono font-medium">{formatCurrency(getTotal(d.lines))}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (d: Devis) => <StatusBadge status={d.status} type="devis" />,
    },
    { key: 'validUntil', label: 'Valide jusqu\'au', render: (d: Devis) => formatDate(d.validUntil) },
    {
      key: 'actions',
      label: '',
      render: (d: Devis) => (
        <Link
          href={`/devis/${d.id}`}
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
      <Header title="Devis" />

      <div className="p-8 animate-in">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Rechercher un devis..."
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
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="refused">Refusé</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
            <Link href="/devis/new">
              <Button>
                <Plus className="w-4 h-4" />
                Nouveau devis
              </Button>
            </Link>
          </div>

          {filteredDevis.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-[var(--text-secondary)]/40 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-4">
                {devis.length === 0 ? 'Aucun devis pour le moment' : 'Aucun résultat pour cette recherche'}
              </p>
              {devis.length === 0 && (
                <Link href="/devis/new">
                  <Button>
                    <Plus className="w-4 h-4" />
                    Créer mon premier devis
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table
              data={filteredDevis}
              columns={columns}
              keyField="id"
              onRowClick={(d) => window.location.href = `/devis/${d.id}`}
            />
          )}
        </Card>
      </div>
    </>
  );
}