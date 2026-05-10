'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/ui/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { store } from '@/lib/store';
import { Devis, Facture, Client } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, Receipt, Users, TrendingUp, Plus, ArrowRight } from 'lucide-react';

interface Stats {
  devisEnAttente: number;
  facturesImpayees: number;
  caMois: number;
  clientsTotal: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    devisEnAttente: 0,
    facturesImpayees: 0,
    caMois: 0,
    clientsTotal: 0,
  });
  const [recentDevis, setRecentDevis] = useState<Devis[]>([]);
  const [recentFactures, setRecentFactures] = useState<Facture[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const devisList = store.getDevis();
    const facturesList = store.getFactures();
    const clientsList = store.getClients();

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    setStats({
      devisEnAttente: devisList.filter(d => d.status === 'sent' || d.status === 'draft').length,
      facturesImpayees: facturesList.filter(f => f.status !== 'paid').length,
      caMois: facturesList
        .filter(f => f.status === 'paid' && new Date(f.date) >= firstOfMonth)
        .reduce((sum, f) => {
          return sum + f.lines.reduce((lineSum, line) => lineSum + line.totalTTC, 0);
        }, 0),
      clientsTotal: clientsList.length,
    });

    setRecentDevis(devisList.slice(-5).reverse());
    setRecentFactures(facturesList.slice(-5).reverse());
    setClients(clientsList);
  }, []);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Client inconnu';
  };

  const getTotal = (lines: { totalTTC: number }[]) => {
    return lines.reduce((sum, line) => sum + line.totalTTC, 0);
  };

  return (
    <>
      <Header title="Tableau de bord" />

      <div className="p-8 animate-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-[var(--accent)]/10 rounded-lg">
              <FileText className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-[Outfit]">{stats.devisEnAttente}</p>
              <p className="text-sm text-[var(--text-secondary)]">Devis en attente</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="p-3 bg-[var(--warning)]/10 rounded-lg">
              <Receipt className="w-6 h-6 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-[Outfit]">{stats.facturesImpayees}</p>
              <p className="text-sm text-[var(--text-secondary)]">Factures impayées</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="p-3 bg-[var(--success)]/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-3xl font-bold font-[Outfit]">{formatCurrency(stats.caMois)}</p>
              <p className="text-sm text-[var(--text-secondary)]">CA du mois</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold font-[Outfit]">{stats.clientsTotal}</p>
              <p className="text-sm text-[var(--text-secondary)]">Clients</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardTitle className="mb-4">Actions rapides</CardTitle>
          <div className="flex flex-wrap gap-3">
            <Link href="/devis/new">
              <Button>
                <Plus className="w-4 h-4" />
                Nouveau devis
              </Button>
            </Link>
            <Link href="/clients">
              <Button variant="secondary">
                <Users className="w-4 h-4" />
                Nouveau client
              </Button>
            </Link>
            <Link href="/factures/new">
              <Button variant="secondary">
                <Receipt className="w-4 h-4" />
                Nouvelle facture
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Derniers devis</CardTitle>
              <Link href="/devis" className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recentDevis.length === 0 ? (
              <p className="text-[var(--text-secondary)] py-8 text-center">
                Aucun devis pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {recentDevis.map(devis => (
                  <Link
                    key={devis.id}
                    href={`/devis/${devis.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <div>
                      <p className="font-medium font-mono">{devis.number}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{getClientName(devis.clientId)}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={devis.status} type="devis" />
                      <p className="text-sm font-mono mt-1">{formatCurrency(getTotal(devis.lines))}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Dernières factures</CardTitle>
              <Link href="/factures" className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recentFactures.length === 0 ? (
              <p className="text-[var(--text-secondary)] py-8 text-center">
                Aucune facture pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {recentFactures.map(facture => (
                  <Link
                    key={facture.id}
                    href={`/factures/${facture.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <div>
                      <p className="font-medium font-mono">{facture.number}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{getClientName(facture.clientId)}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={facture.status} type="facture" />
                      <p className="text-sm font-mono mt-1">{formatCurrency(getTotal(facture.lines))}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}