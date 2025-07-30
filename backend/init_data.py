#!/usr/bin/env python3
"""
Script d'initialisation des données par défaut
"""

from app.database import SessionLocal, engine
from app.models import Base, Category, User
from app.crud import create_user
from app.schemas import UserCreate, CategoryCreate
from app.auth import get_password_hash

def init_database():
    """Initialise la base de données avec les données par défaut"""
    # Créer les tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Créer les catégories par défaut
        default_categories = [
            # Catégories de revenus
            {"name": "Salaire", "icon": "💰", "color": "#28a745", "type": "revenu", "is_default": True},
            {"name": "Bonus", "icon": "🎁", "color": "#ffc107", "type": "revenu", "is_default": True},
            {"name": "Freelance", "icon": "💼", "color": "#17a2b8", "type": "revenu", "is_default": True},
            {"name": "Investissement", "icon": "📈", "color": "#6f42c1", "type": "revenu", "is_default": True},
            
            # Catégories de dépenses
            {"name": "Nourriture", "icon": "🍽️", "color": "#dc3545", "type": "depense", "is_default": True},
            {"name": "Transport", "icon": "🚗", "color": "#fd7e14", "type": "depense", "is_default": True},
            {"name": "Logement", "icon": "🏠", "color": "#20c997", "type": "depense", "is_default": True},
            {"name": "Communication", "icon": "📱", "color": "#e83e8c", "type": "depense", "is_default": True},
            {"name": "Santé", "icon": "🏥", "color": "#6610f2", "type": "depense", "is_default": True},
            {"name": "Loisirs", "icon": "🎮", "color": "#343a40", "type": "depense", "is_default": True},
            {"name": "Vêtements", "icon": "👕", "color": "#6c757d", "type": "depense", "is_default": True},
            {"name": "Éducation", "icon": "📚", "color": "#28a745", "type": "depense", "is_default": True},
            {"name": "Divers", "icon": "📦", "color": "#6c757d", "type": "depense", "is_default": True},
        ]
        
        # Vérifier si les catégories existent déjà
        existing_categories = db.query(Category).all()
        if not existing_categories:
            print("Création des catégories par défaut...")
            for cat_data in default_categories:
                category = Category(**cat_data)
                db.add(category)
            db.commit()
            print(f"✅ {len(default_categories)} catégories créées")
        else:
            print(f"✅ {len(existing_categories)} catégories existent déjà")
        
        # Créer un utilisateur de test
        test_user = db.query(User).filter(User.username == "test").first()
        if not test_user:
            print("Création de l'utilisateur de test...")
            user_data = UserCreate(
                email="test@example.com",
                username="test",
                password="test123",
                full_name="Utilisateur de Test"
            )
            create_user(db=db, user=user_data)
            print("✅ Utilisateur de test créé (test/test123)")
        else:
            print("✅ Utilisateur de test existe déjà")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Initialisation de la base de données...")
    init_database()
    print("✅ Initialisation terminée!")
    print("\n📋 Informations de connexion:")
    print("   - Utilisateur: test")
    print("   - Mot de passe: test123")
    print("   - API: http://localhost:8000")
    print("   - Documentation: http://localhost:8000/docs") 