import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Care Coordination Platform Backend"
    VERSION: str = "1.0.0"
    
    # Database Settings
    DB_SERVER: str = os.getenv("DB_SERVER", "")
    DB_PORT: str = os.getenv("DB_PORT", "1433")
    DB_NAME: str = os.getenv("DB_NAME", "HealthcareDB")
    DB_USER: str = os.getenv("DB_USER", "sa")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_DRIVER: str = os.getenv("DB_DRIVER", "ODBC Driver 18 for SQL Server")
    
    # SQLite fallback path if SQL Server server is not specified
    SQLITE_DB_URL: str = "sqlite:///./healthcare.db"
    
    # JWT Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-in-production-ai-care-platform-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # AI Config
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    
    # Supabase Settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://iqslkpwesyqjvskmovln.supabase.co")
    SUPABASE_PUBLISHABLE_KEY: str = os.getenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_d55n-8f0Tmej2t4A9aW5Vg_qUxNeGFb")
    SUPABASE_SECRET_KEY: str = os.getenv("SUPABASE_SECRET_KEY", "your_supabase_secret_key_here")
    SUPABASE_JWKS_URL: str = os.getenv("SUPABASE_JWKS_URL", "https://iqslkpwesyqjvskmovln.supabase.co/auth/v1/.well-known/jwks.json")

    # Upload Storage Path
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

    @property
    def CLEAN_SUPABASE_URL(self) -> str:
        url = self.SUPABASE_URL or ""
        import re
        return re.sub(r"/rest/v1/?$", "", url).rstrip("/")

    @property
    def DATABASE_URL(self) -> str:
        env_db_url = os.getenv("DATABASE_URL")
        if env_db_url and env_db_url.strip():
            if env_db_url.startswith("postgres://"):
                return env_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
            if env_db_url.startswith("postgresql://") and not env_db_url.startswith("postgresql+"):
                return env_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return env_db_url
        if self.DB_SERVER and self.DB_SERVER.strip():
            # SQL Server ODBC connection string
            params = f"DRIVER={{{self.DB_DRIVER}}};SERVER={self.DB_SERVER},{self.DB_PORT};DATABASE={self.DB_NAME};UID={self.DB_USER};PWD={self.DB_PASSWORD};TrustServerCertificate=yes"
            import urllib.parse
            return f"mssql+pyodbc:///?odbc_connect={urllib.parse.quote_plus(params)}"
        return self.SQLITE_DB_URL

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
