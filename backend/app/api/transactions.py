from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..auth import get_current_active_user
from .. import crud, schemas

router = APIRouter()

@router.post("/", response_model=schemas.Transaction)
def create_transaction(
    transaction: schemas.TransactionCreate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crée une nouvelle transaction"""
    return crud.create_transaction(db=db, transaction=transaction, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Transaction])
def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    category: Optional[str] = None,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Récupère les transactions de l'utilisateur avec filtres"""
    # Convertir les dates si fournies
    start_dt = None
    end_dt = None
    
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide pour start_date")
    
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide pour end_date")
    
    return crud.get_user_transactions(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        start_date=start_dt,
        end_date=end_dt,
        transaction_type=transaction_type,
        category=category
    )

@router.get("/{transaction_id}", response_model=schemas.Transaction)
def get_transaction(
    transaction_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Récupère une transaction spécifique"""
    transaction = crud.get_transaction(db=db, transaction_id=transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction non trouvée")
    return transaction

@router.put("/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(
    transaction_id: int,
    transaction_update: schemas.TransactionUpdate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Met à jour une transaction"""
    # Vérifier que la transaction appartient à l'utilisateur
    transaction = crud.get_transaction(db=db, transaction_id=transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction non trouvée")
    
    return crud.update_transaction(db=db, transaction_id=transaction_id, transaction_update=transaction_update)

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Supprime une transaction"""
    # Vérifier que la transaction appartient à l'utilisateur
    transaction = crud.get_transaction(db=db, transaction_id=transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction non trouvée")
    
    success = crud.delete_transaction(db=db, transaction_id=transaction_id)
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")
    
    return {"message": "Transaction supprimée avec succès"}

@router.get("/summary/analytics")
def get_transactions_analytics(
    months: int = Query(6, ge=1, le=24),
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Récupère les analyses des transactions"""
    return crud.get_user_analytics(db=db, user_id=current_user.id, months=months) 