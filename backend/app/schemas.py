from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Schémas pour les utilisateurs
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les transactions
class TransactionBase(BaseModel):
    amount: float
    type: str  # 'revenu' ou 'depense'
    category: str
    description: Optional[str] = None
    payment_method: Optional[str] = None
    date: datetime

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    date: Optional[datetime] = None

class Transaction(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schémas pour les budgets
class BudgetBase(BaseModel):
    category: str
    amount: float
    month: str  # Format: "YYYY-MM"

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    amount: Optional[float] = None
    month: Optional[str] = None

class Budget(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schémas pour les objectifs
class GoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: Optional[float] = 0
    deadline: Optional[datetime] = None
    description: Optional[str] = None

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[datetime] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Goal(GoalBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schémas pour les catégories
class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    type: str  # 'revenu' ou 'depense'

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    is_default: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour l'authentification
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Schémas pour les analyses
class AnalyticsSummary(BaseModel):
    total_revenues: float
    total_expenses: float
    balance: float
    monthly_average_revenues: float
    monthly_average_expenses: float
    top_categories: List[dict]
    monthly_trend: List[dict]

class BudgetAlert(BaseModel):
    category: str
    budget_amount: float
    spent_amount: float
    percentage: float
    status: str  # 'ok', 'warning', 'exceeded'

# Schémas pour les réponses API
class Message(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    detail: str 