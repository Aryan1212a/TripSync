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
    pkg.pop("_0", None)
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
# GET PENDING PACKAGES (Admin only)
# Must come before /{package_id} route
# --------------------------
@router.get("/pending/all", dependencies=[Depends(RoleChecker(["admin"]))])
def get_pending_packages():
    packages = list(packages_col.find({"status": "pending"}))
    return [serialize_package(pkg) for pkg in packages]

# --------------------------
# GET ALL PACKAGES
# Supports:
#   - ?category=hotels
#   - ?q=goa   (search)
# Returns only approved packages for public users
# --------------------------
@router.get("/")
def get_packages(
    category: str = Query(None),
    q: str = Query(None)
):
    query = {"status": "approved"}  # Only show approved packages

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
# Admin can delete any package
# Agents can only delete their own pending packages
# --------------------------
@router.delete("/{package_id}", dependencies=[Depends(RoleChecker(["admin", "travel_partner"]))])
def delete_package(package_id: str, user=Depends(AuthBearer())):
    try:
        oid = ObjectId(package_id)
    except:
        raise HTTPException(400, "Invalid ID")

    existing = packages_col.find_one({"_id": oid})
    if not existing:
        raise HTTPException(404, "Package not found")

    # Agents can only delete their own pending packages
    if user["role"] == "travel_partner":
        if existing.get("created_by") != user["email"]:
            raise HTTPException(403, "You cannot delete this package")
        if existing.get("status") != "pending":
            raise HTTPException(403, "You can only delete pending packages")

    res = packages_col.delete_one({"_id": oid})

    if res.deleted_count == 0:
        raise HTTPException(404, "Package not found")

    return {"message": "Package deleted"}

# --------------------------
# APPROVE/REJECT PACKAGE
# Admin only
# --------------------------
@router.patch("/{package_id}/approve", dependencies=[Depends(RoleChecker(["admin"]))])
def approve_package(package_id: str):
    try:
        oid = ObjectId(package_id)
    except:
        raise HTTPException(400, "Invalid ID")

    packages_col.update_one({"_id": oid}, {"$set": {"status": "approved"}})
    updated = packages_col.find_one({"_id": oid})
    
    if not updated:
        raise HTTPException(404, "Package not found")
    
    return {"message": "Package approved", "package": serialize_package(updated)}

@router.patch("/{package_id}/reject", dependencies=[Depends(RoleChecker(["admin"]))])
def reject_package(package_id: str):
    try:
        oid = ObjectId(package_id)
    except:
        raise HTTPException(400, "Invalid ID")

    packages_col.update_one({"_id": oid}, {"$set": {"status": "rejected"}})
    updated = packages_col.find_one({"_id": oid})
    
    if not updated:
        raise HTTPException(404, "Package not found")
    
    return {"message": "Package rejected", "package": serialize_package(updated)}
