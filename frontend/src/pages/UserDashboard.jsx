import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";

const demoPackages = [
  {
    id: "pkg_basic",
    title: "Purple Hills Weekend",
    desc: "2 nights getaway to the serene purple hills.",
    price: 4999,
    img: "/src/assets/plane.json",
  },
  {
    id: "pkg_deluxe",
    title: "Lavender Coast Experience",
    desc: "3 nights, guided tours, and sunset cruises.",
    price: 8999,
    img: "/src/assets/plane.json",
  },
  {
    id: "pkg_premium",
    title: "Royal Violet Escape",
    desc: "5 nights luxury package with spa and dining.",
    price: 14999,
    img: "/src/assets/plane.json",
  },
];

export default function UserDashboard() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [persons, setPersons] = useState(1);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const neon = {
    bg: "radial-gradient(1100px 600px at 15% 0%, rgba(124, 92, 255, 0.2), transparent 60%), radial-gradient(1000px 500px at 85% 10%, rgba(34, 211, 238, 0.18), transparent 55%), #0b0f1f",
    card: "rgba(15, 23, 42, 0.72)",
    border: "1px solid rgba(124, 92, 255, 0.35)",
    glow: "0 12px 30px rgba(124, 92, 255, 0.25)",
    text: "#e5e7eb",
    muted: "#94a3b8",
  };

  // Generate storage key based on user email or fallback to guest
  const getStorageKey = () => {
    if (!user) return "ts_bookings_guest";
    return user.email ? `ts_bookings_${user.email}` : "ts_bookings_guest";
  };

  useEffect(() => {
    // Load bookings from localStorage whenever user changes
    const storageKey = getStorageKey();
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setBookings(Array.isArray(parsed) ? parsed : []);
      } else {
        setBookings([]);
      }
    } catch (e) {
      console.error("Failed loading bookings:", e);
      setBookings([]);
    }
  }, [user]);

  const openBooking = (pkg) => {
    setSelected(pkg);
    setDate("");
    setPersons(1);
    setOpen(true);
  };

  const closeBooking = () => setOpen(false);

  const confirmBooking = async () => {
    if (!date) {
      setSnack({ open: true, msg: "Please select travel date", severity: "warning" });
      return;
    }

    const total = selected.price * Number(persons || 1);
    const newBooking = {
      id: `${selected.id}_${Date.now()}`,
      package_id: selected.id,
      package_title: selected.title,
      date,
      persons: Number(persons),
      total,
      created_at: new Date().toISOString(),
    };

    // Only keep one booking per user: attempt to persist to backend, else fallback to localStorage
    let finalBooking = newBooking;
    if (token) {
      try {
        const { createBooking } = await import("../services/booking");
        const res = await createBooking(token, newBooking);
        // prefer backend response if provided
        finalBooking = res?.data || newBooking;
        setSnack({ open: true, msg: "Booking saved to your account", severity: "success" });
      } catch (apiErr) {
        console.error("Booking API failed, falling back to localStorage:", apiErr?.response || apiErr);
        setSnack({ open: true, msg: "Booking saved locally (offline)", severity: "warning" });
      }
    } else {
      setSnack({ open: true, msg: "Booking saved locally (guest)", severity: "info" });
    }

    // Overwrite existing bookings so only one remains
    const updated = [finalBooking];
    setBookings(updated);
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed saving booking:", e);
    }

    setOpen(false);
  };

  const cancelBooking = (bookingId) => {
    const updated = bookings.filter((b) => b.id !== bookingId);
    setBookings(updated);
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSnack({ open: true, msg: "Booking cancelled successfully", severity: "success" });
    } catch (e) {
      console.error("Failed cancelling booking:", e);
      setSnack({ open: true, msg: "Failed to cancel booking", severity: "error" });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: neon.bg, py: { xs: 6, md: 8 } }}>
      <Container sx={{ mt: 0 }}>
      {!user ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" sx={{ color: "#22d3ee", fontWeight: 800 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <div>
              <Typography variant="h4" sx={{ color: "#7c5cff", fontWeight: 900, letterSpacing: "-0.02em" }}>
                Your Trips
              </Typography>
              <Typography sx={{ color: neon.muted }}>Quick access to your bookings and demo packages</Typography>
            </div>
            <Chip label={user?.name || "Guest"} sx={{ bgcolor: "#22d3ee", color: "#0b0f1f", fontWeight: 800 }} />
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: "#a78bfa", fontWeight: 900 }}>
            Explore Packages
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {demoPackages.map((pkg) => (
              <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                  <Card sx={{ height: "100%", bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: neon.text }}>{pkg.title}</Typography>
                      <Typography sx={{ color: neon.muted, mb: 2 }}>{pkg.desc}</Typography>
                      <Typography sx={{ fontWeight: 800, color: "#22d3ee" }}>₹{pkg.price}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => openBooking(pkg)} sx={{ color: "#0b0f1f", bgcolor: "#22d3ee", fontWeight: 800, '&:hover':{ bgcolor:'#38bdf8' }}}>Book Now</Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h6" sx={{ mb: 2, color: "#22d3ee", fontWeight: 900 }}>
            My Bookings
          </Typography>

          <Grid container spacing={2}>
            {bookings.length === 0 && (
              <Grid item xs={12}>
                <Typography sx={{ color: neon.muted }}>No bookings yet — try booking a demo package above.</Typography>
              </Grid>
            )}

            {bookings.map((b) => (
              <Grid item xs={12} md={6} key={b.id}>
                <Card sx={{ borderRadius: 2, bgcolor: neon.card, border: neon.border, boxShadow: neon.glow }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: neon.text }}>{b.package_title}</Typography>
                    <Typography sx={{ color: neon.muted }}>{new Date(b.date).toLocaleDateString()}</Typography>
                    <Box sx={{ mt: 1, display: "flex", gap: 2, alignItems: "center" }}>
                      <Chip label={`Persons: ${b.persons}`} sx={{ bgcolor: "rgba(167, 139, 250, 0.2)", color: "#c4b5fd", border: "1px solid rgba(167, 139, 250, 0.5)" }} />
                      <Chip label={`Total: ₹${b.total}`} sx={{ bgcolor: "rgba(34, 211, 238, 0.2)", color: "#7dd3fc", border: "1px solid rgba(34, 211, 238, 0.5)" }} />
                    </Box>
                    <Typography sx={{ mt: 1, color: neon.muted, fontSize: 12 }}>Booked on {new Date(b.created_at).toLocaleString()}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => cancelBooking(b.id)} sx={{ color: "#f43f5e", fontWeight: 700 }}>Cancel Booking</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Dialog open={open} onClose={closeBooking} PaperProps={{ sx: { bgcolor: neon.card, border: neon.border } }}>
            <DialogTitle>Book {selected?.title}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 320 }}>
              <TextField label="Travel Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="Persons" type="number" value={persons} onChange={(e) => setPersons(e.target.value)} inputProps={{ min: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Price:</Typography>
                <Typography>₹{selected?.price} x {persons} = ₹{selected ? selected.price * persons : 0}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeBooking}>Cancel</Button>
              <Button onClick={confirmBooking} variant="contained" sx={{ bgcolor: "#22d3ee", color: "#0b0f1f", fontWeight: 800, '&:hover':{ bgcolor:'#38bdf8' }}}>Confirm Booking</Button>
            </DialogActions>
          </Dialog>

          <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
            <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
              {snack.msg}
            </Alert>
          </Snackbar>
        </>
      )}
      </Container>
    </Box>
  );
}
