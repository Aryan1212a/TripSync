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
