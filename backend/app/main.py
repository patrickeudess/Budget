from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import Base
from .config import settings
from .api import auth, transactions, budgets, goals, categories

# Créer les tables de la base de données
Base.metadata.create_all(bind=engine)

# Créer l'application FastAPI
app = FastAPI(
    title=settings.app_name,
    description="API pour l'application Mon Budget Malin",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routers
app.include_router(auth.router, prefix="/auth", tags=["authentification"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
app.include_router(goals.router, prefix="/goals", tags=["objectifs"])
app.include_router(categories.router, prefix="/categories", tags=["catégories"])

@app.get("/")
def read_root():
    """Point d'entrée de l'API"""
    return {
        "message": "Bienvenue sur l'API Mon Budget Malin",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    """Point de terminaison pour vérifier la santé de l'API"""
    return {"status": "healthy", "message": "API opérationnelle"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 