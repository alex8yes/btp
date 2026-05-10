'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { store } from '@/lib/store';
import { CompanySettings, TVARate } from '@/lib/types';
import { Download, Upload, Check } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>({
    name: '',
    address: '',
    postalCode: '',
    city: '',
    email: '',
    phone: '',
    siret: '',
    defaultTVA: 20,
    legalMentions: '',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(store.getSettings());
  }, []);

  const handleChange = (field: keyof CompanySettings, value: string | number) => {
    setSettings({ ...settings, [field]: value });
    setSaved(false);
  };

  const handleSave = () => {
    store.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devis-btp-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = store.importData(content);
      if (success) {
        alert('Données importées avec succès !');
        window.location.reload();
      } else {
        alert('Erreur lors de l\'importation. Vérifiez le format du fichier.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Header title="Paramètres" />

      <div className="p-8 animate-in max-w-3xl mx-auto">
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardTitle className="mb-6">Informations entreprise</CardTitle>
            <div className="space-y-4">
              <Input
                label="Nom de l'entreprise"
                value={settings.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ma Entreprise BTP"
              />

              <Input
                label="Adresse"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 rue des Bâtisseurs"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Code postal"
                  value={settings.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                />
                <Input
                  label="Ville"
                  value={settings.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <Input
                label="SIRET"
                value={settings.siret}
                onChange={(e) => handleChange('siret', e.target.value)}
              />
            </div>
          </Card>

          {/* Default Settings */}
          <Card>
            <CardTitle className="mb-6">Paramètres par défaut</CardTitle>
            <div className="space-y-4">
              <Select
                label="TVA par défaut"
                value={settings.defaultTVA}
                onChange={(e) => handleChange('defaultTVA', parseFloat(e.target.value) as TVARate)}
                options={[
                  { value: 0, label: '0%' },
                  { value: 5.5, label: '5.5%' },
                  { value: 10, label: '10%' },
                  { value: 20, label: '20%' },
                ]}
              />

              <Textarea
                label="Mentions légales"
                value={settings.legalMentions}
                onChange={(e) => handleChange('legalMentions', e.target.value)}
                placeholder="SIRET, forme juridique, RCS, etc."
              />
            </div>
          </Card>

          {/* Backup */}
          <Card>
            <CardTitle className="mb-6">Sauvegarde et restauration</CardTitle>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Exporter les données
              </Button>
              <label className="cursor-pointer inline-flex">
                <span className="inline-flex items-center justify-center h-10 px-4 text-sm gap-2 font-medium rounded-md border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                  <Upload className="w-4 h-4" />
                  Importer des données
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {saved && (
              <span className="flex items-center gap-2 text-[var(--success)]">
                <Check className="w-4 h-4" />
                Paramètres sauvegardés
              </span>
            )}
            <Button onClick={handleSave}>
              Sauvegarder les paramètres
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}