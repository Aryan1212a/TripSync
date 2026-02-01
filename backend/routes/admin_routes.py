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
