# 💰 Mon Budget Malin

Une application Progressive Web App (PWA) moderne pour la gestion de budget personnelle, intuitive et efficace.

## ✨ Fonctionnalités

### 📝 Gestion des transactions
- **Saisie de revenus et dépenses** avec montant, date, catégorie
- **Catégories** : Nourriture, Transport, Logement, Communication, Santé, Salaire, Divers
- **Mode de paiement** : Mobile Money, Espèces, Carte
- **Description facultative** pour chaque transaction

### 📊 Tableau de bord
- **Historique des transactions** trié par date
- **Résumé des totaux** (revenus, dépenses, solde) avec code couleur
- **Graphiques interactifs** (barres et camemberts) pour la répartition des dépenses
- **Alertes visuelles** en cas de dépassement de budget

### 🎯 Gestion des budgets
- **Budgets mensuels par catégorie**
- **Suivi en temps réel** des dépenses vs budgets
- **Alertes automatiques** à 80% et 100% du budget
- **Statuts visuels** (OK, Attention, Dépassé)

### 💾 Sauvegarde et restauration
- **Export/Import** des données au format JSON
- **Fonctionnement hors ligne** grâce au Service Worker
- **Installation comme PWA** sur mobile et desktop

## 🎨 Design

- **Couleurs modernes** : Vert et blanc
- **Interface moderne et responsive**
- **Animations fluides**
- **Icônes emoji** pour une meilleure UX
- **Design adaptatif** pour mobile et desktop

## 🚀 Installation et utilisation

### Utilisation en ligne
1. Ouvrez `index.html` dans votre navigateur
2. L'application fonctionne immédiatement sans installation

### Installation comme PWA
1. Ouvrez l'application dans Chrome/Edge
2. Cliquez sur l'icône d'installation dans la barre d'adresse
3. L'application s'installe sur votre bureau/mobile

### Fonctionnement hors ligne
- L'application fonctionne entièrement hors ligne après le premier chargement
- Toutes les données sont sauvegardées localement

## 📱 Empaquetage en application Android

### Méthode 1 : Bubblewrap (Recommandée)

#### Prérequis
- Node.js (version 14 ou supérieure)
- Java JDK 11
- Android Studio avec Android SDK

#### Étapes d'installation

1. **Installer Bubblewrap**
```bash
npm install -g @bubblewrap/cli
```

2. **Initialiser le projet**
```bash
bubblewrap init --manifest https://votre-domaine.com/manifest.json
```

3. **Configurer l'application**
```bash
cd votre-projet
bubblewrap build
```

4. **Générer l'APK**
```bash
bubblewrap build --release
```

### Méthode 2 : PWA Builder (Plus simple)

1. Allez sur [PWA Builder](https://www.pwabuilder.com/)
2. Entrez l'URL de votre application
3. Cliquez sur "Build My PWA"
4. Téléchargez l'APK généré

### Méthode 3 : TWA (Trusted Web Activity)

#### Configuration du manifest.json
```json
{
  "name": "Mon Budget Malin CI",
  "short_name": "Budget CI",
  "description": "Application de gestion de budget personnelle adaptée au contexte ivoirien.",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#009879",
  "theme_color": "#009879",
  "scope": "./",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Création du projet Android
1. Créez un nouveau projet Android
2. Ajoutez la dépendance TWA :
```gradle
implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
```

3. Configurez l'activité principale :
```xml
<activity android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    <meta-data android:name="android.webkit.WebManifest"
        android:resource="@xml/web_manifest" />
</activity>
```

## 🔧 Structure du projet

```
mon_budget_malin_ci/
├── index.html          # Page principale
├── app.js             # Logique JavaScript
├── styles.css         # Styles CSS
├── manifest.json      # Configuration PWA
├── service-worker.js  # Service Worker pour le hors ligne
├── plotly.js         # Bibliothèque de graphiques
├── icon-192.png      # Icône 192x192
├── icon-512.png      # Icône 512x512
└── README.md         # Documentation
```

## 📊 Fonctionnalités techniques

### Stockage local
- **localStorage** pour les transactions et budgets
- **Persistance des données** entre les sessions
- **Synchronisation automatique** de l'interface

### Graphiques interactifs
- **Plotly.js** pour les graphiques
- **Graphiques en barres** et **camemberts**
- **Couleurs dynamiques** selon le respect du budget
- **Responsive** et interactifs

### Service Worker
- **Cache des ressources** pour le hors ligne
- **Mise à jour automatique** des caches
- **Gestion des erreurs** réseau

## 🎯 Utilisation

### Ajouter une transaction
1. Remplissez le formulaire en haut de page
2. Choisissez le type (revenu/dépense)
3. Sélectionnez la catégorie et le mode de paiement
4. Ajoutez une description (optionnel)
5. Cliquez sur "Enregistrer"

### Gérer les budgets
1. Allez à la section "Budgets mensuels"
2. Entrez vos budgets par catégorie
3. Cliquez sur "Enregistrer les budgets"
4. Les alertes apparaîtront automatiquement

### Exporter/Importer
1. **Export** : Cliquez sur "Exporter (JSON)"
2. **Import** : Sélectionnez un fichier JSON et cliquez sur "Importer"

## 🔒 Sécurité et confidentialité

- **Données locales uniquement** : Aucune donnée n'est envoyée sur internet
- **Chiffrement local** : Les données sont stockées localement
- **Pas de tracking** : Aucun analytics ou tracking externe

## 🐛 Dépannage

### L'application ne se charge pas
- Vérifiez que tous les fichiers sont présents
- Ouvrez la console du navigateur pour voir les erreurs

### Les données ne se sauvegardent pas
- Vérifiez que le localStorage est activé
- Essayez en mode navigation privée

### Les graphiques ne s'affichent pas
- Vérifiez que plotly.js est bien chargé
- Rechargez la page

## 📞 Support

Pour toute question ou problème :
- Vérifiez d'abord la console du navigateur
- Consultez la documentation de Plotly.js
- Testez sur différents navigateurs

## 🚀 Déploiement

### Hébergement simple
1. Uploadez tous les fichiers sur un serveur web
2. Assurez-vous que le HTTPS est activé (requis pour PWA)
3. Testez l'installation sur mobile

### Hébergement recommandé
- **Netlify** : Déploiement gratuit et automatique
- **Vercel** : Performance optimisée
- **GitHub Pages** : Hébergement gratuit pour projets open source

## 📄 Licence

Ce projet est sous licence MIT. Libre d'utilisation et de modification.

---

**Développé avec ❤️ pour une gestion de budget intelligente** 