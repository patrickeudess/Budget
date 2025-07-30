from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_active_user
from .. import crud, schemas

router = APIRouter()

@router.post("/", response_model=schemas.Budget)
def create_budget(
    budget: schemas.BudgetCreate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crée un nouveau budget"""
    return crud.create_budget(db=db, budget=budget, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Budget])
def get_budgets(
    month: Optional[str] = None,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Récupère les budgets de l'utilisateur"""
    return crud.get_user_budgets(db=db, user_id=current_user.id, month=month)

@router.put("/{budget_id}", response_model=schemas.Budget)
def update_budget(
    budget_id: int,
    budget_update: schemas.BudgetUpdate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Met à jour un budget"""
    # Vérifier que le budget appartient à l'utilisateur
    budget = db.query(crud.models.Budget).filter(
        crud.models.Budget.id == budget_id,
        crud.models.Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(status_code=404, detail="Budget non trouvé")
    
    return crud.update_budget(db=db, budget_id=budget_id, budget_update=budget_update)

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Supprime un budget"""
    # Vérifier que le budget appartient à l'utilisateur
    budget = db.query(crud.models.Budget).filter(
        crud.models.Budget.id == budget_id,
        crud.models.Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(status_code=404, detail="Budget non trouvé")
    
    success = crud.delete_budget(db=db, budget_id=budget_id)
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")
    
    return {"message": "Budget supprimé avec succès"}

@router.get("/alerts")
def get_budget_alerts(
    month: str = Query(..., description="Mois au format YYYY-MM"),
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Récupère les alertes de budget pour un mois donné"""
    return crud.get_budget_alerts(db=db, user_id=current_user.id, month=month) 