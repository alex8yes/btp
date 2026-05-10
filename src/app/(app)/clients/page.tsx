'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { store } from '@/lib/store';
import { Client, ClientType } from '@/lib/types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'particulier' as ClientType,
    address: '',
    postalCode: '',
    city: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    setClients(store.getClients());
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase()) ||
    client.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        type: client.type,
        address: client.address,
        postalCode: client.postalCode,
        city: client.city,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        type: 'particulier',
        address: '',
        postalCode: '',
        city: '',
        email: '',
        phone: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingClient) {
      store.saveClient({ id: editingClient.id, ...formData });
    } else {
      store.saveClient(formData);
    }

    setClients(store.getClients());
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      store.deleteClient(id);
      setClients(store.getClients());
    }
  };

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'type', label: 'Type', render: (c: Client) => (
      <Badge variant={c.type === 'professionnel' ? 'accent' : 'default'}>
        {c.type === 'professionnel' ? 'Professionnel' : 'Particulier'}
      </Badge>
    )},
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'city', label: 'Ville' },
    {
      key: 'actions',
      label: '',
      render: (c: Client) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenModal(c); }}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Edit className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
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
      <Header title="Clients" />

      <div className="p-8 animate-in">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4" />
              Nouveau client
            </Button>
          </div>

          <Table
            data={filteredClients}
            columns={columns}
            keyField="id"
          />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Modifier le client' : 'Nouveau client'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom / Raison sociale"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ClientType })}
            options={[
              { value: 'particulier', label: 'Particulier' },
              { value: 'professionnel', label: 'Professionnel' },
            ]}
          />

          <Input
            label="Adresse"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code postal"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
            <Input
              label="Ville"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Téléphone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {editingClient ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}