import { Client, Devis, Facture, CatalogueItem, CompanySettings, DEFAULT_COMPANY_SETTINGS } from './types';

const STORAGE_KEYS = {
  clients: 'devis-btp-clients',
  devis: 'devis-btp-devis',
  factures: 'devis-btp-factures',
  catalogue: 'devis-btp-catalogue',
  settings: 'devis-btp-settings',
  devisCounter: 'devis-btp-devis-counter',
  factureCounter: 'devis-btp-facture-counter',
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getNextNumber(prefix: string, key: string): string {
  const year = new Date().getFullYear();
  if (!isBrowser()) {
    return `${prefix}-${year}-0001`;
  }
  const counter = parseInt(localStorage.getItem(key) || '0', 10) + 1;
  localStorage.setItem(key, counter.toString());
  return `${prefix}-${year}-${counter.toString().padStart(4, '0')}`;
}

class Store {
  // Clients
  getClients(): Client[] {
    if (!isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.clients);
    return data ? JSON.parse(data) : [];
  }

  getClient(id: string): Client | undefined {
    return this.getClients().find(c => c.id === id);
  }

  saveClient(client: Partial<Client>): Client {
    const clients = this.getClients();
    const now = new Date().toISOString();

    if (client.id) {
      const index = clients.findIndex(c => c.id === client.id);
      if (index !== -1) {
        clients[index] = { ...clients[index], ...client };
        if (isBrowser()) localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
        return clients[index];
      }
    }

    const newClient: Client = {
      id: generateId(),
      name: client.name || '',
      type: client.type || 'particulier',
      address: client.address || '',
      postalCode: client.postalCode || '',
      city: client.city || '',
      email: client.email || '',
      phone: client.phone || '',
      notes: client.notes || '',
      createdAt: now,
    };

    clients.push(newClient);
    if (isBrowser()) localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
    return newClient;
  }

  deleteClient(id: string): void {
    const clients = this.getClients().filter(c => c.id !== id);
    if (isBrowser()) localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
  }

  // Catalogue
  getCatalogue(): CatalogueItem[] {
    if (!isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.catalogue);
    return data ? JSON.parse(data) : [];
  }

  saveCatalogueItem(item: Partial<CatalogueItem>): CatalogueItem {
    const items = this.getCatalogue();

    if (item.id) {
      const index = items.findIndex(i => i.id === item.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...item };
        if (isBrowser()) localStorage.setItem(STORAGE_KEYS.catalogue, JSON.stringify(items));
        return items[index];
      }
    }

    const newItem: CatalogueItem = {
      id: generateId(),
      category: item.category || 'Autre',
      name: item.name || '',
      description: item.description || '',
      unitPrice: item.unitPrice || 0,
      unit: item.unit || 'forfait',
    };

    items.push(newItem);
    if (isBrowser()) localStorage.setItem(STORAGE_KEYS.catalogue, JSON.stringify(items));
    return newItem;
  }

  deleteCatalogueItem(id: string): void {
    const items = this.getCatalogue().filter(i => i.id !== id);
    if (isBrowser()) localStorage.setItem(STORAGE_KEYS.catalogue, JSON.stringify(items));
  }

  // Devis
  getDevis(): Devis[] {
    if (!isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.devis);
    return data ? JSON.parse(data) : [];
  }

  getDevisById(id: string): Devis | undefined {
    return this.getDevis().find(d => d.id === id);
  }

  saveDevis(devis: Partial<Devis>): Devis {
    const devisList = this.getDevis();
    const now = new Date().toISOString();

    if (devis.id) {
      const index = devisList.findIndex(d => d.id === devis.id);
      if (index !== -1) {
        devisList[index] = { ...devisList[index], ...devis };
        if (isBrowser()) localStorage.setItem(STORAGE_KEYS.devis, JSON.stringify(devisList));
        return devisList[index];
      }
    }

    const newDevis: Devis = {
      id: generateId(),
      number: getNextNumber('DE', STORAGE_KEYS.devisCounter),
      clientId: devis.clientId || '',
      date: devis.date || now.split('T')[0],
      validUntil: devis.validUntil || '',
      status: devis.status || 'draft',
      lines: devis.lines || [],
      discountPercent: devis.discountPercent || 0,
      notes: devis.notes || '',
      paymentConditions: devis.paymentConditions || '',
      createdAt: now,
    };

    devisList.push(newDevis);
    if (isBrowser()) localStorage.setItem(STORAGE_KEYS.devis, JSON.stringify(devisList));
    return newDevis;
  }

  deleteDevis(id: string): void {
    const devisList = this.getDevis().filter(d => d.id !== id);
    if (isBrowser()) localStorage.setItem(STORAGE_KEYS.devis, JSON.stringify(devisList));
  }

  // Factures
  getFactures(): Facture[] {
    if (!isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.factures);
    return data ? JSON.parse(data) : [];
  }

  getFactureById(id: string): Facture | undefined {
    return this.getFactures().find(f => f.id === id);
  }

  saveFacture(facture: Partial<Facture>): Facture {
    const factures = this.getFactures();
    const now = new Date().toISOString();

    if (facture.id) {
      const index = factures.findIndex(f => f.id === facture.id);
      if (index !== -1) {
        factures[index] = { ...factures[index], ...facture };
        if (isBrowser()) localStorage.setItem(STORAGE_KEYS.factures, JSON.stringify(factures));
        return factures[index];
      }
    }

    const newFacture: Facture = {
      id: generateId(),
      number: getNextNumber('FA', STORAGE_KEYS.factureCounter),
      devisId: facture.devisId,
      clientId: facture.clientId || '',
      date: facture.date || now.split('T')[0],
      dueDate: facture.dueDate || '',
      status: facture.status || 'unpaid',
      lines: facture.lines || [],
      discountPercent: facture.discountPercent || 0,
      notes: facture.notes || '',
      paidAmount: facture.paidAmount || 0,
      createdAt: now,
    };

    factures.push(newFacture);
    if (isBrowser()) localStorage.setItem(STORAGE_KEYS.factures, JSON.stringify(factures));
    return newFacture;
  }

  deleteFacture(id: string): void {
    const factures = this.getFactures().filter(f => f.id !== id);
    if (isBrowser()) localStorage.setItem(STORAGE_KEYS.factures, JSON.stringify(factures));
  }

  // Settings
  getSettings(): CompanySettings {
    if (!isBrowser()) return DEFAULT_COMPANY_SETTINGS;
    const data = localStorage.getItem(STORAGE_KEYS.settings);
    return data ? { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(data) } : DEFAULT_COMPANY_SETTINGS;
  }

  saveSettings(settings: Partial<CompanySettings>): CompanySettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    if (isBrowser()) localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated));
    return updated;
  }

  // Export/Import
  exportData(): string {
    return JSON.stringify({
      clients: this.getClients(),
      catalogue: this.getCatalogue(),
      devis: this.getDevis(),
      factures: this.getFactures(),
      settings: this.getSettings(),
    }, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!isBrowser()) return false;
      if (data.clients) localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(data.clients));
      if (data.catalogue) localStorage.setItem(STORAGE_KEYS.catalogue, JSON.stringify(data.catalogue));
      if (data.devis) localStorage.setItem(STORAGE_KEYS.devis, JSON.stringify(data.devis));
      if (data.factures) localStorage.setItem(STORAGE_KEYS.factures, JSON.stringify(data.factures));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data.settings));
      return true;
    } catch {
      return false;
    }
  }
}

export const store = new Store();