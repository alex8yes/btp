'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { store } from '@/lib/store';
import { Facture, Client, FactureStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Edit, Trash2, FileText, DollarSign, Check } from 'lucide-react';
import Link from 'next/link';
import { generateFacturePDF } from '@/lib/pdf';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FactureDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [facture, setFacture] = useState<Facture | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    const factureData = store.getFactureById(id);
    if (factureData) {
      setFacture(factureData);
      const clientData = store.getClient(factureData.clientId);
      setClient(clientData || null);
    }
  }, [id]);

  const updateStatus = (status: FactureStatus) => {
    if (facture) {
      store.saveFacture({ id: facture.id, status });
      setFacture({ ...facture, status });
    }
  };

  const recordPayment = () => {
    if (facture) {
      const newPaidAmount = (facture.paidAmount || 0) + paymentAmount;
      const total = getTotal();
      let newStatus: FactureStatus = 'partial';

      if (newPaidAmount >= total) {
        newStatus = 'paid';
      }

      store.saveFacture({
        id: facture.id,
        paidAmount: newPaidAmount,
        status: newStatus,
      });

      setFacture({ ...facture, paidAmount: newPaidAmount, status: newStatus });
      setIsPaymentModalOpen(false);
      setPaymentAmount(0);
    }
  };

  const exportPDF = () => {
    if (facture) {
      const settings = store.getSettings();
      const pdf = generateFacturePDF(facture, client || undefined, settings as any);
      pdf.save(`${facture.number}.pdf`);
    }
  };

  const deleteFacture = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      store.deleteFacture(id);
      router.push('/factures');
    }
  };

  const getTotal = () => {
    if (!facture) return 0;
    return facture.lines.reduce((sum, line) => sum + line.totalTTC, 0);
  };

  const getSubtotal = () => {
    if (!facture) return 0;
    return facture.lines.reduce((sum, line) => sum + line.totalHT, 0);
  };

  const getDiscount = () => {
    if (!facture) return 0;
    return getSubtotal() * (facture.discountPercent / 100);
  };

  const getTVA = () => {
    if (!facture) return 0;
    const totalTVA = facture.lines.reduce((sum, line) => sum + (line.totalTTC - line.totalHT), 0);
    return totalTVA * (1 - facture.discountPercent / 100);
  };

  if (!facture) {
    return (
      <>
        <Header title="Facture" />
        <div className="p-8">
          <p className="text-[var(--text-secondary)]">Facture non trouvée.</p>
        </div>
      </>
    );
  }

  const total = getTotal();
  const remaining = total - (facture.paidAmount || 0);

  return (
    <>
      <Header title={`Facture ${facture.number}`} />

      <div className="p-8 animate-in max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6">
          <Link href="/factures" className="hover:text-[var(--accent)]">Factures</Link>
          <span>/</span>
          <span>{facture.number}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <StatusBadge status={facture.status} type="facture" />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={exportPDF}>
              <FileText className="w-4 h-4" />
              Exporter PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsPaymentModalOpen(true)}>
              <DollarSign className="w-4 h-4" />
              Enregistrer un paiement
            </Button>
            <Button variant="danger" size="sm" onClick={deleteFacture}>
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
                  <p className="text-sm text-[var(--text-secondary)]">Date d'émission</p>
                  <p className="font-medium">{formatDate(facture.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Date d'échéance</p>
                  <p className="font-medium">{formatDate(facture.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Payé</p>
                  <p className="font-medium">{formatCurrency(facture.paidAmount || 0)} / {formatCurrency(total)}</p>
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
                    {facture.lines.map((line, index) => (
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
                  {facture.discountPercent > 0 && (
                    <div className="flex justify-between text-sm text-[var(--success)]">
                      <span>Remise ({facture.discountPercent}%)</span>
                      <span className="font-mono">-{formatCurrency(getDiscount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">TVA</span>
                    <span className="font-mono">{formatCurrency(getTVA())}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-[var(--border)] pt-2">
                    <span>Total TTC</span>
                    <span className="font-mono text-[var(--accent)]">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {facture.notes && (
              <Card>
                <CardTitle className="mb-4">Notes</CardTitle>
                <p className="text-sm whitespace-pre-wrap">{facture.notes}</p>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardTitle className="mb-4">Actions</CardTitle>
              <div className="space-y-3">
                {facture.status !== 'paid' && (
                  <Button className="w-full" onClick={() => updateStatus('paid')}>
                    <Check className="w-4 h-4" />
                    Marquer comme payée
                  </Button>
                )}
                {facture.status === 'paid' && (
                  <Button variant="secondary" className="w-full" onClick={() => updateStatus('unpaid')}>
                    Annuler le paiement
                  </Button>
                )}
                <Button variant="secondary" className="w-full" onClick={exportPDF}>
                  <FileText className="w-4 h-4" />
                  Exporter en PDF
                </Button>
              </div>
            </Card>

            <Card>
              <CardTitle className="mb-4">Paiement</CardTitle>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Total</span>
                  <span className="font-mono font-medium">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Payé</span>
                  <span className="font-mono text-[var(--success)]">{formatCurrency(facture.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--border)] pt-2">
                  <span className="text-sm font-medium">Reste à payer</span>
                  <span className="font-mono font-bold text-[var(--accent)]">{formatCurrency(remaining)}</span>
                </div>
              </div>

              {remaining > 0 && (
                <Button
                  className="w-full mt-4"
                  size="sm"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <DollarSign className="w-4 h-4" />
                  Enregistrer un paiement
                </Button>
              )}
            </Card>

            <Card>
              <CardTitle className="mb-4">Statut</CardTitle>
              <div className="space-y-2">
                {(['unpaid', 'partial', 'paid'] as FactureStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      facture.status === status
                        ? 'bg-[var(--accent)] text-white'
                        : 'hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {status === 'unpaid' && 'Non payée'}
                    {status === 'partial' && 'Partiellement payée'}
                    {status === 'paid' && 'Payée'}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Enregistrer un paiement"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Montant restant à payer: <strong>{formatCurrency(remaining)}</strong>
          </p>
          <Input
            label="Montant"
            type="number"
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={recordPayment}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}