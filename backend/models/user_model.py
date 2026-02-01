from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    name: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    role: str = "traveler"     # traveler | travel_partner | admin

class UserInDB(BaseModel):
    id: Optional[str]
    name: str
    email: EmailStr
    role: str
