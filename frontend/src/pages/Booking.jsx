import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Stack,
  Divider,
  Chip,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import { motion } from "framer-motion";
import api from "../api/axios";

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    travelers: 1,
    date: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/packages/${id}`);
        setPkg(res.data);
      } catch (err) {
        console.error("booking load error", err);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function makeBooking() {
    if (!form.fullname || !form.email || !form.date) {
      alert("Please fill all required fields.");
      return;
    }
    navigate(`/payment/${id}`, { state: { pkg, form } });
  }

  if (loading) {
    return (
      <Box sx={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h6" color="#7c3aed">Loading booking page…</Typography>
      </Box>
    );
  }

  if (!pkg) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="h5" fontWeight={700} color="#7c3aed">
          Package Not Found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#faf5ff", minHeight: "100vh", pb: 10 }}>
      {/* ================= HEADER BANNER ================= */}
      <Box
        sx={{
          height: 260,
          backgroundImage: `url(${pkg.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.2), #faf5ff)",
          }}
        />
      </Box>

      <Grid container spacing={4} sx={{ px: { xs: 2, md: 6 }, mt: -12 }}>
        {/* ================= LEFT FORM ================= */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: "24px",
              backgroundColor: "white",
              boxShadow: "0 12px 30px rgba(124, 58, 237, 0.12)",
            }}
          >
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: "#4c1d95" }}>
              Traveller Information
            </Typography>

            <Stack spacing={3}>
              <TextField
                label="Full Name"
                fullWidth
                value={form.fullname}
                onChange={(e) => update("fullname", e.target.value)}
                required
              />

              <TextField
                label="Email"
                fullWidth
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                type="email"
                required
              />

              <TextField
                label="Phone Number"
                fullWidth
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                type="tel"
              />

              <TextField
                label="Number of Travelers"
                type="number"
                fullWidth
                value={form.travelers}
                onChange={(e) => update("travelers", e.target.value)}
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Travel Date"
                fullWidth
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Stack>

            <Divider sx={{ my: 4 }} />

            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={makeBooking}
              sx={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                py: 1.8,
                fontWeight: 700,
                borderRadius: "14px",
                fontSize: "16px",
                boxShadow: "0 10px 25px rgba(124,58,237,0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #6d28d9, #5b21b6)",
                  transform: "translateY(-3px)",
                },
                transition: "all .3s",
              }}
            >
              Proceed to Payment
            </Button>
          </Paper>
        </Grid>

        {/* ================= RIGHT SUMMARY ================= */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <Paper
              elevation={10}
              sx={{
                p: 4,
                borderRadius: "24px",
                background: "white",
                boxShadow: "0 12px 35px rgba(124,58,237,0.25)",
                position: "sticky",
                top: "100px",
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ color: "#4c1d95", mb: 2 }}>
                Booking Summary
              </Typography>

              <img
                src={pkg.image}
                alt={pkg.title}
                style={{
                  width: "100%",
                  height: "180px",
                  borderRadius: "16px",
                  objectFit: "cover",
                  marginBottom: "15px",
                }}
              />

              <Typography variant="h6" fontWeight={700}>
                {pkg.title}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: "#7c3aed" }} />
                <Typography sx={{ color: "#6b7280" }}>{pkg.location}</Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Chip
                  icon={<StarIcon />}
                  label={`${pkg.rating} ★`}
                  sx={{
                    bgcolor: "#e9d5ff",
                    color: "#5b21b6",
                    fontWeight: 700,
                  }}
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                Base Price
              </Typography>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mt: 1,
                }}
              >
                ₹{pkg.price}
              </Typography>

              {pkg.discount && (
                <Chip
                  label={`${pkg.discount}% Off Today`}
                  sx={{
                    mt: 2,
                    bgcolor: "#7c3aed",
                    color: "white",
                    fontWeight: 700,
                  }}
                />
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
