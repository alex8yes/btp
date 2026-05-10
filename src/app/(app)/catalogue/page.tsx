'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { store } from '@/lib/store';
import { CatalogueItem, CATEGORIES, UNIT_LABELS, UnitType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';

export default function CataloguePage() {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogueItem | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    description: '',
    unitPrice: 0,
    unit: 'forfait' as UnitType,
  });

  useEffect(() => {
    setItems(store.getCatalogue());
  }, []);

  const filteredItems = items.filter(item =>
    (categoryFilter === '' || item.category === categoryFilter) &&
    (item.name.toLowerCase().includes(search.toLowerCase()) ||
     item.description.toLowerCase().includes(search.toLowerCase()) ||
     item.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenModal = (item?: CatalogueItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category,
        name: item.name,
        description: item.description,
        unitPrice: item.unitPrice,
        unit: item.unit,
      });
    } else {
      setEditingItem(null);
      setFormData({
        category: '',
        name: '',
        description: '',
        unitPrice: 0,
        unit: 'forfait',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      store.saveCatalogueItem({ id: editingItem.id, ...formData });
    } else {
      store.saveCatalogueItem(formData);
    }

    setItems(store.getCatalogue());
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      store.deleteCatalogueItem(id);
      setItems(store.getCatalogue());
    }
  };

  const columns = [
    { key: 'category', label: 'Catégorie' },
    { key: 'name', label: 'Nom' },
    { key: 'description', label: 'Description' },
    {
      key: 'unitPrice',
      label: 'Prix HT',
      render: (item: CatalogueItem) => (
        <span className="font-mono font-medium">{formatCurrency(item.unitPrice)}</span>
      ),
    },
    { key: 'unit', label: 'Unité', render: (item: CatalogueItem) => UNIT_LABELS[item.unit] },
    {
      key: 'actions',
      label: '',
      render: (item: CatalogueItem) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Edit className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-[var(--danger)]" />
          </button>
        </div>
      ),
      className: 'w-24',
    },
  ];

  return (
    <>
      <Header title="Catalogue" />

      <div className="p-8 animate-in">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              >
                <option value="">Toutes catégories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4" />
              Nouvelle prestation
            </Button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-[var(--text-secondary)]/40 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-4">
                {items.length === 0 ? 'Aucun article dans le catalogue' : 'Aucun résultat pour cette recherche'}
              </p>
              {items.length === 0 && (
                <Button onClick={() => handleOpenModal()}>
                  <Plus className="w-4 h-4" />
                  Ajouter une prestation
                </Button>
              )}
            </div>
          ) : (
            <Table
              data={filteredItems}
              columns={columns}
              keyField="id"
            />
          )}
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Modifier la prestation' : 'Nouvelle prestation'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Catégorie"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
          />

          <Input
            label="Nom de la prestation"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prix HT"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              required
            />
            <Select
              label="Unité"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
              options={[
                { value: 'forfait', label: 'Forfait' },
                { value: 'm2', label: 'm²' },
                { value: 'heure', label: 'Heure' },
                { value: 'unit', label: 'Unité' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {editingItem ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}