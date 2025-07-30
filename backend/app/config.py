from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Configuration de base
    app_name: str = "Mon Budget Malin API"
    debug: bool = True
    environment: str = "development"
    
    # Configuration de la base de données
    database_url: str = "sqlite:///./budget_malin.db"
    
    # Configuration de sécurité
    secret_key: str = "votre_cle_secrete_tres_longue_et_complexe_changez_la_en_production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Configuration CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080", 
        "http://127.0.0.1:8080",
        "http://127.0.0.1:3000"
    ]
    
    # Configuration Redis (optionnel)
    redis_url: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Instance globale des paramètres
settings = Settings() 