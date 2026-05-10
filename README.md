# DevisBTP - Application de gestion devis et factures

Application web moderne pour les artisans du bâtiment. Permet de gérer clients, devis, factures et catalogue de prestations.

## Stack technique

- **Framework:** Next.js 14 (App Router)
- **Langage:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icônes:** Lucide React
- **PDF:** jsPDF
- **Stockage:** localStorage (IndexedDB via localStorage)

## Installation

```bash
npm install
npm run dev
```

## Structure

```
src/
├── app/                    # Pages Next.js
│   ├── (app)/              # Layout avec sidebar
│   │   ├── page.tsx         # Dashboard
│   │   ├── clients/         # Gestion clients
│   │   ├── devis/           # Gestion devis
│   │   ├── factures/        # Gestion factures
│   │   ├── catalogue/       # Catalogue prestations
│   │   └── settings/        # Paramètres entreprise
├── components/ui/          # Composants réutilisables
├── lib/
│   ├── types.ts            # Types TypeScript
│   ├── store.ts            # Gestionnaire de données
│   └── utils.ts            # Helpers
```

## Fonctionnalités

### Dashboard
- Statistiques (devis en attente, factures impayées, CA du mois, nombre clients)
- Accès rapides aux derniers devis et factures

### Clients
- Liste avec recherche
- Création/modification/suppression
- Types: particulier ou professionnel

### Devis
- Création/modification avec lignes
- Workflow: brouillon → envoyé → accepté/refusé/expiré
- Duplication
- Transformation en facture

### Factures
- Création/modification
- Suivi des paiements
- Statut: non payée, partiellement payée, payée

### Catalogue
- Gestion des prestations avec catégories
- Import depuis catalogue dans devis/factures

### Paramètres
- Informations entreprise (affichées sur les documents)
- Sauvegarde/import JSON