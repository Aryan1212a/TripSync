from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from database.db_connection import users_col
from passlib.context import CryptContext
from utils.jwt_helper import create_access_token

router = APIRouter()

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

# --------------------------
# SCHEMAS
# --------------------------
class RegisterSchema(BaseModel):
    name: str
    email: str
    password: str
    role: str = "traveler"    # traveler | travel_partner | admin

class LoginSchema(BaseModel):
    email: str
    password: str

# --------------------------
# HELPERS
# --------------------------
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed):
    return pwd_context.verify(plain_password, hashed)
# --------------------------
# REGISTER
# --------------------------
@router.post("/register")
def register(payload: RegisterSchema):
    existing = users_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password": get_password_hash(payload.password),
        "role": payload.role
    }

    users_col.insert_one(user_doc)

    return {"message": "User registered successfully"}

# --------------------------
# LOGIN
# --------------------------
@router.post("/login")
def login(payload: LoginSchema):
    user = users_col.find_one({"email": payload.email})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "email": user["email"],
        "role": user["role"],
        "name": user["name"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user["name"],
        "email": user["email"]
    }
