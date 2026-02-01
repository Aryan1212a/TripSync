import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardIcon from "@mui/icons-material/Dashboard";

export default function Navbar(){
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleDashboardClick = () => {
    // Route to appropriate dashboard based on role
    if (user?.role === "travel_partner") {
      navigate("/agent/dashboard");
    } else if (user?.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: "blur(6px)", bgcolor: "rgba(255,255,255,0.6)" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap:1 }}>
          <FlightTakeoffIcon sx={{ color: "#007bff" }} />
          <Typography variant="h6" sx={{ fontWeight:700, cursor: "pointer" }} onClick={() => navigate("/")}>TripSync</Typography>
        </Box>
        <Box>
          <Button variant="text" onClick={() => navigate("/")}>Packages</Button>
          <Button variant="text">Hotels</Button>
          <Button variant="text">Flights</Button>
          {user ? (
            <Button
              variant="contained"
              color="primary"
              sx={{ ml: 2 }}
              startIcon={<DashboardIcon />}
             onClick={handleDashboardClick}
            >
              My Dashboard
            </Button>
          ) : (
            <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={() => navigate("/login")}>Sign In</Button>
          )}
          </Box>
        </Toolbar>
      </AppBar>
  );
}
