import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppBar, Toolbar, Button } from "@mui/material";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user?.role === "travel_partner") {
      navigate("/agent/dashboard");
    } else if (user?.role === "traveler") {
      navigate("/user/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };

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
              <Button onClick={handleDashboardClick}>Dashboard</Button>
              <Button onClick={logout}>Logout</Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
