#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "📦 Creating TripSync Frontend at $FRONTEND_DIR"
rm -rf "$FRONTEND_DIR"
mkdir -p "$FRONTEND_DIR"

cd "$PROJECT_ROOT"

echo "⚡ Downloading official Vite + React template..."
curl -L -o template.zip https://codeload.github.com/vitejs/vite/zip/refs/heads/main

echo "📦 Extracting..."
unzip -qq template.zip
rm -f template.zip

echo "🔧 Copying React template..."
cp -r vite-main/packages/create-vite/template-react "$FRONTEND_DIR"
rm -rf vite-main

cd "$FRONTEND_DIR"

# fix folder content placement
cp -r template-react/* .
rm -rf template-react

echo "📦 Installing base dependencies..."
npm install --silent

echo "🎨 Installing UI libraries..."
npm install \
  @mui/material \
  @mui/icons-material \
  @emotion/react \
  @emotion/styled \
  react-router-dom \
  axios \
  framer-motion \
  swiper \
  --silent

echo "🔧 Ensuring @vitejs/plugin-react exists..."
npm install @vitejs/plugin-react --save-dev --silent

echo "🛠️ Creating Vite config..."
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
})
EOF

echo "🎉 TripSync Frontend is ready!"
echo "➡ Run 'npm run dev' to start locally"



# --------------------------------------------
# 2. Install base dependencies
# --------------------------------------------
echo "📦 Installing base dependencies (react, vite)..."
npm install --silent

# --------------------------------------------
# 3. Install UI + Router + libs
# --------------------------------------------
echo "🎨 Installing UI libraries (MUI, Router, Axios, Motion, Swiper)..."
npm install \
  @mui/material \
  @mui/icons-material \
  @emotion/react \
  @emotion/styled \
  react-router-dom \
  framer-motion \
  axios \
  swiper \
  --silent


npm install @vitejs/plugin-react --save-dev --silent
# -----------------------------------------
# --------------------------------------------
echo "🎉 TripSync frontend installed successfully!"
echo "➡ Run: cd frontend && npm run dev"









echo "Dependencies installed."

# --------------------------------------------
# 2. Cleanup default files
# --------------------------------------------
rm -rf src/*
mkdir -p src/components src/pages src/services src/context src/assets src/hooks

# --------------------------------------------
# 3. main.jsx
# --------------------------------------------
cat > src/main.jsx <<'EOF'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
EOF

# --------------------------------------------
# 4. App.jsx
# --------------------------------------------
cat > src/App.jsx <<'EOF'
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PackageDetail from "./pages/PackageDetail";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";

import UserDashboard from "./pages/UserDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Header />
      <Routes>

        {/* PUBLIC PAGES */}
        <Route path="/" element={<Home />} />
        <Route path="/package/:id" element={<PackageDetail />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DASHBOARDS */}
        <Route path="/user/dashboard" 
               element={<ProtectedRoute role="traveler"><UserDashboard/></ProtectedRoute>} />

        <Route path="/agent/dashboard" 
               element={<ProtectedRoute role="travel_partner"><AgentDashboard/></ProtectedRoute>} />

        <Route path="/admin/dashboard" 
               element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>} />

      </Routes>
    </>
  );
}

export default App;
EOF

# --------------------------------------------
# 5. Auth Context
# --------------------------------------------
cat > src/context/AuthContext.jsx <<'EOF'
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("tripsync_user")) || null;
  });

  const login = (data) => {
    setUser(data);
    localStorage.setItem("tripsync_user", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tripsync_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
EOF

# --------------------------------------------
# 6. API Service Base
# --------------------------------------------
cat > src/services/api.js <<'EOF'
import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:8000/api",
});
EOF

# --------------------------------------------
# 7. Auth Service
# --------------------------------------------
cat > src/services/auth.js <<'EOF'
import { API } from "./api";

export const registerUser = async (payload) =>
  API.post("/auth/register", payload);

export const loginUser = async (payload) =>
  API.post("/auth/login", payload);
EOF

# --------------------------------------------
# 8. Package Service
# --------------------------------------------
cat > src/services/package.js <<'EOF'
import { API } from "./api";

export const getPackages = async (category) =>
  API.get("/packages", { params: { category } });

export const getPackageById = async (id) =>
  API.get(`/packages/${id}`);
EOF

# --------------------------------------------
# 9. Booking Service
# --------------------------------------------
cat > src/services/booking.js <<'EOF'
import { API } from "./api";

export const createBooking = async (token, data) =>
  API.post("/bookings", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMyBookings = async (token) =>
  API.get("/bookings/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
EOF

# --------------------------------------------
# 10. Components
# --------------------------------------------

# Header
cat > src/components/Header.jsx <<'EOF'
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AppBar, Toolbar, Button } from "@mui/material";

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <AppBar position="sticky" color="default" sx={{ p: 1 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Link to="/" style={{ textDecoration: "none", fontSize: 22, fontWeight: 700 }}>
          TripSync
        </Link>

        <div>
          {!user && (
            <>
              <Link to="/login"><Button>Login</Button></Link>
              <Link to="/register"><Button>Register</Button></Link>
            </>
          )}

          {user && (
            <>
              <Link to={`/${user.role}/dashboard`}><Button>Dashboard</Button></Link>
              <Button onClick={logout}>Logout</Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
EOF

# Banner
cat > src/components/Banner.jsx <<'EOF'
import React from "react";
import { Box } from "@mui/material";

export default function Banner() {
  return (
    <Box
      sx={{
        height: 300,
        backgroundImage:
          "url('https://images.unsplash.com/photo-1519125323398-675f0ddb6308')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: 2,
        mb: 3,
      }}
    ></Box>
  );
}
EOF

# Popular Slider
cat > src/components/PopularSlider.jsx <<'EOF'
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function PopularSlider({ popular }) {
  return (
    <Swiper slidesPerView={2} spaceBetween={10}>
      {popular.map((p) => (
        <SwiperSlide key={p.id}>
          <div style={{
            borderRadius: 10,
            overflow: "hidden",
            height: 150
          }}>
            <img src={p.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
EOF

# Package Card
cat > src/components/PackageCard.jsx <<'EOF'
import React from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function PackageCard({ item }) {
  return (
    <Link to={`/package/${item.id}`} style={{ textDecoration: "none" }}>
      <Card sx={{ mb: 2 }}>
        <CardMedia component="img" height="160" image={item.image} />
        <CardContent>
          <Typography variant="h6">{item.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {item.location}
          </Typography>
          <Typography variant="h6" color="primary">
            ₹ {item.price}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
EOF

# Protected Route
cat > src/components/ProtectedRoute.jsx <<'EOF'
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ role, children }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
EOF

# --------------------------------------------
# 11. PAGES
# --------------------------------------------

# Home.jsx
cat > src/pages/Home.jsx <<'EOF'
import React, { useEffect, useState } from "react";
import { getPackages } from "../services/package";
import Banner from "../components/Banner";
import PopularSlider from "../components/PopularSlider";
import PackageCard from "../components/PackageCard";
import { Container, Typography } from "@mui/material";

export default function Home() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    getPackages().then((res) => setPackages(res.data));
  }, []);

  const popular = packages.slice(0, 5);

  return (
    <Container sx={{ mt: 2 }}>
      <Banner />

      <Typography variant="h5" sx={{ mb: 1 }}>
        Popular Packages
      </Typography>
      <PopularSlider popular={popular} />

      <Typography variant="h5" sx={{ mt: 3 }}>
        All Packages
      </Typography>

      {packages.map((item) => (
        <PackageCard key={item.id} item={item} />
      ))}
    </Container>
  );
}
EOF

# Login.jsx
cat > src/pages/Login.jsx <<'EOF'
import React, { useState, useContext } from "react";
import { loginUser } from "../services/auth";
import { AuthContext } from "../context/AuthContext";
import { Container, TextField, Button, Typography } from "@mui/material";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async () => {
    try {
      const res = await loginUser(form);
      login({
        token: res.data.access_token,
        role: res.data.role,
      });
      window.location.href = "/";
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Login</Typography>

      <TextField 
        fullWidth label="Email"
        sx={{ mb: 2 }}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <TextField 
        fullWidth label="Password" type="password"
        sx={{ mb: 2 }}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <Button variant="contained" fullWidth onClick={handleSubmit}>
        Login
      </Button>
    </Container>
  );
}
EOF

# Register.jsx
cat > src/pages/Register.jsx <<'EOF'
import React, { useState } from "react";
import { registerUser } from "../services/auth";
import { Container, TextField, Button, Typography } from "@mui/material";

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "",
  });

  const handleSubmit = async () => {
    try {
      await registerUser({ ...form, role: "traveler" });
      alert("Registered successfully");
      window.location.href = "/login";
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Register</Typography>

      <TextField fullWidth label="Name" sx={{ mb: 2 }}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <TextField fullWidth label="Email" sx={{ mb: 2 }}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <TextField fullWidth label="Password" type="password" sx={{ mb: 2 }}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <Button variant="contained" fullWidth onClick={handleSubmit}>
        Register
      </Button>
    </Container>
  );
}
EOF

# PackageDetail.jsx
cat > src/pages/PackageDetail.jsx <<'EOF'
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPackageById } from "../services/package";
import { Container, Typography, Button } from "@mui/material";

export default function PackageDetail() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);

  useEffect(() => {
    getPackageById(id).then((res) => setPkg(res.data));
  }, [id]);

  if (!pkg) return <p>Loading...</p>;

  return (
    <Container sx={{ mt: 3 }}>
      <img src={pkg.image} width="100%" style={{ borderRadius: 10, marginBottom: 16 }} />

      <Typography variant="h4">{pkg.title}</Typography>
      <Typography variant="h6" color="text.secondary">{pkg.location}</Typography>

      <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
        ₹ {pkg.price}
      </Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>Highlights</Typography>
      {pkg.highlights.map((h) => <li key={h}>{h}</li>)}

      <Typography variant="h6" sx={{ mt: 3 }}>Itinerary</Typography>
      {pkg.itinerary.map((i) => <li key={i}>{i}</li>)}

      <Button variant="contained" fullWidth sx={{ mt: 4 }} component={Link} to={`/booking/${id}`}>
        Book Now
      </Button>
    </Container>
  );
}
EOF

# Booking.jsx
cat > src/pages/Booking.jsx <<'EOF'
import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Container, TextField, Button, Typography } from "@mui/material";

export default function Booking() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    date: "",
    persons: 1,
  });

  const proceed = () => {
    const details = {
      package_id: id,
      ...form
    };
    localStorage.setItem("booking_temp", JSON.stringify(details));
    window.location.href = "/payment";
  };

  if (!user) return <p>Please login first.</p>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Booking</Typography>

      <TextField
        fullWidth label="Date" type="date"
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />

      <TextField
        fullWidth label="Persons" type="number"
        sx={{ mb: 2 }}
        onChange={(e) => setForm({ ...form, persons: e.target.value })}
      />

      <Button variant="contained" fullWidth onClick={proceed}>
        Proceed to Payment
      </Button>
    </Container>
  );
}
EOF

# Payment.jsx
cat > src/pages/Payment.jsx <<'EOF'
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { createBooking } from "../services/booking";
import { Container, Typography, Button } from "@mui/material";

export default function Payment() {
  const { user } = useContext(AuthContext);

  const confirmPayment = async () => {
    const temp = JSON.parse(localStorage.getItem("booking_temp"));
    
    const payload = {
      ...temp,
      total: temp.persons * 1000  // demo calculation
    };

    try {
      await createBooking(user.token, payload);
      window.location.href = "/payment-success";
    } catch (err) {
      alert("Payment failed.");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Payment</Typography>

      <Typography sx={{ mt: 2 }}>
        Demo payment — press Pay Now to continue.
      </Typography>

      <Button variant="contained" fullWidth sx={{ mt: 3 }}
        onClick={confirmPayment}>
        Pay Now
      </Button>
    </Container>
  );
}
EOF

# PaymentSuccess.jsx
cat > src/pages/PaymentSuccess.jsx <<'EOF'
import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <Container sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4">🎉 Booking Confirmed!</Typography>

      <Typography sx={{ mt: 2 }}>Your trip is booked successfully.</Typography>

      <Button variant="contained" sx={{ mt: 3 }} component={Link} to="/">
        Go Home
      </Button>
    </Container>
  );
}
EOF

# Dashboards
cat > src/pages/UserDashboard.jsx <<'EOF'
import React, { useEffect, useState, useContext } from "react";
import { getMyBookings } from "../services/booking";
import { AuthContext } from "../context/AuthContext";
import { Container, Typography } from "@mui/material";

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    getMyBookings(user.token).then(res => setBookings(res.data));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">My Bookings</Typography>

      {bookings.map(b => (
        <div key={b.id} style={{ padding: 10, marginTop: 10, border: "1px solid #ccc", borderRadius: 10 }}>
          <b>{b.package_title}</b> ({b.date})  
          <br />
          Persons: {b.persons} | Total: ₹{b.total}
        </div>
      ))}
    </Container>
  );
}
EOF

cat > src/pages/AgentDashboard.jsx <<'EOF'
import React from "react";
import { Container, Typography } from "@mui/material";

export default function AgentDashboard() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Agent Dashboard</Typography>
      <p>Package creation & booking details can be added here.</p>
    </Container>
  );
}
EOF

cat > src/pages/AdminDashboard.jsx <<'EOF'
import React from "react";
import { Container, Typography } from "@mui/material";

export default function AdminDashboard() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Admin Dashboard</Typography>
      <p>Full system admin panel.</p>
    </Container>
  );
}
EOF

# --------------------------------------------
# DONE
# --------------------------------------------
echo "🎉 TripSync Frontend installed successfully!"
echo "➡ Run 'npm install' inside frontend if needed."
echo "➡ Start development server with 'npm run dev'"
