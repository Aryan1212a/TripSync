from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="TripSync Backend API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
