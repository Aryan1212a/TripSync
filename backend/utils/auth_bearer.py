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
