#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)/.."
# If invoked from scripts folder, adjust
if [ -d "./.." ] && [ -d "../backend" ]; then
  # called from scripts when project already exists - still ok
  :
fi

BACKEND_DIR="$(pwd)/../backend"
echo "Creating backend in: $BACKEND_DIR"

mkdir -p "$BACKEND_DIR"
cd "$BACKEND_DIR"

echo "Creating folders..."
mkdir -p database models routes utils

echo "Writing app.py..."
cat > app.py <<'PY' 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="TripSync Backend API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import Routes
from routes import auth_routes, package_routes, booking_routes, external_routes, admin_routes

# Mount Routes
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Auth"])
app.include_router(package_routes.router, prefix="/api/packages", tags=["Packages"])
app.include_router(booking_routes.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(external_routes.router, prefix="/api/external", tags=["External APIs"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
def root():
    return {"message": "TripSync Backend Running"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
PY

echo "Writing .env..."
cat > .env <<'ENV'
# MongoDB connection from Docker compose
MONGO_URI=mongodb://root:root123@mongo:27017/tripsync?authSource=admin

# JWT settings
JWT_SECRET=super_secret_change_me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# External API keys
OPENWEATHER_KEY=
OPENTRIPMAP_KEY=
ENV

echo "Writing requirements.txt..."
cat > requirements.txt <<'REQ'
fastapi
uvicorn
pymongo
python-jose[cryptography]
passlib[bcrypt]
python-dotenv
requests
python-multipart
REQ

echo "Writing Dockerfile..."
cat > Dockerfile <<'DF'
FROM python:3.10

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
DF

echo "Writing database/db_connection.py..."
cat > database/db_connection.py <<'DB'
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/tripsync")

client = MongoClient(MONGO_URI)

# Get database (if name not provided, fallback)
try:
    db = client.get_default_database()
    if db is None:
        db = client["tripsync"]
except:
    db = client["tripsync"]

# Collections
users_col = db["users"]
packages_col = db["packages"]
bookings_col = db["bookings"]
DB

echo "Writing models/user_model.py..."
cat > models/user_model.py <<'UM'
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
UM

echo "Writing models/package_model.py..."
cat > models/package_model.py <<'PM'
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

class PackageCreate(PackageBase):
    created_by: Optional[str] = None

class PackageUpdate(PackageBase):
    pass
PM

echo "Writing models/booking_model.py..."
cat > models/booking_model.py <<'BM'
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
BM

echo "Writing utils/jwt_helper.py..."
cat > utils/jwt_helper.py <<'JH'
import os
from datetime import datetime, timedelta
from jose import jwt

JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_change_me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

def create_access_token(data: dict, expires_delta=ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    encoded = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded

def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return None
JH

echo "Writing utils/auth_bearer.py..."
cat > utils/auth_bearer.py <<'AB'
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from utils.jwt_helper import decode_token

class AuthBearer(HTTPBearer):
    async def __call__(self, request: Request):
        credentials = await super().__call__(request)
        token = credentials.credentials
        decoded = decode_token(token)
        if not decoded:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return decoded
AB

echo "Writing utils/role_checker.py..."
cat > utils/role_checker.py <<'RC'
from fastapi import Depends, HTTPException
from utils.auth_bearer import AuthBearer

def RoleChecker(roles: list):
    async def verify(user = Depends(AuthBearer())):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Not allowed")
        return user
    return verify
RC

echo "Writing utils/payment_mock.py..."
cat > utils/payment_mock.py <<'PMK'
import uuid

def process_dummy_payment(amount: float):
    # Always "successful" in demo mode
    return {
        "payment_id": str(uuid.uuid4()),
        "status": "success",
        "amount": amount
    }
PMK

echo "Writing routes/auth_routes.py..."
cat > routes/auth_routes.py <<'AR'
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from database.db_connection import users_col
from passlib.context import CryptContext
from utils.jwt_helper import create_access_token

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

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
        "role": user["role"]
    }
AR

echo "Writing routes/package_routes.py..."
cat > routes/package_routes.py <<'PR'
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from database.db_connection import packages_col
from models.package_model import PackageCreate, PackageUpdate
from utils.auth_bearer import AuthBearer
from utils.role_checker import RoleChecker

router = APIRouter()

# --------------------------
# Utility: convert Mongo docs
# --------------------------
def serialize_package(pkg):
    pkg["id"] = str(pkg["_id"])
    del pkg["_0"] if "_0" in pkg else None
    del pkg["_id"]
    return pkg

# --------------------------
# CREATE PACKAGE (Agents/Admin)
# --------------------------
@router.post("/", dependencies=[Depends(RoleChecker(["travel_partner", "admin"]))])
def create_package(payload: PackageCreate, user=Depends(AuthBearer())):
    data = payload.dict()

    # Add creator's email automatically
    data["created_by"] = user["email"]

    result = packages_col.insert_one(data)
    new_pkg = packages_col.find_one({"_id": result.inserted_id})
    
    return {"message": "Package created successfully", "package": serialize_package(new_pkg)}

# --------------------------
# GET ALL PACKAGES
# Supports:
#   - ?category=hotels
#   - ?q=goa   (search)
# --------------------------
@router.get("/")
def get_packages(
    category: str = Query(None),
    q: str = Query(None)
):
    query = {}

    if category:
        query["category"] = category

    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"location": {"$regex": q, "$options": "i"}},
        ]

    packages = list(packages_col.find(query))

    return [serialize_package(pkg) for pkg in packages]

# --------------------------
# GET SINGLE PACKAGE BY ID
# --------------------------
@router.get("/{package_id}")
def get_package(package_id: str):
    try:
        pkg = packages_col.find_one({"_id": ObjectId(package_id)})
    except:
        raise HTTPException(400, "Invalid package ID")

    if not pkg:
        raise HTTPException(404, "Package not found")

    return serialize_package(pkg)

# --------------------------
# UPDATE PACKAGE
# Agent/Admin only
# --------------------------
@router.put("/{package_id}", dependencies=[Depends(RoleChecker(["travel_partner", "admin"]))])
def update_package(package_id: str, payload: PackageUpdate, user=Depends(AuthBearer())):
    try:
        oid = ObjectId(package_id)
    except:
        raise HTTPException(400, "Invalid ID")

    existing = packages_col.find_one({"_id": oid})
    if not existing:
        raise HTTPException(404, "Package not found")

    # Agents can only edit their own packages
    if user["role"] == "travel_partner" and existing.get("created_by") != user["email"]:
        raise HTTPException(403, "You cannot edit this package")

    update_data = payload.dict()
    packages_col.update_one({"_id": oid}, {"$set": update_data})

    updated = packages_col.find_one({"_id": oid})
    return {"message": "Updated successfully", "package": serialize_package(updated)}

# --------------------------
# DELETE PACKAGE
# Admin only
# --------------------------
@router.delete("/{package_id}", dependencies=[Depends(RoleChecker(["admin"]))])
def delete_package(package_id: str):
    try:
        oid = ObjectId(package_id)
    except:
        raise HTTPException(400, "Invalid ID")

    res = packages_col.delete_one({"_id": oid})

    if res.deleted_count == 0:
        raise HTTPException(404, "Package not found")

    return {"message": "Package deleted"}
PR

echo "Writing routes/booking_routes.py..."
cat > routes/booking_routes.py <<'BR'
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime

from database.db_connection import bookings_col, packages_col, users_col
from models.booking_model import BookingCreate
from utils.auth_bearer import AuthBearer
from utils.role_checker import RoleChecker
from utils.payment_mock import process_dummy_payment

router = APIRouter()

# --------------------------
# Utility: Convert Mongo docs
# --------------------------
def serialize_booking(b):
    b["id"] = str(b["_id"])
    del b["_id"]
    return b


# --------------------------
# CREATE BOOKING (User)
# --------------------------
@router.post("/")
def create_booking(payload: BookingCreate, user=Depends(AuthBearer())):
    # Check package exists
    try:
        pkg = packages_col.find_one({"_id": ObjectId(payload.package_id)})
    except:
        raise HTTPException(400, "Invalid package ID")

    if not pkg:
        raise HTTPException(404, "Package not found")

    # Dummy payment simulation
    payment = process_dummy_payment(payload.total)

    booking_doc = {
        "package_id": payload.package_id,
        "user_email": user["email"],
        "date": payload.date,
        "persons": payload.persons,
        "total": payload.total,
        "payment_id": payment["payment_id"],
        "payment_status": payment["status"],
        "created_at": datetime.utcnow(),
        "package_title": pkg["title"],
        "package_location": pkg["location"]
    }

    result = bookings_col.insert_one(booking_doc)
    new_booking = bookings_col.find_one({"_id": result.inserted_id})

    return {
        "message": "Booking successful",
        "booking": serialize_booking(new_booking)
    }


# --------------------------
# GET MY BOOKINGS (User)
# --------------------------
@router.get("/my")
def my_bookings(user=Depends(AuthBearer())):
    bookings = list(bookings_col.find({ "user_email": user["email"] }))
    return [serialize_booking(b) for b in bookings]


# --------------------------
# GET ALL BOOKINGS (Admin)
# --------------------------
@router.get("/all", dependencies=[Depends(RoleChecker(["admin"]))])
def all_bookings():
    bookings = list(bookings_col.find())
    return [serialize_booking(b) for b in bookings]


# --------------------------
# AGENT: GET BOOKINGS FOR MY PACKAGES
# --------------------------
@router.get("/agent", dependencies=[Depends(RoleChecker(["travel_partner"]))])
def agent_bookings(user=Depends(AuthBearer())):
    # find packages created by the agent
    my_packages = list(packages_col.find({ "created_by": user["email"] }))
    my_package_ids = [str(p["_id"]) for p in my_packages]

    # all bookings for those packages
    bookings = list(bookings_col.find({ "package_id": { "$in": my_package_ids } }))
    return [serialize_booking(b) for b in bookings]
BR

echo "Writing routes/external_routes.py..."
cat > routes/external_routes.py <<'ER'
from fastapi import APIRouter, HTTPException
import os
import requests

router = APIRouter()

OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY", "")
OPENTRIPMAP_KEY = os.getenv("OPENTRIPMAP_KEY", "")

# --------------------------
# WEATHER API (OpenWeather)
# --------------------------
@router.get("/weather/{city}")
def weather(city: str):
    if not OPENWEATHER_KEY:
        raise HTTPException(500, "OpenWeather API key missing")

    url = (
        f"https://api.openweathermap.org/data/2.5/weather?q={city}"
        f"&appid={OPENWEATHER_KEY}&units=metric"
    )

    res = requests.get(url)
    if res.status_code != 200:
        raise HTTPException(404, "Weather data not found")

    data = res.json()

    return {
        "city": data["name"],
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "wind": data["wind"]["speed"],
        "weather": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"]
    }


# --------------------------
# SEARCH PLACES (OpenTripMap)
# --------------------------
@router.get("/places/search")
def search_places(city: str):
    if not OPENTRIPMAP_KEY:
        raise HTTPException(500, "OpenTripMap API key missing")

    # get geolocation of city
    geo_url = (
        f"https://api.opentripmap.com/0.1/en/places/geoname?"
        f"name={city}&apikey={OPENTRIPMAP_KEY}"
    )

    geo = requests.get(geo_url).json()

    if "lat" not in geo:
        raise HTTPException(404, "City not found")

    lat, lon = geo["lat"], geo["lon"]

    # get places nearby
    places_url = (
        f"https://api.opentripmap.com/0.1/en/places/radius?"
        f"radius=3000&lon={lon}&lat={lat}&rate=3&limit=15&apikey={OPENTRIPMAP_KEY}"
    )

    res = requests.get(places_url).json()

    attractions = []
    for p in res.get("features", []):
        props = p["properties"]
        attractions.append({
            "name": props.get("name"),
            "kind": props.get("kinds"),
            "rating": props.get("rate"),
            "distance_m": props.get("dist")
        })

    return attractions


# --------------------------
# GET PLACE DETAILS BY XID
# --------------------------
@router.get("/places/details/{xid}")
def place_details(xid: str):
    if not OPENTRIPMAP_KEY:
        raise HTTPException(500, "OpenTripMap API key missing")

    url = (
        f"https://api.opentripmap.com/0.1/en/places/xid/{xid}"
        f"?apikey={OPENTRIPMAP_KEY}"
    )

    res = requests.get(url)

    if res.status_code != 200:
        raise HTTPException(404, "Place not found")

    return res.json()
ER

echo "Writing routes/admin_routes.py..."
cat > routes/admin_routes.py <<'AD'
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from database.db_connection import users_col, packages_col, bookings_col
from utils.role_checker import RoleChecker
from utils.auth_bearer import AuthBearer

router = APIRouter()


# --------------------------
# Utility: Convert Mongo Docs
# --------------------------
def serialize_user(u):
    u["id"] = str(u["_id"])
    del u["_id"]
    del u["password"]   # never expose password
    return u

def serialize_item(i):
    i["id"] = str(i["_1"]) if "_1" in i else str(i["_id"])
    if "_id" in i:
        del i["_id"]
    return i


# ==========================
#   ADMIN ROUTES
# ==========================


# --------------------------
# GET ALL USERS
# --------------------------
@router.get("/users", dependencies=[Depends(RoleChecker(["admin"]))])
def get_users():
    users = list(users_col.find())
    return [serialize_user(u) for u in users]


# --------------------------
# CHANGE USER ROLE
# (e.g., promote to agent)
# --------------------------
@router.put("/users/{user_id}/role", dependencies=[Depends(RoleChecker(["admin"]))])
def change_role(user_id: str, role: str):
    if role not in ["traveler", "travel_partner", "admin"]:
        raise HTTPException(400, "Invalid role")

    try:
        oid = ObjectId(user_id)
    except:
        raise HTTPException(400, "Invalid ID")

    user = users_col.find_one({"_id": oid})
    if not user:
        raise HTTPException(404, "User not found")

    users_col.update_one({"_id": oid}, {"$set": {"role": role}})

    return {"message": "Role updated successfully"}


# --------------------------
# DELETE USER
# --------------------------
@router.delete("/users/{user_id}", dependencies=[Depends(RoleChecker(["admin"]))])
def delete_user(user_id: str):
    try:
        oid = ObjectId(user_id)
    except:
        raise HTTPException(400, "Invalid ID")

    result = users_col.delete_one({"_id": oid})

    if result.deleted_count == 0:
        raise HTTPException(404, "User not found")

    return {"message": "User removed"}


# --------------------------
# GET ALL PACKAGES
# --------------------------
@router.get("/packages", dependencies=[Depends(RoleChecker(["admin"]))])
def admin_packages():
    items = list(packages_col.find())
    return [serialize_item(i) for i in items]


# --------------------------
# GET ALL BOOKINGS
# --------------------------
@router.get("/bookings", dependencies=[Depends(RoleChecker(["admin"]))])
def admin_bookings():
    bookings = list(bookings_col.find())
    return [serialize_item(b) for b in bookings]


# --------------------------
# DELETE PACKAGE
# --------------------------
@router.delete("/packages/{package_id}", dependencies=[Depends(RoleChecker(["admin"]))])
def admin_delete_package(package_id: str):
    try:
        oid = ObjectId(package_id)
    except:
        raise HTTPException(400, "Invalid ID")

    result = packages_col.delete_one({"_id": oid})

    if result.deleted_count == 0:
        raise HTTPException(404, "Package not found")

    return {"message": "Package deleted"}
AD

echo "Writing routes/__init__.py..."
cat > routes/__init__.py <<'RI'
# Makes "routes" a Python package
RI

echo "Writing models/__init__.py..."
cat > models/__init__.py <<'MI'
# Makes "models" a Python package
MI

echo "Writing utils/__init__.py..."
cat > utils/__init__.py <<'UI'
# Makes "utils" a Python package
UI

echo "Writing database/__init__.py..."
cat > database/__init__.py <<'DI'
# Makes "database" a Python package
DI

echo "Writing seed_packages.py..."
cat > seed_packages.py <<'SEED'
from database.db_connection import packages_col
import uuid

# Clear existing demo packages
packages_col.delete_many({})  

demo_packages = [
    
    # HOLIDAY PACKAGES
    {
        "title": "Goa Beach Escape",
        "location": "Goa",
        "days": 4,
        "price": 12999,
        "category": "packages",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        "offers": ["Free breakfast", "Airport pickup", "2N Resort Stay"],
        "inclusions": ["Breakfast", "Airport Transfers", "Beach Tour", "Hotel Stay"],
        "highlights": ["Baga Beach", "Calangute", "Nightlife", "Water Sports"],
        "itinerary": [
            "Arrival & resort check-in",
            "North Goa sightseeing",
            "South Goa beaches & temples",
            "Checkout & airport drop"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1558980664-10ea5800f7d5",
            "https://images.unsplash.com/photo-1500375592092-40eb2168fd21"
        ],
        "created_by": "admin@tripsync.com"
    },
    {
        "title": "Manali Adventure Trip",
        "location": "Manali",
        "days": 5,
        "price": 10999,
        "category": "packages",
        "image": "https://images.unsplash.com/photo-1544739313-6fad2f9a0177",
        "offers": ["Snow Activities", "Free Photography", "Luxury Cottage"],
        "inclusions": ["Breakfast", "Cab", "Sightseeing"],
        "highlights": ["Solang Valley", "Sissu", "Hadimba Temple"],
        "itinerary": [
            "Arrival & cottage stay",
            "Solang valley activities",
            "Rohtang pass (if open)",
            "Old Manali exploration",
            "Departure"
        ],
        "gallery": [
            "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33"
        ],
        "created_by": "admin@tripsync.com"
    },
    {
        "title": "Kerala Backwaters Retreat",
        "location": "Alleppey",
        "days": 3,
        "price": 14999,
        "category": "packages",
        "image": "https://images.unsplash.com/photo-1524916207343-4b3b5d7ed1d9",
        "offers": ["Houseboat Stay", "Meal Included", "Candlelight Dinner"],
        "inclusions": ["Meals", "Houseboat", "Backwater Cruise"],
        "highlights": ["Backwaters", "Lakes", "Nature"],
        "itinerary": [
            "Arrival & houseboat check-in",
            "Backwater cruise",
            "Village tour",
            "Checkout"
        ],
        "gallery": [],
        "created_by": "admin@tripsync.com"
    },

    # FLIGHTS
    {
        "title": "Mumbai → Delhi Flight",
        "location": "Domestic Flight",
        "days": 1,
        "price": 2999,
        "category": "flights",
        "image": "https://images.unsplash.com/photo-1529074963764-98f45c47344b",
        "offers": ["Free seat selection"],
        "inclusions": ["Cabin baggage"],
        "highlights": ["Direct flight"],
        "itinerary": ["Departure", "Arrival"],
        "gallery": [],
        "created_by": "admin@tripsync.com"
    },
    {
        "title": "Bangalore → Goa Flight",
        "location": "Domestic Flight",
        "days": 1,
        "price": 1999,
        "category": "flights",
        "image": "https://images.unsplash.com/photo-1474302770737-324f48e2f52c",
        "offers": ["Free rescheduling"],
        "inclusions": ["Cabin baggage"],
        "highlights": ["Short duration"],
        "itinerary": ["Flight"],
        "gallery": [],
        "created_by": "admin@tripsync.com"
    },

    # HOTELS
    {
        "title": "Taj Resort & Spa",
        "location": "Goa",
        "days": 1,
        "price": 6999,
        "category": "hotels",
        "image": "https://images.unsplash.com/photo-1551888412-11fd8f7b5c72",
        "offers": ["Pool Access", "Breakfast Included"],
        "inclusions": ["King Room", "WiFi"],
        "highlights": ["Beachfront", "Luxury"],
        "itinerary": ["Check-in", "Stay", "Check-out"],
        "gallery": [],
        "created_by": "admin@tripsync.com"
    },
    {
        "title": "Oyo Premium Stay",
        "location": "Delhi",
        "days": 1,
        "price": 1499,
        "category": "hotels",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        "offers": ["Budget deal"],
        "inclusions": ["Room Service"],
        "highlights": ["Near Metro"],
        "itinerary": ["Stay"],
        "gallery": [],
        "created_by": "admin@tripsync.com"
    },

    # EXPERIENCES
    {
        "title": "Rishikesh River Rafting",
        "location": "Rishikesh",
        "days": 1,
        "price": 999,
        "category": "experiences",
        "image": "https://images.unsplash.com/photo-1542736667-069246bdbc94",
        "offers": ["Safety Gear Included"],
        "inclusions": ["Rafting Guide"],
        "highlights": ["Adventure", "Thrill"],
        "itinerary": ["Briefing", "Rafting", "Return"],
        "gallery": []
    },
    {
        "title": "Desert Safari",
        "location": "Jaisalmer",
        "days": 1,
        "price": 2499,
        "category": "experiences",
        "image": "https://images.unsplash.com/photo-1508264165352-258a6ca8190b",
        "offers": ["Camel Ride", "Dinner"],
        "inclusions": ["Guide"],
        "highlights": ["Dunes", "Sunset"],
        "itinerary": ["Pickup", "Safari", "Dinner"],
        "gallery": []
    },

    # MORE PACKAGES
    {
        "title": "Rajasthan Royal Tour",
        "location": "Jaipur-Udaipur-Jodhpur",
        "days": 6,
        "price": 16999,
        "category": "packages",
        "image": "https://images.unsplash.com/photo-1571401672009-fd1e5f2a1f1b",
        "offers": ["Heritage Hotels", "Guide"],
        "inclusions": ["Hotels", "Cab", "Breakfast"],
        "highlights": ["City Palace", "Fort", "Lake Pichola"],
        "itinerary": ["Jaipur", "Udaipur", "Jodhpur"],
        "gallery": []
    },
    {
        "title": "Darjeeling - Gangtok Bliss",
        "location": "Sikkim",
        "days": 5,
        "price": 15999,
        "category": "packages",
        "image": "https://images.unsplash.com/photo-1580981586385-8a40a7c4fa2f",
        "offers": ["Tea Gardens", "Lake Visit"],
        "inclusions": ["Cab", "Breakfast"],
        "highlights": ["MG Road", "Tiger Hill"],
        "itinerary": ["Gangtok", "Changu Lake", "Darjeeling"],
        "gallery": []
    },
    {
        "title": "Andaman Islands Premium",
        "location": "Port Blair",
        "days": 6,
        "price": 34999,
        "category": "packages",
        "image": "https://images.unsplash.com/photo-1558980664-1d3ce8462f7b",
        "offers": ["Cruise", "Snorkeling"],
        "inclusions": ["Breakfast", "Transfers"],
        "highlights": ["Havelock", "Elephant Beach"],
        "itinerary": ["Port Blair", "Havelock", "Neil"],
        "gallery": []
    },
    {
        "title": "Shimla - Kufri Getaway",
        "location": "Shimla",
        "days": 3,
        "price": 8999,
        "category": "packages",
        "image": "https://images.unsplash.com/photo-1582975632402-042cd4a4632a",
        "offers": ["Mall Road", "Snow"],
        "inclusions": ["Hotel", "Breakfast"],
        "highlights": ["Kufri", "Mall Road"],
        "itinerary": ["Shimla", "Kufri"],
        "gallery": []
    },
    {
        "title": "Ooty Hill Retreat",
        "location": "Ooty",
        "days": 3,
        "price": 11999,
        "category": "packages",
        "image": "https://images.unsplash.com/photo-1582978462787-5f85ad1522cf",
        "offers": ["Botanical Garden", "Boat Ride"],
        "inclusions": ["Hotel", "Cab"],
        "highlights": ["Coonoor", "Lake"],
        "itinerary": ["Arrival", "Tour", "Departure"],
        "gallery": []
    }
]

packages_col.insert_many(demo_packages)

print("🎉 Seeded 15 demo packages successfully!")
SEED

echo "Setting file permissions..."
chmod +x seed_packages.py || true

echo "Backend bootstrap complete."
echo "Files created in: $BACKEND_DIR"
echo "Run 'python seed_packages.py' inside backend to seed demo packages (or use the docker container)."
