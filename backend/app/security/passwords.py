import hashlib
from passlib.context import CryptContext

# Use pbkdf2_sha256 or bcrypt for robust secure hashing without 72-byte truncation issues
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
