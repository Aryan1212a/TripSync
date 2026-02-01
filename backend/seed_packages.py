from database.db_connection import packages_col
from datetime import datetime

# Clear existing packages
packages_col.delete_many({})
print("Cleared existing packages.")

packages = [
    {
        "title": "Dubai Premium Tour",
        "image": "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1600&q=80",
        "description": "5-star luxury stay, desert safari, marina cruise, and Dubai Frame included.",
        "price": 55000,
        "discount": 15,
        "category": "Luxury",
        "location": "Dubai, UAE",
        "rating": 4.8,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Maldives Honeymoon Escape",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        "description": "Romantic water villa, candlelight dinner, snorkeling and island hopping.",
        "price": 78000,
        "discount": 20,
        "category": "Honeymoon",
        "location": "Maldives",
        "rating": 4.9,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Bali Adventure Retreat",
        "image": "https://images.unsplash.com/photo-1537225228614-b4fad34a2b08?auto=format&fit=crop&w=1600&q=80",
        "description": "Temples, waterfalls, rice terraces, and Ubud cultural experiences.",
        "price": 42000,
        "discount": 10,
        "category": "Adventure",
        "location": "Bali, Indonesia",
        "rating": 4.7,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Paris Romantic Gateway",
        "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
        "description": "Eiffel Tower, Louvre Museum, Seine River cruise with fine dining.",
        "price": 99000,
        "discount": 12,
        "category": "Luxury",
        "location": "Paris, France",
        "rating": 4.9,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Thailand Family Package",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
        "description": "Phuket beaches, theme parks, elephant sanctuary, and Thai cultural shows.",
        "price": 38000,
        "discount": 18,
        "category": "Family",
        "location": "Phuket, Thailand",
        "rating": 4.6,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Switzerland Scenic Tour",
        "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
        "description": "Snow peaks, panoramic trains, and luxury alpine resorts.",
        "price": 150000,
        "discount": 10,
        "category": "Luxury",
        "location": "Interlaken, Switzerland",
        "rating": 4.8,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Singapore City Experience",
        "image": "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1600&q=80",
        "description": "Gardens by the Bay, Universal Studios, Marina Bay Sands skydeck.",
        "price": 52000,
        "discount": 14,
        "category": "City Tour",
        "location": "Singapore",
        "rating": 4.7,
        "created_at": datetime.utcnow()
    },
    {
        "title": "London Heritage Trail",
        "image": "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1600&q=80",
        "description": "London Eye, Buckingham Palace, museum passes, and Thames cruise.",
        "price": 105000,
        "discount": 8,
        "category": "Luxury",
        "location": "London, UK",
        "rating": 4.8,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Goa Beach Holiday",
        "image": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1600&q=80",
        "description": "Beachside resorts, watersports, nightlife, and island boat tour.",
        "price": 18000,
        "discount": 25,
        "category": "Beaches",
        "location": "Goa, India",
        "rating": 4.5,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Kashmir Paradise Retreat",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
        "description": "Gulmarg gondola, houseboat stay, Srinagar gardens, and Pahalgam valley.",
        "price": 32000,
        "discount": 17,
        "category": "Adventure",
        "location": "Kashmir, India",
        "rating": 4.7,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Kerala Backwaters Package",
        "image": "https://images.unsplash.com/photo-1537225228614-b4fad34a2b08?auto=format&fit=crop&w=1600&q=80",
        "description": "Houseboat cruise, tea plantations, cultural shows, and Ayurveda spa.",
        "price": 26000,
        "discount": 22,
        "category": "Relaxation",
        "location": "Kochi, Kerala",
        "rating": 4.8,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Tokyo Tech & Culture Tour",
        "image": "https://images.unsplash.com/photo-1540959375944-7049f642e9a0?auto=format&fit=crop&w=1600&q=80",
        "description": "Anime streets, shrines, cityscapes, and high-tech experiences.",
        "price": 135000,
        "discount": 15,
        "category": "Adventure",
        "location": "Tokyo, Japan",
        "rating": 4.9,
        "created_at": datetime.utcnow()
    },
    {
        "title": "New York Explorer Trip",
        "image": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        "description": "Times Square, Central Park, Manhattan cruise, and modern art museums.",
        "price": 120000,
        "discount": 12,
        "category": "City Tour",
        "location": "New York, USA",
        "rating": 4.8,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Sydney Opera House Adventure",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
        "description": "Sydney Opera House, Gold Coast beaches, and Great Barrier Reef diving.",
        "price": 145000,
        "discount": 10,
        "category": "Adventure",
        "location": "Sydney, Australia",
        "rating": 4.8,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Manali Mountain Escape",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
        "description": "Snowfall, adventure sports, Hadimba temple and Solang valley.",
        "price": 16000,
        "discount": 30,
        "category": "Beaches",
        "location": "Manali, India",
        "rating": 4.6,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Barcelona Gaudi Experience",
        "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
        "description": "Sagrada Familia, Park Guell, Gothic Quarter, and tapas tours.",
        "price": 75000,
        "discount": 16,
        "category": "Luxury",
        "location": "Barcelona, Spain",
        "rating": 4.7,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Rome Ancient History Tour",
        "image": "https://images.unsplash.com/photo-1552832860-cfb67165eaf0?auto=format&fit=crop&w=1600&q=80",
        "description": "Colosseum, Vatican Museums, Roman Forum, and Trevi Fountain.",
        "price": 82000,
        "discount": 13,
        "category": "Luxury",
        "location": "Rome, Italy",
        "rating": 4.8,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Iceland Northern Lights",
        "image": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1600&q=80",
        "description": "Aurora borealis viewing, ice caves, waterfalls, and geothermal spas.",
        "price": 125000,
        "discount": 11,
        "category": "Adventure",
        "location": "Reykjavik, Iceland",
        "rating": 4.9,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Vancouver Mountain & Ocean",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
        "description": "Mountain hiking, whale watching, Banff National Park, and coastal views.",
        "price": 110000,
        "discount": 14,
        "category": "Adventure",
        "location": "Vancouver, Canada",
        "rating": 4.7,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Bali Spa & Wellness Retreat",
        "image": "https://images.unsplash.com/photo-1537225228614-b4fad34a2b08?auto=format&fit=crop&w=1600&q=80",
        "description": "Balinese spa treatments, yoga classes, organic farm visits, and meditation.",
        "price": 44000,
        "discount": 19,
        "category": "Relaxation",
        "location": "Ubud, Bali",
        "rating": 4.8,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Rajasthan Palace Tour",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
        "description": "Taj Mahal, Hawa Mahal, desert safaris, and royal palace stays.",
        "price": 48000,
        "discount": 21,
        "category": "Luxury",
        "location": "Jaipur, India",
        "rating": 4.7,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Greece Island Hopping",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        "description": "Santorini sunsets, Mykonos nightlife, ancient ruins, and white sandy beaches.",
        "price": 95000,
        "discount": 18,
        "category": "Honeymoon",
        "location": "Greek Islands",
        "rating": 4.9,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Vietnam Cultural Tour",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
        "description": "Hanoi street food, Ha Long Bay cruise, Hoi An ancient town.",
        "price": 34000,
        "discount": 23,
        "category": "Adventure",
        "location": "Vietnam",
        "rating": 4.6,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Egypt Pharaohs Quest",
        "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=1600&q=80",
        "description": "Pyramids of Giza, Nile River cruise, Karnak temples, and Cairo museum.",
        "price": 88000,
        "discount": 15,
        "category": "Luxury",
        "location": "Cairo, Egypt",
        "rating": 4.7,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Norway Fjords Adventure",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
        "description": "Geirangerfjord, Sognefjord, Northern lights, and ski resorts.",
        "price": 140000,
        "discount": 12,
        "category": "Adventure",
        "location": "Oslo, Norway",
        "rating": 4.8,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Croatia Dalmatian Coast",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        "description": "Dubrovnik, Split, Hvar island, Adriatic Sea yacht sailing.",
        "price": 72000,
        "discount": 17,
        "category": "Honeymoon",
        "location": "Dubrovnik, Croatia",
        "rating": 4.8,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Morocco Desert Experience",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
        "description": "Sahara desert trekking, Marrakech medina, Atlas Mountains, Fez souks.",
        "price": 58000,
        "discount": 19,
        "category": "Adventure",
        "location": "Marrakech, Morocco",
        "rating": 4.7,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Vietnam Hanoi & Hue Tour",
        "image": "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=1600&q=80",
        "description": "Ancient temples, citadel visits, traditional water puppet shows.",
        "price": 30000,
        "discount": 24,
        "category": "Family",
        "location": "Hanoi, Vietnam",
        "rating": 4.5,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Peru Machu Picchu Trek",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
        "description": "Inca trails, Machu Picchu, Sacred Valley, Cusco colonial city.",
        "price": 130000,
        "discount": 13,
        "category": "Adventure",
        "location": "Cusco, Peru",
        "rating": 4.9,
        "created_at": datetime.utcnow(),
        "status": "approved"
    }
]

# Add status approved to all packages
for pkg in packages:
    if "status" not in pkg:
        pkg["status"] = "approved"

packages_col.insert_many(packages)
print("Inserted premium packages successfully!")
