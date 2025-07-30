# 🚀 Guide de Démarrage Rapide - Mon Budget Malin

## 📋 Vue d'ensemble

Votre application de budget a maintenant un **backend Python moderne** avec FastAPI ! Voici comment l'utiliser.

## 🛠️ Installation et Configuration

### 1. Prérequis
- Python 3.8+ installé
- pip (gestionnaire de paquets Python)

### 2. Installation du Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Initialiser la base de données avec les données par défaut
python init_data.py
```

### 3. Lancer le Backend

```bash
# Dans le dossier backend
python run.py
```

Le serveur sera disponible sur : http://localhost:8000

## 🔐 Première Connexion

### Utilisateur de Test
- **Nom d'utilisateur :** `test`
- **Mot de passe :** `test123`

### Accès à l'Application
1. Ouvrez `login.html` dans votre navigateur
2. Connectez-vous avec les identifiants ci-dessus
3. Vous serez redirigé vers l'application principale

## 📚 Documentation API

### Documentation Interactive
- **Swagger UI :** http://localhost:8000/docs
- **ReDoc :** http://localhost:8000/redoc

### Endpoints Principaux

#### 🔐 Authentification
```
POST /auth/register     # Créer un compte
POST /auth/token        # Se connecter
GET  /auth/me          # Profil utilisateur
```

#### 💰 Transactions
```
GET    /transactions/           # Liste des transactions
POST   /transactions/           # Créer une transaction
PUT    /transactions/{id}       # Modifier une transaction
DELETE /transactions/{id}       # Supprimer une transaction
```

#### 🎯 Budgets
```
GET    /budgets/               # Liste des budgets
POST   /budgets/               # Créer un budget
GET    /budgets/alerts         # Alertes de budget
```

## 🔄 Migration des Données

Si vous avez déjà des données dans localStorage, elles peuvent être migrées automatiquement :

```javascript
// Dans la console du navigateur
DataMigration.migrateFromLocalStorage().then(success => {
    if (success) {
        console.log('✅ Migration réussie !');
    }
});
```

## 🎯 Fonctionnalités Avancées

### 1. **Analyses Prédictives**
- Tendances mensuelles automatiques
- Prédictions de dépenses futures
- Alertes intelligentes

### 2. **Synchronisation Multi-Appareils**
- Données synchronisées entre mobile et desktop
- Sauvegarde cloud sécurisée
- Fonctionnement hors ligne avec cache

### 3. **Sécurité Renforcée**
- Authentification JWT sécurisée
- Chiffrement des mots de passe
- Validation des données côté serveur

## 🧪 Tests

### Tester l'API avec curl

```bash
# Se connecter
curl -X POST "http://localhost:8000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test&password=test123"

# Récupérer les transactions
curl -X GET "http://localhost:8000/transactions/" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Tester avec Postman
1. Importez la collection d'exemples
2. Configurez l'URL de base : `http://localhost:8000`
3. Testez les endpoints

## 🔧 Développement

### Structure du Projet
```
mon_budget_malin_ci/
├── backend/                 # Backend Python
│   ├── app/                # Code de l'application
│   ├── requirements.txt    # Dépendances Python
│   └── run.py             # Script de lancement
├── index.html             # Application principale
├── login.html             # Page de connexion
├── api-client.js          # Client API JavaScript
└── GUIDE_DEMARRAGE.md    # Ce guide
```

### Ajouter une Nouvelle Fonctionnalité

1. **Backend (Python)**
   ```python
   # Dans app/schemas.py
   class NewFeature(BaseModel):
       name: str
       value: float
   
   # Dans app/crud.py
   def create_new_feature(db: Session, data: NewFeature):
       # Logique métier
       pass
   
   # Dans app/api/new_feature.py
   @router.post("/")
   def create_feature(data: NewFeature):
       return crud.create_new_feature(db, data)
   ```

2. **Frontend (JavaScript)**
   ```javascript
   // Dans api-client.js
   async createNewFeature(data) {
       const response = await fetch(`${this.baseURL}/new-feature/`, {
           method: 'POST',
           headers: this.getHeaders(),
           body: JSON.stringify(data)
       });
       return this.handleResponse(response);
   }
   ```

## 🚀 Déploiement

### Mode Production

1. **Configuration de la base de données**
   ```env
   DATABASE_URL=postgresql://user:password@localhost/budget_malin
   SECRET_KEY=votre_cle_secrete_tres_longue_et_complexe
   DEBUG=False
   ```

2. **Lancement en production**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

### Docker (Recommandé)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur de connexion à la base de données**
   ```bash
   # Vérifier que SQLite est accessible
   ls -la backend/budget_malin.db
   ```

2. **Erreur CORS**
   - Vérifiez que le frontend et le backend sont sur les mêmes origines
   - Modifiez `allowed_origins` dans `backend/app/config.py`

3. **Erreur d'authentification**
   ```bash
   # Réinitialiser la base de données
   rm backend/budget_malin.db
   python backend/init_data.py
   ```

### Logs et Debug
```bash
# Voir les logs en temps réel
tail -f backend/logs/app.log

# Mode debug
DEBUG=True python backend/run.py
```

## 📞 Support

### Ressources Utiles
- **Documentation FastAPI :** https://fastapi.tiangolo.com/
- **Documentation SQLAlchemy :** https://docs.sqlalchemy.org/
- **Documentation Pydantic :** https://pydantic-docs.helpmanual.io/

### Obtenir de l'Aide
1. Consultez la documentation interactive : http://localhost:8000/docs
2. Vérifiez les logs de l'application
3. Testez les endpoints avec curl ou Postman

## 🎉 Félicitations !

Votre application de budget a maintenant :
- ✅ **Backend Python moderne** avec FastAPI
- ✅ **Authentification sécurisée** avec JWT
- ✅ **Base de données** avec SQLAlchemy
- ✅ **API RESTful** complète
- ✅ **Analyses avancées** avec pandas
- ✅ **Sécurité renforcée**
- ✅ **Documentation interactive**

**Votre application est maintenant prête pour la production ! 🚀**

---

**Développé avec ❤️ pour une gestion de budget intelligente** 