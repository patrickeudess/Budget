from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_active_user
from .. import crud, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Category])
def get_categories(
    category_type: Optional[str] = Query(None, description="Type de catégorie: 'revenu' ou 'depense'"),
    db: Session = Depends(get_db)
):
    """Récupère toutes les catégories disponibles"""
    return crud.get_categories(db=db, category_type=category_type)

@router.post("/", response_model=schemas.Category)
def create_category(
    category: schemas.CategoryCreate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crée une nouvelle catégorie (admin seulement)"""
    # Ici vous pourriez ajouter une vérification pour les droits admin
    return crud.create_category(db=db, category=category) 