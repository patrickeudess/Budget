# 🚀 Backend API - Mon Budget Malin

Backend Python moderne pour l'application de gestion de budget, construit avec FastAPI.

## ✨ Fonctionnalités

### 🔐 Authentification sécurisée
- **JWT Tokens** pour l'authentification
- **Hachage bcrypt** des mots de passe
- **Gestion des sessions** sécurisée

### 📊 Gestion des données
- **Transactions** : Revenus et dépenses
- **Budgets** : Budgets mensuels par catégorie
- **Objectifs** : Objectifs d'épargne
- **Catégories** : Catégorisation des transactions

### 📈 Analyses avancées
- **Analyses prédictives** avec pandas et scikit-learn
- **Alertes de budget** intelligentes
- **Tendances mensuelles** et statistiques

## 🛠️ Installation

### Prérequis
- Python 3.8+
- pip

### Installation des dépendances
```bash
cd backend
pip install -r requirements.txt
```

### Configuration
1. Copiez le fichier `env_example.txt` vers `.env`
2. Modifiez les variables selon votre environnement

```bash
cp env_example.txt .env
```

### Base de données
L'application utilise SQLite par défaut (développement). Pour la production, configurez PostgreSQL :

```env
DATABASE_URL=postgresql://user:password@localhost/budget_malin
```

## 🚀 Lancement

### Mode développement
```bash
python run.py
```

### Mode production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

L'API sera disponible sur : http://localhost:8000

## 📚 Documentation API

### Documentation interactive
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

### Endpoints principaux

#### 🔐 Authentification
```
POST /auth/register     # Inscription
POST /auth/token        # Connexion
GET  /auth/me          # Profil utilisateur
PUT  /auth/me          # Mise à jour profil
```

#### 💰 Transactions
```
GET    /transactions/           # Liste des transactions
POST   /transactions/           # Créer une transaction
GET    /transactions/{id}       # Détails d'une transaction
PUT    /transactions/{id}       # Modifier une transaction
DELETE /transactions/{id}       # Supprimer une transaction
GET    /transactions/summary/analytics  # Analyses
```

#### 🎯 Budgets
```
GET    /budgets/               # Liste des budgets
POST   /budgets/               # Créer un budget
PUT    /budgets/{id}           # Modifier un budget
DELETE /budgets/{id}           # Supprimer un budget
GET    /budgets/alerts         # Alertes de budget
```

#### 🏆 Objectifs
```
GET    /goals/                 # Liste des objectifs
POST   /goals/                 # Créer un objectif
GET    /goals/{id}             # Détails d'un objectif
PUT    /goals/{id}             # Modifier un objectif
DELETE /goals/{id}             # Supprimer un objectif
```

#### 📂 Catégories
```
GET    /categories/            # Liste des catégories
POST   /categories/            # Créer une catégorie
```

## 🔧 Structure du projet

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Application principale
│   ├── config.py            # Configuration
│   ├── database.py          # Configuration DB
│   ├── models.py            # Modèles SQLAlchemy
│   ├── schemas.py           # Schémas Pydantic
│   ├── auth.py              # Authentification
│   ├── crud.py              # Opérations CRUD
│   └── api/
│       ├── __init__.py
│       ├── auth.py          # Endpoints auth
│       ├── transactions.py  # Endpoints transactions
│       ├── budgets.py       # Endpoints budgets
│       ├── goals.py         # Endpoints objectifs
│       └── categories.py    # Endpoints catégories
├── requirements.txt          # Dépendances Python
├── run.py                   # Script de lancement
├── env_example.txt          # Variables d'environnement
└── README.md               # Documentation
```

## 🔒 Sécurité

### Authentification
- **JWT Tokens** avec expiration configurable
- **Hachage bcrypt** des mots de passe
- **Validation des données** avec Pydantic

### CORS
- Configuration CORS pour le frontend
- Origines autorisées configurables

### Base de données
- **SQLAlchemy ORM** pour la sécurité
- **Validation des données** côté serveur
- **Isolation des utilisateurs** (multi-tenant)

## 📊 Fonctionnalités avancées

### Analyses prédictives
```python
# Exemple d'utilisation
from app.crud import get_user_analytics

analytics = get_user_analytics(db, user_id=1, months=6)
print(f"Solde: {analytics['balance']} FCFA")
print(f"Moyenne mensuelle: {analytics['monthly_average_expenses']} FCFA")
```

### Alertes de budget
```python
# Exemple d'utilisation
from app.crud import get_budget_alerts

alerts = get_budget_alerts(db, user_id=1, month="2024-01")
for alert in alerts:
    if alert['status'] == 'exceeded':
        print(f"⚠️ {alert['category']} dépassé!")
```

## 🧪 Tests

### Lancer les tests
```bash
pytest
```

### Tests avec couverture
```bash
pytest --cov=app
```

## 🚀 Déploiement

### Docker (recommandé)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Variables d'environnement de production
```env
DATABASE_URL=postgresql://user:password@localhost/budget_malin
SECRET_KEY=votre_cle_secrete_tres_longue_et_complexe
DEBUG=False
ENVIRONMENT=production
```

## 🔧 Développement

### Ajouter un nouvel endpoint
1. Créez le schéma dans `schemas.py`
2. Ajoutez les fonctions CRUD dans `crud.py`
3. Créez l'endpoint dans le fichier API approprié
4. Testez avec la documentation interactive

### Exemple d'ajout d'endpoint
```python
# Dans app/api/transactions.py
@router.get("/statistics")
def get_statistics(current_user: User = Depends(get_current_active_user)):
    """Récupère les statistiques de l'utilisateur"""
    return {"message": "Statistiques"}
```

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation interactive : http://localhost:8000/docs
2. Vérifiez les logs de l'application
3. Testez les endpoints avec curl ou Postman

---

**Développé avec ❤️ pour une gestion de budget intelligente** 