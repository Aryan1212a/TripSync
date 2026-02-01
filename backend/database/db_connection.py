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
