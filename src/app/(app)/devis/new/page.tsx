'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { store } from '@/lib/store';
import { Client, ClientType, CatalogueItem, LineItem, DevisStatus, TVARate } from '@/lib/types';
import { formatCurrency, generateLineId, calculateLineTotal } from '@/lib/utils';
import { Plus, Trash2, Save, Send, Copy, ChevronRight, ChevronLeft, User, Calendar, ListChecks, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { generateDevisPDF } from '@/lib/pdf';

interface DevisFormProps {
  devisId?: string;
}

const STEPS = [
  { id: 1, label: 'Client', icon: User },
  { id: 2, label: 'Dates', icon: Calendar },
  { id: 3, label: 'Prestations', icon: ListChecks },
  { id: 4, label: 'Options', icon: FileText },
];

export default function NewDevisPage({ devisId }: DevisFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [settings, setSettings] = useState({ name: '', address: '', postalCode: '', city: '', email: '', phone: '', siret: '', defaultTVA: 20, legalMentions: '' });

  // Client form state
  const [newClientData, setNewClientData] = useState({
    name: '',
    type: 'particulier' as ClientType,
    address: '',
    postalCode: '',
    city: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [formData, setFormData] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    status: 'draft' as DevisStatus,
    discountPercent: 0,
    notes: '',
    paymentConditions: '',
  });

  const [lines, setLines] = useState<LineItem[]>([]);

  useEffect(() => {
    setSettings(store.getSettings());
    setClients(store.getClients());
    setCatalogue(store.getCatalogue());

    if (devisId) {
      const existingDevis = store.getDevisById(devisId);
      if (existingDevis) {
        setFormData({
          clientId: existingDevis.clientId,
          date: existingDevis.date,
          validUntil: existingDevis.validUntil,
          status: existingDevis.status,
          discountPercent: existingDevis.discountPercent,
          notes: existingDevis.notes,
          paymentConditions: existingDevis.paymentConditions,
        });
        setLines(existingDevis.lines);
      }
    }
  }, [devisId]);

  const handleCreateClient = () => {
    const savedClient = store.saveClient(newClientData);
    setClients(store.getClients());
    setFormData({ ...formData, clientId: savedClient.id });
    setNewClientData({
      name: '',
      type: 'particulier',
      address: '',
      postalCode: '',
      city: '',
      email: '',
      phone: '',
      notes: '',
    });
    setIsClientModalOpen(false);
  };

  const addLine = () => {
    const newLine: LineItem = {
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
    setLines([...lines, newLine]);
  };

  const addFromCatalogue = (item: CatalogueItem) => {
    const newLine: LineItem = {
      id: generateLineId(),
      catalogueItemId: item.id,
      name: item.name,
      description: item.description,
      quantity: 1,
      unitPrice: item.unitPrice,
      unit: item.unit,
      tvaRate: 20,
      totalHT: item.unitPrice,
      totalTTC: item.unitPrice * 1.2,
    };
    setLines([...lines, newLine]);
  };

  const updateLine = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedLines = [...lines];
    const line = { ...updatedLines[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice' || field === 'tvaRate') {
      const totals = calculateLineTotal({
        ...line,
        quantity: field === 'quantity' ? (value as number) : line.quantity,
        unitPrice: field === 'unitPrice' ? (value as number) : line.unitPrice,
        tvaRate: field === 'tvaRate' ? (value as TVARate) : line.tvaRate,
      });
      line.totalHT = totals.totalHT;
      line.totalTTC = totals.totalTTC;
    }

    updatedLines[index] = line;
    setLines(updatedLines);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    let totalHT = 0;
    let totalTVA = 0;
    let totalTTC = 0;

    lines.forEach(line => {
      totalHT += line.totalHT;
      totalTVA += line.totalTTC - line.totalHT;
      totalTTC += line.totalTTC;
    });

    const discountAmount = totalHT * (formData.discountPercent / 100);
    const afterDiscount = totalHT - discountAmount;
    const tvaAfterDiscount = totalTVA * (1 - formData.discountPercent / 100);

    return {
      totalHT: afterDiscount,
      totalTVA: tvaAfterDiscount,
      totalTTC: afterDiscount + tvaAfterDiscount,
      discountAmount,
    };
  };

  const handleSave = (sendStatus?: boolean) => {
    const devisData = {
      ...(devisId ? { id: devisId } : {}),
      clientId: formData.clientId,
      date: formData.date,
      validUntil: formData.validUntil,
      status: sendStatus ? 'sent' : (formData.status as DevisStatus),
      lines,
      discountPercent: formData.discountPercent,
      notes: formData.notes,
      paymentConditions: formData.paymentConditions,
      ...(sendStatus ? { sentAt: new Date().toISOString() } : {}),
    };

    const saved = store.saveDevis(devisData);
    router.push(`/devis/${saved.id}`);
  };

  const handleSaveAndExportPDF = () => {
    const devisData = {
      ...(devisId ? { id: devisId } : {}),
      clientId: formData.clientId,
      date: formData.date,
      validUntil: formData.validUntil,
      status: 'draft' as DevisStatus,
      lines,
      discountPercent: formData.discountPercent,
      notes: formData.notes,
      paymentConditions: formData.paymentConditions,
    };

    const saved = store.saveDevis(devisData);
    const client = clients.find(c => c.id === formData.clientId);
    const pdf = generateDevisPDF(saved, client, settings as any);
    pdf.save(`${saved.number}.pdf`);
    router.push(`/devis/${saved.id}`);
  };

  const totals = calculateTotal();
  const canGoNext = currentStep === 1 ? !!formData.clientId : true;
  const isLastStep = currentStep === 4;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold font-[Outfit]">Sélection du client</h2>
              <Button variant="secondary" size="sm" onClick={() => setIsClientModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Nouveau client
              </Button>
            </div>

            <Select
              label="Client"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              options={[
                { value: '', label: '-- Choisir un client --' },
                ...clients.map(c => ({ value: c.id, label: c.name }))
              ]}
            />

            {formData.clientId && (
              <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
                {(() => {
                  const client = clients.find(c => c.id === formData.clientId);
                  if (!client) return null;
                  return (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--text-secondary)]">Nom</p>
                        <p className="font-medium">{client.name}</p>
                      </div>
                      <div>
                        <p className="text-[var(--text-secondary)]">Type</p>
                        <p className="font-medium">{client.type === 'professionnel' ? 'Professionnel' : 'Particulier'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--text-secondary)]">Email</p>
                        <p className="font-medium">{client.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--text-secondary)]">Téléphone</p>
                        <p className="font-medium">{client.phone || '-'}</p>
                      </div>
                      {client.address && (
                        <div className="col-span-2">
                          <p className="text-[var(--text-secondary)]">Adresse</p>
                          <p className="font-medium">{client.address}, {client.postalCode} {client.city}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {clients.length === 0 && (
              <p className="mt-4 text-[var(--warning)] text-sm">
                Aucun client enregistré. Cliquez sur "Nouveau client" pour en créer un.
              </p>
            )}
          </Card>
        );

      case 2:
        return (
          <Card>
            <h2 className="text-xl font-semibold font-[Outfit] mb-6">Dates du devis</h2>
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Date de création"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <Input
                label="Valide jusqu'au"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Par défaut, le devis est valable 30 jours.
            </p>
          </Card>
        );

      case 3:
        return (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold font-[Outfit]">Prestations</h2>
              <div className="flex gap-2">
                <Select
                  value=""
                  onChange={(e) => {
                    const item = catalogue.find(c => c.id === e.target.value);
                    if (item) addFromCatalogue(item);
                  }}
                  options={[
                    { value: '', label: 'Ajouter depuis catalogue...' },
                    ...catalogue.map(c => ({ value: c.id, label: `${c.name} - ${formatCurrency(c.unitPrice)}` }))
                  ]}
                />
                <Button onClick={addLine} variant="secondary" size="sm">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>
            </div>

            {lines.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                <p className="mb-4">Aucune prestation ajoutée.</p>
                <Button onClick={addLine}>
                  <Plus className="w-4 h-4" />
                  Ajouter une prestation
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {lines.map((line, index) => (
                    <div key={line.id} className="flex gap-3 items-start p-3 bg-[var(--bg-primary)] rounded-lg">
                      <div className="flex-1 grid grid-cols-12 gap-2">
                        <div className="col-span-4">
                          <input
                            type="text"
                            placeholder="Description"
                            value={line.name}
                            onChange={(e) => updateLine(index, 'name', e.target.value)}
                            className="w-full h-9 px-3 rounded-md border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Qté"
                            value={line.quantity}
                            onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full h-9 px-3 rounded-md border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Prix HT"
                            value={line.unitPrice}
                            onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full h-9 px-3 rounded-md border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={line.tvaRate}
                            onChange={(e) => updateLine(index, 'tvaRate', parseFloat(e.target.value) as TVARate)}
                            className="w-full h-9 px-2 rounded-md border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
                          >
                            <option value={0}>0%</option>
                            <option value={5.5}>5.5%</option>
                            <option value={10}>10%</option>
                            <option value={20}>20%</option>
                          </select>
                        </div>
                        <div className="col-span-2 flex items-center justify-end">
                          <span className="font-mono font-medium">{formatCurrency(line.totalTTC)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeLine(index)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[var(--danger)]" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-[var(--border)] pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Sous-total HT</span>
                        <span className="font-mono">{formatCurrency(totals.totalHT + totals.discountAmount)}</span>
                      </div>
                      {formData.discountPercent > 0 && (
                        <div className="flex justify-between text-sm text-[var(--success)]">
                          <span>Remise ({formData.discountPercent}%)</span>
                          <span className="font-mono">-{formatCurrency(totals.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">TVA</span>
                        <span className="font-mono">{formatCurrency(totals.totalTVA)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t border-[var(--border)] pt-2">
                        <span>Total TTC</span>
                        <span className="font-mono text-[var(--accent)]">{formatCurrency(totals.totalTTC)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        );

      case 4:
        return (
          <Card>
            <h2 className="text-xl font-semibold font-[Outfit] mb-6">Options et Finalisation</h2>
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Remise globale (%)"
                type="number"
                min="0"
                max="100"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Conditions de paiement"
                value={formData.paymentConditions}
                onChange={(e) => setFormData({ ...formData, paymentConditions: e.target.value })}
                placeholder="Ex: 30% à la commande, Solde à la livraison"
              />
            </div>
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes visibles sur le devis..."
              className="mt-4"
            />
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header title={devisId ? 'Modifier le devis' : 'Nouveau devis'} />

      <div className="p-8 animate-in max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6">
          <Link href="/devis" className="hover:text-[var(--accent)]">Devis</Link>
          <span>/</span>
          <span>{devisId ? 'Modifier' : 'Nouveau'}</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 border border-[var(--border)]">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-[var(--success)] text-white'
                        : isActive
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`font-medium hidden sm:block ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="secondary"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          <div className="flex gap-3">
            <Link href="/devis">
              <Button variant="ghost">Annuler</Button>
            </Link>
            {isLastStep ? (
              <>
                <Button variant="secondary" onClick={() => handleSave()}>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </Button>
                <Button onClick={handleSaveAndExportPDF}>
                  <FileText className="w-4 h-4" />
                  Enregistrer et PDF
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canGoNext}
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Create Client Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Nouveau client"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateClient(); }} className="space-y-4">
          <Input
            label="Nom / Raison sociale"
            value={newClientData.name}
            onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
            required
          />

          <Select
            label="Type"
            value={newClientData.type}
            onChange={(e) => setNewClientData({ ...newClientData, type: e.target.value as ClientType })}
            options={[
              { value: 'particulier', label: 'Particulier' },
              { value: 'professionnel', label: 'Professionnel' },
            ]}
          />

          <Input
            label="Adresse"
            value={newClientData.address}
            onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code postal"
              value={newClientData.postalCode}
              onChange={(e) => setNewClientData({ ...newClientData, postalCode: e.target.value })}
            />
            <Input
              label="Ville"
              value={newClientData.city}
              onChange={(e) => setNewClientData({ ...newClientData, city: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={newClientData.email}
              onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
            />
            <Input
              label="Téléphone"
              type="tel"
              value={newClientData.phone}
              onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsClientModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer le client
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}