// Types for DevisBTP application

export type ClientType = 'particulier' | 'professionnel';

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  address: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export type UnitType = 'forfait' | 'm2' | 'heure' | 'unit';

export interface CatalogueItem {
  id: string;
  category: string;
  name: string;
  description: string;
  unitPrice: number;
  unit: UnitType;
}

export type TVARate = 0 | 5.5 | 10 | 20;

export interface LineItem {
  id: string;
  catalogueItemId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  tvaRate: TVARate;
  totalHT: number;
  totalTTC: number;
}

export type DevisStatus = 'draft' | 'sent' | 'accepted' | 'refused' | 'expired';

export interface Devis {
  id: string;
  number: string;
  clientId: string;
  date: string;
  validUntil: string;
  status: DevisStatus;
  lines: LineItem[];
  discountPercent: number;
  notes: string;
  paymentConditions: string;
  createdAt: string;
  sentAt?: string;
}

export type FactureStatus = 'unpaid' | 'partial' | 'paid';

export interface Facture {
  id: string;
  number: string;
  devisId?: string;
  clientId: string;
  date: string;
  dueDate: string;
  status: FactureStatus;
  lines: LineItem[];
  discountPercent: number;
  notes: string;
  paidAmount: number;
  createdAt: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
  siret: string;
  logo?: string;
  defaultTVA: TVARate;
  legalMentions: string;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: '',
  address: '',
  postalCode: '',
  city: '',
  email: '',
  phone: '',
  siret: '',
  defaultTVA: 20,
  legalMentions: '',
};

export const CATEGORIES = [
  'Gros œuvre',
  'Électricité',
  'Plomberie',
  'Peinture',
  'Carrelage',
  'Menuiserie',
  'Toiture',
  'Revêtement sol',
  'Maçonnerie',
  'Démolition',
  'Terrassement',
  'Climatisation',
  'Ventilation',
  'Domotique',
  'Espaces verts',
  'Autre',
];

export const UNIT_LABELS: Record<UnitType, string> = {
  forfait: 'Forfait',
  m2: 'm²',
  heure: 'Heure',
  unit: 'Unité',
};

export const DEVIS_STATUS_LABELS: Record<DevisStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  refused: 'Refusé',
  expired: 'Expiré',
};

export const FACTURE_STATUS_LABELS: Record<FactureStatus, string> = {
  unpaid: 'Non payée',
  partial: 'Partiellement payée',
  paid: 'Payée',
};

export const TVA_LABELS: Record<TVARate, string> = {
  0: '0%',
  5.5: '5.5%',
  10: '10%',
  20: '20%',
};