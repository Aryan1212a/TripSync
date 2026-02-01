#!/usr/bin/env bash
set -euo pipefail

FRONTEND_DIR="$(pwd)/../frontend/src/assets"

echo "🎨 Creating TripSync assets directory at $FRONTEND_DIR"
mkdir -p "$FRONTEND_DIR/categories"
mkdir -p "$FRONTEND_DIR/banners"
mkdir -p "$FRONTEND_DIR/icons"
mkdir -p "$FRONTEND_DIR/packages"
mkdir -p "$FRONTEND_DIR/avatars"

cd "$FRONTEND_DIR"

# -----------------------------------------
# 1) MAIN LOGO
# -----------------------------------------
echo "🖼️ Downloading TripSync logo..."

curl -s -o tripsync-logo.png \
"https://svgshare.com/i/viW.svg"

# -----------------------------------------
# 2) CATEGORY ICONS
# -----------------------------------------
echo "🗂️ Adding category icons..."

curl -s -o categories/flights.png \
"https://cdn-icons-png.flaticon.com/512/817/817419.png"

curl -s -o categories/hotels.png \
"https://cdn-icons-png.flaticon.com/512/139/139899.png"

curl -s -o categories/packages.png \
"https://cdn-icons-png.flaticon.com/512/854/854894.png"

curl -s -o categories/experiences.png \
"https://cdn-icons-png.flaticon.com/512/1531/1531019.png"

curl -s -o categories/cabs.png \
"https://cdn-icons-png.flaticon.com/512/743/743131.png"

# -----------------------------------------
# 3) HOMEPAGE BANNERS
# -----------------------------------------
echo "🏞️ Downloading banner images..."

curl -s -o banners/banner1.jpg \
"https://images.unsplash.com/photo-1519125323398-675f0ddb6308"

curl -s -o banners/banner2.jpg \
"https://images.unsplash.com/photo-1507525428034-b723cf961d3e"

curl -s -o banners/banner3.jpg \
"https://images.unsplash.com/photo-1493558103817-58b2924bce98"

# -----------------------------------------
# 4) DUMMY PACKAGE IMAGES
# -----------------------------------------
echo "📦 Adding placeholder package images..."

curl -s -o packages/goa.jpg \
"https://images.unsplash.com/photo-1558980664-10ea5800f7d5"

curl -s -o packages/manali.jpg \
"https://images.unsplash.com/photo-1544739313-6fad2f9a0177"

curl -s -o packages/kerala.jpg \
"https://images.unsplash.com/photo-1524916207343-4b3b5d7ed1d9"

curl -s -o packages/rishikesh.jpg \
"https://images.unsplash.com/photo-1542736667-069246bdbc94"

curl -s -o packages/desert.jpg \
"https://images.unsplash.com/photo-1508264165352-258a6ca8190b"

curl -s -o packages/flight.jpg \
"https://images.unsplash.com/photo-1529074963764-98f45c47344b"

curl -s -o packages/hotel.jpg \
"https://images.unsplash.com/photo-1566073771259-6a8506099945"

curl -s -o packages/ooty.jpg \
"https://images.unsplash.com/photo-1582978462787-5f85ad1522cf"

# -----------------------------------------
# 5) USER AVATARS
# -----------------------------------------
echo "👤 Adding avatar icons..."

curl -s -o avatars/user.png \
"https://cdn-icons-png.flaticon.com/512/3135/3135715.png"

curl -s -o avatars/agent.png \
"https://cdn-icons-png.flaticon.com/512/1999/1999625.png"

curl -s -o avatars/admin.png \
"https://cdn-icons-png.flaticon.com/512/991/991952.png"

# -----------------------------------------
# DONE
# -----------------------------------------
echo "🎉 Assets installed successfully!"
echo "➡ Available in: frontend/src/assets/"
