import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import planeAnimation from "../assets/plane.json";
import PersonIcon from "@mui/icons-material/Person";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ShieldIcon from "@mui/icons-material/Shield";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Register() {
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const roleMap = { user: "traveler", agent: "travel_partner", admin: "admin" };
      const payload = { ...form, role: roleMap[role] || role };
      const res = await axios.post("/auth/register", payload);
      alert(res?.data?.message || "Account created!");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err?.response || err);
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err.message;
      alert(`Registration failed: ${msg}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(140deg, #0028ff, #00d2ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        p: 2,
      }}
    >
      {/* Lottie animation */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 0.3, y: 0 }}
        transition={{ duration: 1.2 }}
        style={{ position: "absolute", top: 20, width: 200 }}
      >
        <Lottie animationData={planeAnimation} loop />
      </motion.div>

      {/* Glow circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2 }}
        style={{
          width: 400,
          height: 400,
          background: "rgba(255,255,255,0.15)",
          borderRadius: "50%",
          position: "absolute",
          bottom: -100,
          left: -100,
          filter: "blur(60px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Paper
          sx={{
            p: 4,
            width: 420,
            borderRadius: 5,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: "#fff", fontWeight: 900, mb: 2 }}
          >
            Create Your Account
          </Typography>

          {/* Role selection */}
          <ToggleButtonGroup
            fullWidth
            exclusive
            value={role}
            onChange={(e, val) => val && setRole(val)}
            sx={{ mb: 3 }}
          >
            <ToggleButton value="user" sx={{ color: "#fff" }}>
              <PersonIcon sx={{ mr: 1 }} /> Traveller
            </ToggleButton>
            <ToggleButton value="agent" sx={{ color: "#fff" }}>
              <BusinessCenterIcon sx={{ mr: 1 }} /> Agent
            </ToggleButton>
            <ToggleButton value="admin" sx={{ color: "#fff" }}>
              <ShieldIcon sx={{ mr: 1 }} /> Admin
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Full Name"
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#ddd" } }}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <TextField
            label="Email"
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#ddd" } }}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <TextField
            label="Password"
            fullWidth
            type="password"
            sx={{ mb: 3 }}
            InputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#ddd" } }}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{
              py: 1.4,
              borderRadius: 3,
              background: "#fff",
              color: "#0069ff",
              fontWeight: 700,
              mb: 2,
            }}
            onClick={handleRegister}
          >
            Register
          </Button>

          <Typography sx={{ color: "#fff", textAlign: "center" }}>
            Already registered?
            <span
              style={{ color: "#ffeb3b", marginLeft: 5, cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}
