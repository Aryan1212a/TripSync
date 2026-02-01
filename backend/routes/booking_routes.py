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
