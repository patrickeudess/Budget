from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from . import models, schemas
from .auth import get_password_hash

# Fonctions CRUD pour les utilisateurs
def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if db_user:
        for field, value in user_update.dict(exclude_unset=True).items():
            setattr(db_user, field, value)
        db.commit()
        db.refresh(db_user)
    return db_user

# Fonctions CRUD pour les transactions
def create_transaction(db: Session, transaction: schemas.TransactionCreate, user_id: int) -> models.Transaction:
    db_transaction = models.Transaction(**transaction.dict(), user_id=user_id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def get_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.Transaction]:
    return db.query(models.Transaction).filter(models.Transaction.user_id == user_id).offset(skip).limit(limit).all()

def get_transaction(db: Session, transaction_id: int, user_id: int) -> Optional[models.Transaction]:
    return db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == user_id
    ).first()

def update_transaction(db: Session, transaction_id: int, transaction_update: schemas.TransactionUpdate, user_id: int) -> Optional[models.Transaction]:
    db_transaction = get_transaction(db, transaction_id, user_id)
    if db_transaction:
        for field, value in transaction_update.dict(exclude_unset=True).items():
            setattr(db_transaction, field, value)
        db.commit()
        db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, transaction_id: int, user_id: int) -> bool:
    db_transaction = get_transaction(db, transaction_id, user_id)
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
        return True
    return False

# Fonctions CRUD pour les budgets
def create_budget(db: Session, budget: schemas.BudgetCreate, user_id: int) -> models.Budget:
    db_budget = models.Budget(**budget.dict(), user_id=user_id)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def get_budgets(db: Session, user_id: int, month: str = None) -> List[models.Budget]:
    query = db.query(models.Budget).filter(models.Budget.user_id == user_id)
    if month:
        query = query.filter(models.Budget.month == month)
    return query.all()

def update_budget(db: Session, budget_id: int, budget_update: schemas.BudgetUpdate, user_id: int) -> Optional[models.Budget]:
    db_budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == user_id
    ).first()
    if db_budget:
        for field, value in budget_update.dict(exclude_unset=True).items():
            setattr(db_budget, field, value)
        db.commit()
        db.refresh(db_budget)
    return db_budget

def delete_budget(db: Session, budget_id: int, user_id: int) -> bool:
    db_budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == user_id
    ).first()
    if db_budget:
        db.delete(db_budget)
        db.commit()
        return True
    return False

# Fonctions CRUD pour les objectifs
def create_goal(db: Session, goal: schemas.GoalCreate, user_id: int) -> models.Goal:
    db_goal = models.Goal(**goal.dict(), user_id=user_id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_goals(db: Session, user_id: int) -> List[models.Goal]:
    return db.query(models.Goal).filter(models.Goal.user_id == user_id).all()

def get_goal(db: Session, goal_id: int, user_id: int) -> Optional[models.Goal]:
    return db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == user_id
    ).first()

def update_goal(db: Session, goal_id: int, goal_update: schemas.GoalUpdate, user_id: int) -> Optional[models.Goal]:
    db_goal = get_goal(db, goal_id, user_id)
    if db_goal:
        for field, value in goal_update.dict(exclude_unset=True).items():
            setattr(db_goal, field, value)
        db.commit()
        db.refresh(db_goal)
    return db_goal

def delete_goal(db: Session, goal_id: int, user_id: int) -> bool:
    db_goal = get_goal(db, goal_id, user_id)
    if db_goal:
        db.delete(db_goal)
        db.commit()
        return True
    return False

# Fonctions CRUD pour les catégories
def get_categories(db: Session) -> List[models.Category]:
    return db.query(models.Category).all()

def create_category(db: Session, category: schemas.CategoryCreate) -> models.Category:
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Fonctions d'analyse
def get_user_analytics(db: Session, user_id: int) -> Dict[str, Any]:
    """Obtenir les analyses pour un utilisateur"""
    # Calculer les totaux du mois en cours
    current_month = datetime.now().strftime("%Y-%m")
    
    # Revenus du mois
    total_revenues = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.type == "revenu",
        func.strftime("%Y-%m", models.Transaction.date) == current_month
    ).scalar() or 0
    
    # Dépenses du mois
    total_expenses = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.type == "depense",
        func.strftime("%Y-%m", models.Transaction.date) == current_month
    ).scalar() or 0
    
    # Solde
    balance = total_revenues - total_expenses
    
    # Taux d'épargne
    savings_rate = (balance / total_revenues * 100) if total_revenues > 0 else 0
    
    # Top catégories de dépenses
    top_expense_categories = db.query(
        models.Transaction.category,
        func.sum(models.Transaction.amount).label('total')
    ).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.type == "depense",
        func.strftime("%Y-%m", models.Transaction.date) == current_month
    ).group_by(models.Transaction.category).order_by(func.sum(models.Transaction.amount).desc()).limit(5).all()
    
    # Tendances mensuelles (6 derniers mois)
    monthly_trends = []
    for i in range(6):
        month = (datetime.now() - timedelta(days=30*i)).strftime("%Y-%m")
        month_revenues = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.user_id == user_id,
            models.Transaction.type == "revenu",
            func.strftime("%Y-%m", models.Transaction.date) == month
        ).scalar() or 0
        
        month_expenses = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.user_id == user_id,
            models.Transaction.type == "depense",
            func.strftime("%Y-%m", models.Transaction.date) == month
        ).scalar() or 0
        
        monthly_trends.append({
            "month": month,
            "revenues": month_revenues,
            "expenses": month_expenses,
            "balance": month_revenues - month_expenses
        })
    
    return {
        "total_revenues": total_revenues,
        "total_expenses": total_expenses,
        "balance": balance,
        "savings_rate": savings_rate,
        "top_expense_categories": [
            {"category": cat.category, "total": float(total)} 
            for cat, total in top_expense_categories
        ],
        "monthly_trends": monthly_trends
    }

def get_budget_alerts(db: Session, user_id: int, month: str = None) -> List[Dict[str, Any]]:
    """Obtenir les alertes de budget pour un utilisateur"""
    if not month:
        month = datetime.now().strftime("%Y-%m")
    
    alerts = []
    
    # Récupérer tous les budgets de l'utilisateur pour le mois
    budgets = get_budgets(db, user_id, month)
    
    for budget in budgets:
        # Calculer les dépenses pour cette catégorie
        spent_amount = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.user_id == user_id,
            models.Transaction.category == budget.category,
            models.Transaction.type == "depense",
            func.strftime("%Y-%m", models.Transaction.date) == month
        ).scalar() or 0
        
        # Calculer le pourcentage utilisé
        percentage = (spent_amount / budget.amount * 100) if budget.amount > 0 else 0
        
        # Déterminer le statut
        if percentage > 100:
            status = "exceeded"
        elif percentage > 80:
            status = "warning"
        else:
            status = "good"
        
        alerts.append({
            "category": budget.category,
            "budget_amount": budget.amount,
            "spent_amount": spent_amount,
            "percentage": percentage,
            "status": status
        })
    
    return alerts 