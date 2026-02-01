from fastapi import Depends, HTTPException
from utils.auth_bearer import AuthBearer

def RoleChecker(roles: list):
    async def verify(user = Depends(AuthBearer())):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Not allowed")
        return user
    return verify
