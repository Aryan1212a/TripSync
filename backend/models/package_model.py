from pydantic import BaseModel, Field
from typing import List, Optional

class PackageBase(BaseModel):
    title: str
    description: str
    location: str
    price: float
    days: int
    category: str = "packages"
    image: Optional[str] = None
    offers: List[str] = []
    inclusions: List[str] = []
    highlights: List[str] = []
    itinerary: List[str] = []
    gallery: List[str] = []
    status: str = "approved"  # approved, pending, rejected

class PackageCreate(PackageBase):
    created_by: Optional[str] = None
    status: str = "pending"  # New agent packages are pending by default

class PackageUpdate(PackageBase):
    pass
