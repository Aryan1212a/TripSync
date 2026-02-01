import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";

import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { motion } from "framer-motion";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingPersons, setBookingPersons] = useState(1);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    async function fetchPackage() {
      try {
        // Try API first
        const res = await api.get(`/packages/${id}`);
        setPkg(res.data);
      } catch (apiErr) {
        console.error("Error fetching package from API:", apiErr);
        
        // Fallback to localStorage approved packages
        try {
          const stored = localStorage.getItem("admin_approved_packages");
          if (stored) {
            const approvedPackages = JSON.parse(stored);
            const found = approvedPackages.find((p) => p.id === id);
            if (found) {
              setPkg({
                ...found,
                _id: found.id,
                image: found.image_url || "https://via.placeholder.com/400x300?text=Travel+Package",
                location: found.travel_destination || "Destination",
                description: found.desc || found.travel_plans || "Premium travel experience",
                rating: 4.5,
                reviews: 120,
              });
            }
          }
        } catch (storageErr) {
          console.error("Error fetching from localStorage:", storageErr);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [id]);

  const openBookingDialog = () => {
    if (!user) {
      setSnack({ open: true, msg: "Please log in to book a package", severity: "warning" });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    setBookingDate("");
    setBookingPersons(1);
    setBookingOpen(true);
  };

  const closeBookingDialog = () => setBookingOpen(false);

  const confirmBooking = () => {
    if (!bookingDate) {
      setSnack({ open: true, msg: "Please select a travel date", severity: "warning" });
      return;
    }

    const total = pkg.price * Number(bookingPersons || 1);
    const newBooking = {
      id: `${pkg._id}_${Date.now()}`,
      package_id: pkg._id,
      package_title: pkg.title,
      date: bookingDate,
      persons: Number(bookingPersons),
      total,
      created_at: new Date().toISOString(),
    };

    // Save to localStorage (demo - one booking per user)
    const storageKey = user?.email ? `ts_bookings_${user.email}` : "ts_bookings_guest";
    try {
      localStorage.setItem(storageKey, JSON.stringify([newBooking]));
      setSnack({ open: true, msg: "Booking saved! View in My Dashboard", severity: "success" });
      setBookingOpen(false);
    } catch (e) {
      console.error("Failed saving booking:", e);
      setSnack({ open: true, msg: "Booking failed", severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          color: "#7c3aed",
        }}
      >
        Loading package details...
      </Box>
    );
  }

  if (!pkg) {
    return (
      <Box sx={{ textAlign: "center", mt: 8, color: "#7c3aed" }}>
        <Typography variant="h5" fontWeight={700}>
          Package Not Found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 0, pb: 10, backgroundColor: "#faf5ff" }}>
      {/* ===================== HEADER BANNER ===================== */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Box
          sx={{
            height: "420px",
            backgroundImage: `url(${pkg.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "0 0 32px 32px",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))",
              borderRadius: "0 0 32px 32px",
            }}
          />
        </Box>
      </motion.div>

      <Grid container spacing={3} sx={{ mt: 4, px: { xs: 2, md: 5 } }}>
        {/* ===================== LEFT COLUMN ===================== */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: "20px",
              background: "white",
              boxShadow: "0px 12px 30px rgba(124, 58, 237, 0.15)",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <LocationOnIcon sx={{ color: "#7c3aed" }} />
              <Typography variant="h6" fontWeight={600} sx={{ color: "#7c3aed" }}>
                {pkg.location}
              </Typography>
            </Stack>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                mb: 2,
                color: "#1e1b4b",
                background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {pkg.title}
            </Typography>

            {pkg.rating && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                <Chip
                  icon={<StarIcon />}
                  label={`${pkg.rating} ★`}
                  sx={{
                    backgroundColor: "#d8b4fe",
                    color: "#6d28d9",
                    fontWeight: 700,
                  }}
                />
                <Typography sx={{ color: "#6b7280" }}>
                  {pkg.reviews || 128} reviews
                </Typography>
              </Stack>
            )}

            {/* DESCRIPTION */}
            <Typography
              variant="body1"
              sx={{
                color: "#4b5563",
                lineHeight: 1.7,
                fontSize: "16px",
                mb: 3,
              }}
            >
              {pkg.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* INCLUSIONS */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              What’s Included
            </Typography>

            <Grid container spacing={1}>
              {(pkg.inclusions || ["Hotels", "Flights", "Breakfast", "Sightseeing"]).map(
                (item, i) => (
                  <Grid item key={i}>
                    <Chip
                      label={item}
                      sx={{
                        backgroundColor: "#ede9fe",
                        color: "#5b21b6",
                        fontWeight: 600,
                      }}
                    />
                  </Grid>
                )
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* ===================== RIGHT COLUMN (BOOKING PANEL) ===================== */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Paper
              elevation={8}
              sx={{
                p: 4,
                borderRadius: "20px",
                position: "sticky",
                top: "100px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "white",
                boxShadow: "0 15px 40px rgba(124,58,237,0.4)",
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Starting From
              </Typography>

              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  mb: 3,
                  color: "white",
                  textShadow: "0 4px 15px rgba(0,0,0,0.2)",
                }}
              >
                ₹{pkg.price}
              </Typography>

              {pkg.discount && (
                <Chip
                  label={`${pkg.discount}% OFF Today`}
                  sx={{
                    mb: 3,
                    bgcolor: "white",
                    color: "#7c3aed",
                    fontWeight: 700,
                  }}
                />
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={openBookingDialog}
                sx={{
                  mt: 2,
                  py: 2,
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "16px",
                  backgroundColor: "white",
                  color: "#7c3aed",
                  boxShadow: "0 10px 25px rgba(255,255,255,0.4)",
                  "&:hover": {
                    backgroundColor: "#f5f3ff",
                    transform: "translateY(-3px)",
                  },
                  transition: "all 0.3s",
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Book Now
              </Button>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onClose={closeBookingDialog}>
        <DialogTitle>Book {pkg?.title}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 320, mt: 1 }}>
          <TextField label="Travel Date" type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Persons" type="number" value={bookingPersons} onChange={(e) => setBookingPersons(e.target.value)} inputProps={{ min: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>Total Price:</Typography>
            <Typography>₹{pkg ? pkg.price * bookingPersons : 0}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBookingDialog}>Cancel</Button>
          <Button onClick={confirmBooking} variant="contained" sx={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}>Confirm Booking</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
