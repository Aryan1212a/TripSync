import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import planeAnimation from "../assets/plane.json";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();   // ✅ Use global login()

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", form);

      // Backend returns: { access_token, token_type, role, name? }
      const token = res.data?.access_token;
      const rawRole = res.data?.role;
      const roleMap = { agent: "travel_partner", user: "traveler", traveler: "traveler", travel_partner: "travel_partner", admin: "admin" };
      const normalizedRole = roleMap[rawRole] || rawRole;
      const name = res.data?.name || form.email.split('@')[0]; // Extract name from backend or email
      // Construct full user object with name and normalized role
      let user = res.data?.user || { name, role: normalizedRole, email: form.email };
      if (user && user.role) user.role = roleMap[user.role] || user.role;

      if (!token) {
        const detail = res.data?.detail || res.data?.message || "Invalid server response";
        alert(detail);
        return;
      }

      // Save to global Auth Context
      login(user, token);

      // Redirect based on role: agents and admins to dashboards, travelers to home
      if (user?.role === "travel_partner") {
        navigate("/agent/dashboard");
      } else if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        // Travelers stay on home page
        navigate("/");
      }

    } catch (err) {
      console.error("Login error:", err?.response || err);
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err.message || "Login failed";
      alert(msg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #5a00db, #9d00ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        p: 2,
      }}
    >
      {/* Floating Lottie Plane */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 0.25, y: 0 }}
        transition={{ duration: 1.2 }}
        style={{
          position: "absolute",
          top: 40,
          left: 20,
          width: 200,
        }}
      >
        <Lottie animationData={planeAnimation} loop />
      </motion.div>

      {/* Floating Light Blurred Orb */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8 }}
        style={{
          width: 350,
          height: 350,
          background: "rgba(255,255,255,0.15)",
          borderRadius: "50%",
          position: "absolute",
          bottom: -100,
          right: -100,
          filter: "blur(45px)",
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Paper
          sx={{
            p: 4,
            width: 380,
            borderRadius: 5,
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: "#fff", fontWeight: 800, mb: 3, textAlign: "center" }}
          >
            Welcome Back
          </Typography>

          {/* EMAIL */}
          <TextField
            label="Email"
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              style: { color: "#fff" },
            }}
            InputLabelProps={{ style: { color: "#ccc" } }}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* PASSWORD */}
          <TextField
            label="Password"
            type="password"
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#ccc" } }}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* LOGIN BUTTON */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              py: 1.4,
              borderRadius: 3,
              background: "linear-gradient(135deg,#ffffff,#f3e8ff)",
              color: "#6a00ff",
              fontWeight: 700,
              fontSize: "16px",
              mb: 2,
              boxShadow: "0 6px 16px rgba(255,255,255,0.3)",
              "&:hover": {
                background: "#fff",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 30px rgba(255,255,255,0.4)",
              },
            }}
            onClick={handleLogin}
          >
            Sign In
          </Button>

          {/* Google login */}
          <Button
            fullWidth
            variant="outlined"
            sx={{
              py: 1.2,
              borderRadius: 3,
              color: "#fff",
              borderColor: "rgba(255,255,255,0.6)",
              fontWeight: 600,
              mb: 1,
              backdropFilter: "blur(3px)",
              "&:hover": {
                borderColor: "#fff",
                background: "rgba(255,255,255,0.1)",
              },
            }}
            startIcon={<GoogleIcon sx={{ color: "#fff" }} />}
          >
            Sign in with Google
          </Button>

          {/* Register Link */}
          <Typography sx={{ color: "#fff", mt: 3, textAlign: "center" }}>
            Don’t have an account?
            <span
              style={{
                color: "#ffeb3b",
                cursor: "pointer",
                marginLeft: 6,
                fontWeight: 600,
              }}
              onClick={() => navigate("/register")}
            >
              Create one
            </span>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}
