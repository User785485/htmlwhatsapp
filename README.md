# HTML File Manager

Une application web permettant d'importer, stocker, rechercher et visualiser des fichiers HTML avec tous leurs médias associés (audio, vidéo, images).

## Fonctionnalités

### Gestion des fichiers
- Import de fichiers HTML individuels ou en masse
- Prise en charge de l'upload des médias associés (images, vidéos, fichiers audio)
- Analyse des fichiers HTML pour extraire les liens vers les médias
- Stockage des fichiers et conservation de la structure de liens

### Moteur de recherche
- Recherche par nom de fichier, contenu textuel et métadonnées
- Filtres par type de média inclus (audio, vidéo, images)
- Filtres par date de création/modification
- Affichage des résultats en temps réel

### Visualisation
- Affichage correct du contenu HTML avec tous les styles et médias
- Lecture intégrée des fichiers audio et vidéo
- Navigation facile entre les fichiers
- Vue responsive adaptée à différents appareils

## Structure du projet

```
html-file-manager/
├── client/               # Frontend React
│   ├── public/
│   └── src/
│       ├── components/   # Composants réutilisables
│       ├── pages/        # Pages de l'application
│       ├── services/     # Services pour les appels API
│       └── types/        # Types TypeScript
├── server/               # Backend Node.js/Express
│   ├── models/           # Modèles Mongoose
│   ├── routes/           # Routes API
│   └── utils/            # Utilitaires
└── uploads/              # Dossier pour stocker les fichiers uploadés
```

## Technologies utilisées

### Frontend
- React avec TypeScript
- Material-UI pour l'interface utilisateur
- Axios pour les requêtes HTTP
- React Router pour la navigation

### Backend
- Node.js avec Express
- MongoDB avec Mongoose
- Multer pour la gestion des uploads de fichiers
- Cheerio pour l'analyse des fichiers HTML

## Installation et démarrage

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB

### Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/votre-nom/html-file-manager.git
cd html-file-manager
```

2. Installer les dépendances du serveur :
```bash
cd server
npm install
```

3. Installer les dépendances du client :
```bash
cd ../client
npm install
```

4. Configurer les variables d'environnement :
   - Créer un fichier `.env` dans le dossier `server` basé sur `.env.example`

### Démarrage

1. Démarrer le serveur backend :
```bash
cd server
npm run dev
```

2. Démarrer le client frontend dans un autre terminal :
```bash
cd client
npm start
```

3. Accéder à l'application dans votre navigateur à l'adresse `http://localhost:3000`

## Déploiement

L'application est configurée pour être déployée sur Vercel :
- Frontend: déployé directement sur Vercel
- Backend: déployé comme API serverless sur Vercel
- Base de données: MongoDB Atlas
