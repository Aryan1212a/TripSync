from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookingCreate(BaseModel):
    package_id: str
    date: str
    persons: int
    total: float

class BookingInDB(BaseModel):
    id: Optional[str]
    package_id: str
    user_email: str
    date: str
    persons: int
    total: float
    created_at: datetime
