# Roar of the Lion · Epic Fury

IHM (Interface Homme-Machine) pour l'opération **Roar of the Lion** — tableau de bord temps réel inspiré de Palantir pour la surveillance du théâtre iranien et l'opération Epic Fury.

## Fonctionnalités

- **Carte géospatiale** : Iran centré avec **Google Maps** (thème sombre Palantir)
- **Infrastructures iraniennes** : Sites nucléaires, bases aériennes, installations navales, raffineries, centres de commandement
- **Positions militaires Epic Fury** : Forces alliées et hostiles (IRGC) en temps réel
- **Statistiques d'attaques** : Compteur temps réel (ballistique, drone, cyber, artillerie) avec taux d'interception
- **Chat ULTRON (OFSEC)** : Agent IA conversationnel pour requêtes tactiques

## Démarrage

1. Créer un fichier `.env` à la racine :
```bash
cp .env.example .env
```

2. Ajouter votre clé API Google Maps dans `.env` :
```
VITE_GOOGLE_MAPS_API_KEY=votre_cle_api
```
Obtenir une clé : [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/)

3. Lancer l'application :
```bash
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- Google Maps (@react-google-maps/api)
- Lucide React (icônes)

## Design

Interface inspirée de Palantir : fond sombre, accents ambre/orange, typographie mono pour les données, densité d'information élevée, effet scanlines subtil.
