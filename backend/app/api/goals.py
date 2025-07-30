from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_active_user
from .. import crud, schemas

router = APIRouter()

@router.post("/", response_model=schemas.Goal)
def create_goal(
    goal: schemas.GoalCreate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crée un nouvel objectif"""
    return crud.create_goal(db=db, goal=goal, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Goal])
def get_goals(
    active_only: bool = Query(True, description="Récupérer seulement les objectifs actifs"),
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Récupère les objectifs de l'utilisateur"""
    return crud.get_user_goals(db=db, user_id=current_user.id, active_only=active_only)

@router.get("/{goal_id}", response_model=schemas.Goal)
def get_goal(
    goal_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Récupère un objectif spécifique"""
    goal = db.query(crud.models.Goal).filter(
        crud.models.Goal.id == goal_id,
        crud.models.Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")
    
    return goal

@router.put("/{goal_id}", response_model=schemas.Goal)
def update_goal(
    goal_id: int,
    goal_update: schemas.GoalUpdate,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Met à jour un objectif"""
    # Vérifier que l'objectif appartient à l'utilisateur
    goal = db.query(crud.models.Goal).filter(
        crud.models.Goal.id == goal_id,
        crud.models.Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")
    
    return crud.update_goal(db=db, goal_id=goal_id, goal_update=goal_update)

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Supprime un objectif"""
    # Vérifier que l'objectif appartient à l'utilisateur
    goal = db.query(crud.models.Goal).filter(
        crud.models.Goal.id == goal_id,
        crud.models.Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")
    
    success = crud.delete_goal(db=db, goal_id=goal_id)
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")
    
    return {"message": "Objectif supprimé avec succès"} 