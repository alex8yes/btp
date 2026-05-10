'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { store } from '@/lib/store';
import { Devis, Client, DevisStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Edit, Trash2, Send, FileText, Receipt, Copy, Check, X } from 'lucide-react';
import Link from 'next/link';
import { generateDevisPDF } from '@/lib/pdf';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DevisDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [devis, setDevis] = useState<Devis | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const devisData = store.getDevisById(id);
    if (devisData) {
      setDevis(devisData);
      const clientData = store.getClient(devisData.clientId);
      setClient(clientData || null);
    }
  }, [id]);

  const updateStatus = (status: DevisStatus) => {
    if (devis) {
      store.saveDevis({ id: devis.id, status });
      setDevis({ ...devis, status });
    }
  };

  const duplicateDevis = () => {
    if (devis) {
      const copy = store.saveDevis({
        clientId: devis.clientId,
        date: new Date().toISOString().split('T')[0],
        validUntil: devis.validUntil,
        lines: devis.lines,
        discountPercent: devis.discountPercent,
        notes: devis.notes,
        paymentConditions: devis.paymentConditions,
      });
      router.push(`/devis/${copy.id}`);
    }
  };

  const createFacture = () => {
    if (devis) {
      const facture = store.saveFacture({
        devisId: devis.id,
        clientId: devis.clientId,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lines: devis.lines,
        discountPercent: devis.discountPercent,
        notes: devis.notes,
      });
      store.saveDevis({ id: devis.id, status: 'accepted' });
      router.push(`/factures/${facture.id}`);
    }
  };

  const exportPDF = () => {
    if (devis) {
      const settings = store.getSettings();
      const pdf = generateDevisPDF(devis, client || undefined, settings as any);
      pdf.save(`${devis.number}.pdf`);
    }
  };

  const deleteDevis = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      store.deleteDevis(id);
      router.push('/devis');
    }
  };

  const getTotal = () => {
    if (!devis) return 0;
    return devis.lines.reduce((sum, line) => sum + line.totalTTC, 0);
  };

  const getSubtotal = () => {
    if (!devis) return 0;
    return devis.lines.reduce((sum, line) => sum + line.totalHT, 0);
  };

  const getDiscount = () => {
    if (!devis) return 0;
    return getSubtotal() * (devis.discountPercent / 100);
  };

  const getTVA = () => {
    if (!devis) return 0;
    const totalTVA = devis.lines.reduce((sum, line) => sum + (line.totalTTC - line.totalHT), 0);
    return totalTVA * (1 - devis.discountPercent / 100);
  };

  if (!devis) {
    return (
      <>
        <Header title="Devis" />
        <div className="p-8">
          <p className="text-[var(--text-secondary)]">Devis non trouvé.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`Devis ${devis.number}`} />

      <div className="p-8 animate-in max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6">
          <Link href="/devis" className="hover:text-[var(--accent)]">Devis</Link>
          <span>/</span>
          <span>{devis.number}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <StatusBadge status={devis.status} type="devis" />
          <div className="flex gap-2">
            <Link href={`/devis/new?edit=${devis.id}`}>
              <Button variant="secondary" size="sm">
                <Edit className="w-4 h-4" />
                Modifier
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={exportPDF}>
              <FileText className="w-4 h-4" />
              Exporter PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={duplicateDevis}>
              <Copy className="w-4 h-4" />
              Dupliquer
            </Button>
            <Button variant="secondary" size="sm" onClick={deleteDevis}>
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardTitle className="mb-4">Informations</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Client</p>
                  <p className="font-medium">{client?.name || 'Client inconnu'}</p>
                  {client && (
                    <p className="text-sm text-[var(--text-secondary)]">
                      {client.address && `${client.address}, `}
                      {client.postalCode} {client.city}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Date</p>
                  <p className="font-medium">{formatDate(devis.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Valide jusqu'au</p>
                  <p className="font-medium">{formatDate(devis.validUntil)}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Conditions</p>
                  <p className="font-medium">{devis.paymentConditions || '-'}</p>
                </div>
              </div>
            </Card>

            <Card>
              <CardTitle className="mb-4">Lignes</CardTitle>
              <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[var(--bg-secondary)]">
                    <tr>
                      <th className="text-left text-xs font-medium uppercase text-[var(--text-secondary)] p-3">Description</th>
                      <th className="text-right text-xs font-medium uppercase text-[var(--text-secondary)] p-3 w-20">Qté</th>
                      <th className="text-right text-xs font-medium uppercase text-[var(--text-secondary)] p-3 w-28">Prix HT</th>
                      <th className="text-right text-xs font-medium uppercase text-[var(--text-secondary)] p-3 w-20">TVA</th>
                      <th className="text-right text-xs font-medium uppercase text-[var(--text-secondary)] p-3 w-28">Total TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devis.lines.map((line, index) => (
                      <tr key={index} className="border-t border-[var(--border)]">
                        <td className="p-3">
                          <p className="font-medium">{line.name}</p>
                          {line.description && <p className="text-sm text-[var(--text-secondary)]">{line.description}</p>}
                        </td>
                        <td className="p-3 text-right font-mono">{line.quantity}</td>
                        <td className="p-3 text-right font-mono">{formatCurrency(line.unitPrice)}</td>
                        <td className="p-3 text-right font-mono">{line.tvaRate}%</td>
                        <td className="p-3 text-right font-mono font-medium">{formatCurrency(line.totalTTC)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Sous-total HT</span>
                    <span className="font-mono">{formatCurrency(getSubtotal())}</span>
                  </div>
                  {devis.discountPercent > 0 && (
                    <div className="flex justify-between text-sm text-[var(--success)]">
                      <span>Remise ({devis.discountPercent}%)</span>
                      <span className="font-mono">-{formatCurrency(getDiscount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">TVA</span>
                    <span className="font-mono">{formatCurrency(getTVA())}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-[var(--border)] pt-2">
                    <span>Total TTC</span>
                    <span className="font-mono text-[var(--accent)]">{formatCurrency(getTotal())}</span>
                  </div>
                </div>
              </div>
            </Card>

            {devis.notes && (
              <Card>
                <CardTitle className="mb-4">Notes</CardTitle>
                <p className="text-sm whitespace-pre-wrap">{devis.notes}</p>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardTitle className="mb-4">Actions</CardTitle>
              <div className="space-y-3">
                {devis.status === 'draft' && (
                  <Button className="w-full" onClick={() => updateStatus('sent')}>
                    <Send className="w-4 h-4" />
                    Marquer comme envoyé
                  </Button>
                )}
                {(devis.status === 'sent' || devis.status === 'draft') && (
                  <>
                    <Button variant="secondary" className="w-full" onClick={() => updateStatus('accepted')}>
                      <Check className="w-4 h-4" />
                      Accepter
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => updateStatus('refused')}>
                      <X className="w-4 h-4" />
                      Refuser
                    </Button>
                  </>
                )}
                {devis.status === 'accepted' && (
                  <Button className="w-full" onClick={createFacture}>
                    <Receipt className="w-4 h-4" />
                    Créer une facture
                  </Button>
                )}
                <Button variant="secondary" className="w-full" onClick={exportPDF}>
                  <FileText className="w-4 h-4" />
                  Exporter en PDF
                </Button>
              </div>
            </Card>

            <Card>
              <CardTitle className="mb-4">Statut du devis</CardTitle>
              <div className="space-y-2">
                {(['draft', 'sent', 'accepted', 'refused', 'expired'] as DevisStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      devis.status === status
                        ? 'bg-[var(--accent)] text-white'
                        : 'hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {status === 'draft' && 'Brouillon'}
                    {status === 'sent' && 'Envoyé'}
                    {status === 'accepted' && 'Accepté'}
                    {status === 'refused' && 'Refusé'}
                    {status === 'expired' && 'Expiré'}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}