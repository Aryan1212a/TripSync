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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function AgentDashboard() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, commissionRate: 10 });
  const [openDialog, setOpenDialog] = useState(false);
  const [newPkg, setNewPkg] = useState({ title: "", desc: "", price: "", duration: "", travel_destination: "", travel_plans: "", image_url: "" });
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [fetchingImage, setFetchingImage] = useState(false);
  const neon = {
    bg: "radial-gradient(1100px 600px at 15% 0%, rgba(16, 185, 129, 0.18), transparent 60%), radial-gradient(1000px 500px at 85% 5%, rgba(59, 130, 246, 0.22), transparent 55%), #0b0f1f",
    card: "rgba(15, 23, 42, 0.72)",
    border: "1px solid rgba(16, 185, 129, 0.35)",
    glow: "0 12px 30px rgba(16, 185, 129, 0.25)",
    text: "#e5e7eb",
    muted: "#94a3b8",
  };

  const [pendingPackages, setPendingPackages] = useState([]);
  const [approvedPackages, setApprovedPackages] = useState([]);
  const [rejectedPackages, setRejectedPackages] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [userBookings, setUserBookings] = useState([]);

  const getBookingsKey = () => {
    if (!user) return "agent_bookings_guest";
    return user.email ? `agent_bookings_${user.email}` : "agent_bookings_guest";
  };

  // Fetch image from Unsplash based on travel destination
  const fetchImageFromUnsplash = async (destination) => {
    if (!destination || destination.trim().length === 0) return;
    
    setFetchingImage(true);
    try {
      const query = encodeURIComponent(destination);
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=5jisWLYa3yLeBbi3fuFgnV4b-jFdrxD0zXcbacWSNRk`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const imageUrl = data.results[0].urls.regular;
        setNewPkg((prev) => ({ ...prev, image_url: imageUrl }));
        setSnack({ open: true, msg: "Image fetched from Unsplash!", severity: "success" });
      } else {
        setSnack({ open: true, msg: "No images found for this destination. Please upload a custom image.", severity: "info" });
      }
    } catch (e) {
      console.error("Failed fetching image:", e);
      setSnack({ open: true, msg: "Failed to fetch image. Please upload a custom image.", severity: "warning" });
    } finally {
      setFetchingImage(false);
    }
  };

  // Handle custom image upload as base64
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setNewPkg((prev) => ({ ...prev, image_url: base64 }));
        setSnack({ open: true, msg: "Image uploaded successfully!", severity: "success" });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Fetch agent's packages from backend API
    const fetchAgentPackages = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/packages/");
        if (response.ok) {
          const allPackages = await response.json();
          // Filter packages created by this agent
          const agentPackages = allPackages.filter((p) => p.created_by === user.email);
          
          // Separate by status
          setPendingPackages(agentPackages.filter((p) => p.status === "pending"));
          setApprovedPackages(agentPackages.filter((p) => p.status === "approved"));
          setRejectedPackages(agentPackages.filter((p) => p.status === "rejected"));

          // Collect bookings for agent's packages from localStorage
          const allUserBookings = [];
          const agentPackageIds = agentPackages.map((p) => p.id || p._id);

          for (let key in localStorage) {
            if (key.startsWith("ts_bookings_")) {
              try {
                const bookingData = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(bookingData)) {
                  bookingData.forEach((booking) => {
                    if (agentPackageIds.includes(booking.package_id) || agentPackageIds.includes(booking.package_id?.toString())) {
                      allUserBookings.push({
                        ...booking,
                        customer_email: key.replace("ts_bookings_", ""),
                      });
                    }
                  });
                }
              } catch (e) {
                console.error("Failed parsing booking:", e);
              }
            }
          }
          setUserBookings(allUserBookings);
        }
      } catch (e) {
        console.error("Failed fetching packages from API:", e);
      }
    };

    fetchAgentPackages();

    try {
      const raw = localStorage.getItem(getBookingsKey());
      if (raw) {
        const agentBookings = JSON.parse(raw);
        setBookings(Array.isArray(agentBookings) ? agentBookings : []);

        const total = agentBookings.length;
        const revenue = agentBookings.reduce((sum, b) => sum + (b.total || 0), 0);
        const commission = Math.round(revenue * (stats.commissionRate / 100));

        setStats({ totalBookings: total, totalRevenue: revenue, commission, commissionRate: stats.commissionRate });
      }
    } catch (e) {
      console.error("Failed loading bookings:", e);
    }
  }, [user]);

  const handleCreatePackage = async () => {
    if (!newPkg.title || !newPkg.price || !newPkg.duration || !newPkg.travel_destination) {
      setSnack({ open: true, msg: "Please fill title, price, duration, and travel destination", severity: "warning" });
      return;
    }

    try {
      const token = localStorage.getItem("ts_token");
      const payload = {
        title: newPkg.title,
        description: newPkg.desc || "Premium travel experience",
        price: Number(newPkg.price),
        days: Number(newPkg.duration),
        location: newPkg.travel_destination,
        category: newPkg.category || "packages",
        image: newPkg.image_url || "https://via.placeholder.com/400x300?text=Travel+Package",
        offers: [],
        inclusions: [],
        highlights: [],
        itinerary: [newPkg.travel_plans || ""],
        gallery: [],
        created_by: user?.email,
      };

      const response = await fetch("http://localhost:8000/api/packages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to create package: ${response.statusText}`);
      }

      const createdPkg = await response.json();
      setNewPkg({ title: "", desc: "", price: "", duration: "", travel_destination: "", travel_plans: "", image_url: "", category: "" });
      setOpenDialog(false);
      setSnack({ open: true, msg: "Package submitted for admin approval!", severity: "success" });
      
      // Refresh packages list
      setPendingPackages((prev) => [...prev, createdPkg]);
    } catch (e) {
      console.error("Failed submitting package:", e);
      setSnack({ open: true, msg: `Failed to submit package: ${e.message}`, severity: "error" });
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      const token = localStorage.getItem("ts_token");
      const response = await fetch(`http://localhost:8000/api/packages/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete package: ${response.statusText}`);
      }

      setPendingPackages((prev) => prev.filter((p) => p.id !== id));
      setApprovedPackages((prev) => prev.filter((p) => p.id !== id));
      setRejectedPackages((prev) => prev.filter((p) => p.id !== id));
      setSnack({ open: true, msg: "Package deleted successfully", severity: "success" });
    } catch (e) {
      console.error("Failed deleting package:", e);
      setSnack({ open: true, msg: `Failed to delete package: ${e.message}`, severity: "error" });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: neon.bg, py: { xs: 6, md: 8 } }}>
      <Container sx={{ mt: 0, mb: 0 }}>
      {!user ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" sx={{ color: "#22d3ee", fontWeight: 800 }}>
            Loading your agent dashboard...
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <div>
              <Typography variant="h4" sx={{ color: "#34d399", fontWeight: 900, letterSpacing: "-0.02em" }}>
                Agent Dashboard
              </Typography>
              <Typography sx={{ color: neon.muted }}>Manage packages and track bookings</Typography>
            </div>
            <Chip label={user?.name || "Agent"} sx={{ bgcolor: "#22d3ee", color: "#0b0f1f", fontWeight: 800 }} />
          </Box>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                  <CardContent>
                    <Typography sx={{ color: neon.muted, fontSize: 12 }}>Total Bookings</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#34d399", mt: 1 }}>{stats.totalBookings}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                  <CardContent>
                    <Typography sx={{ color: neon.muted, fontSize: 12 }}>Total Revenue</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#22d3ee", mt: 1 }}>₹{stats.totalRevenue.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                  <CardContent>
                    <Typography sx={{ color: neon.muted, fontSize: 12 }}>Commission (10%)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#a78bfa", mt: 1 }}>₹{(stats.totalRevenue * 0.1).toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TrendingUpIcon sx={{ color: "#38bdf8" }} />
                      <Typography sx={{ color: neon.muted, fontSize: 12 }}>Packages</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#38bdf8", mt: 1 }}>{packages.length}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          <Box sx={{ mb: 4 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ bgcolor: "#22d3ee", color: "#0b0f1f", fontWeight: 800, boxShadow: neon.glow, '&:hover': { bgcolor: "#38bdf8" } }}>Create New Package</Button>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: "#34d399", fontWeight: 900 }}>My Packages ({packages.length})</Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {packages.length === 0 && (
              <Grid item xs={12}><Typography sx={{ color: neon.muted }}>No packages yet. Create your first package above!</Typography></Grid>
            )}

            {packages.map((pkg) => (
              <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                  <Card sx={{ height: "100%", bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: neon.text }}>{pkg.title}</Typography>
                      <Typography sx={{ color: neon.muted, mb: 1, fontSize: 13 }}>{pkg.desc}</Typography>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Chip label={`₹${pkg.price}`} size="small" sx={{ bgcolor: "rgba(34, 211, 238, 0.2)", color: "#7dd3fc", border: "1px solid rgba(34, 211, 238, 0.5)" }} />
                        <Chip label={`${pkg.duration} days`} size="small" sx={{ bgcolor: "rgba(167, 139, 250, 0.2)", color: "#c4b5fd", border: "1px solid rgba(167, 139, 250, 0.5)" }} />
                      </Box>
                      <Typography sx={{ color: neon.muted, fontSize: 11 }}>Created {new Date(pkg.created_at).toLocaleDateString()}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" sx={{ color: "#38bdf8" }}>Edit</Button>
                      <Button size="small" onClick={() => handleDeletePackage(pkg.id)} sx={{ color: "#f43f5e" }}>Delete</Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ borderBottom: "1px solid rgba(16, 185, 129, 0.35)", mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} textColor="inherit" TabIndicatorProps={{ style: { background: "#22d3ee" } }}>
              <Tab label={`Pending (${pendingPackages.length})`} sx={{ color: neon.text }} />
              <Tab label={`Approved (${approvedPackages.length})`} sx={{ color: neon.text }} />
              <Tab label={`Rejected (${rejectedPackages.length})`} sx={{ color: neon.text }} />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {pendingPackages.length === 0 ? (
                <Grid item xs={12}><Typography sx={{ color: neon.muted }}>No pending packages. Create and submit packages for admin approval!</Typography></Grid>
              ) : (
                pendingPackages.map((pkg) => (
                  <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                    <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                      <Card sx={{ height: "100%", bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: neon.text, flex: 1 }}>{pkg.title}</Typography>
                            <Chip label="Pending" size="small" sx={{ bgcolor: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.5)" }} />
                          </Box>
                          <Typography sx={{ color: neon.muted, mb: 1, fontSize: 13 }}>{pkg.desc}</Typography>
                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <Chip label={`₹${pkg.price}`} size="small" sx={{ bgcolor: "rgba(34, 211, 238, 0.2)", color: "#7dd3fc", border: "1px solid rgba(34, 211, 238, 0.5)" }} />
                            <Chip label={`${pkg.duration} days`} size="small" sx={{ bgcolor: "rgba(167, 139, 250, 0.2)", color: "#c4b5fd", border: "1px solid rgba(167, 139, 250, 0.5)" }} />
                          </Box>
                          <Typography sx={{ color: neon.muted, fontSize: 11 }}>Awaiting admin approval...</Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {approvedPackages.length === 0 ? (
                <Grid item xs={12}><Typography sx={{ color: neon.muted }}>No approved packages yet.</Typography></Grid>
              ) : (
                approvedPackages.map((pkg) => (
                  <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                    <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                      <Card sx={{ height: "100%", bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: neon.text, flex: 1 }}>{pkg.title}</Typography>
                            <Chip label="Live" size="small" sx={{ bgcolor: "rgba(34, 197, 94, 0.2)", color: "#22c55e", border: "1px solid rgba(34, 197, 94, 0.5)" }} />
                          </Box>
                          <Typography sx={{ color: neon.muted, mb: 1, fontSize: 13 }}>{pkg.desc}</Typography>
                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <Chip label={`₹${pkg.price}`} size="small" sx={{ bgcolor: "rgba(34, 211, 238, 0.2)", color: "#7dd3fc", border: "1px solid rgba(34, 211, 238, 0.5)" }} />
                            <Chip label={`${pkg.duration} days`} size="small" sx={{ bgcolor: "rgba(167, 139, 250, 0.2)", color: "#c4b5fd", border: "1px solid rgba(167, 139, 250, 0.5)" }} />
                          </Box>
                          <Typography sx={{ color: neon.muted, fontSize: 11 }}>Approved on {new Date(pkg.approved_at).toLocaleDateString()}</Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {tabValue === 2 && (
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {rejectedPackages.length === 0 ? (
                <Grid item xs={12}><Typography sx={{ color: neon.muted }}>No rejected packages.</Typography></Grid>
              ) : (
                rejectedPackages.map((pkg) => (
                  <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                    <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                      <Card sx={{ height: "100%", bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: neon.text, flex: 1 }}>{pkg.title}</Typography>
                            <Chip label="Rejected" size="small" sx={{ bgcolor: "rgba(244, 63, 94, 0.2)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.5)" }} />
                          </Box>
                          <Typography sx={{ color: neon.muted, mb: 1, fontSize: 13 }}>{pkg.desc}</Typography>
                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <Chip label={`₹${pkg.price}`} size="small" sx={{ bgcolor: "rgba(34, 211, 238, 0.2)", color: "#7dd3fc", border: "1px solid rgba(34, 211, 238, 0.5)" }} />
                            <Chip label={`${pkg.duration} days`} size="small" sx={{ bgcolor: "rgba(167, 139, 250, 0.2)", color: "#c4b5fd", border: "1px solid rgba(167, 139, 250, 0.5)" }} />
                          </Box>
                          <Typography sx={{ color: neon.muted, fontSize: 11 }}>Rejected on {new Date(pkg.rejected_at).toLocaleDateString()}</Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          <Typography variant="h6" sx={{ mb: 2, color: "#22d3ee", fontWeight: 900 }}>User Bookings for Your Approved Packages</Typography>

          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4, bgcolor: neon.card, border: neon.border, boxShadow: neon.glow }}>
            <Table>
              <TableHead sx={{ bgcolor: "rgba(34, 211, 238, 0.12)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: "#22d3ee" }}>Package</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#22d3ee" }}>Customer Email</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#22d3ee" }}>Travel Date</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#22d3ee" }} align="right">Persons</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#22d3ee" }} align="right">Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#22d3ee" }} align="right">Your Commission (10%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", color: neon.muted, py: 3 }}>No user bookings yet for your approved packages</TableCell>
                  </TableRow>
                ) : (
                  userBookings.map((booking, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: "rgba(34, 211, 238, 0.08)" } }}>
                      <TableCell sx={{ color: neon.text, fontWeight: 600 }}>{booking.package_title}</TableCell>
                      <TableCell sx={{ color: neon.muted }}>{booking.customer_email || "Guest"}</TableCell>
                      <TableCell sx={{ color: neon.muted }}>{new Date(booking.date).toLocaleDateString()}</TableCell>
                      <TableCell align="right" sx={{ color: neon.muted }}>{booking.persons}</TableCell>
                      <TableCell align="right" sx={{ color: "#22d3ee", fontWeight: 700 }}>₹{booking.total?.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ color: "#34d399", fontWeight: 700 }}>₹{Math.round(booking.total * 0.1).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { bgcolor: neon.card, border: neon.border } }}
          >
            <DialogTitle sx={{ fontWeight: 900, color: "#22d3ee" }}>Create New Package</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
              <TextField
                fullWidth
                label="Package Title"
                value={newPkg.title}
                onChange={(e) => setNewPkg({ ...newPkg, title: e.target.value })}
                placeholder="e.g., Paris City Tour"
                sx={{
                  "& .MuiInputLabel-root": { color: neon.muted },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#22d3ee" },
                  "& .MuiOutlinedInput-root": {
                    color: neon.text,
                    bgcolor: "rgba(2, 6, 23, 0.35)",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(34, 211, 238, 0.35)" },
                }}
              />
              <TextField
                fullWidth
                label="Travel Destination (Required)"
                value={newPkg.travel_destination}
                onChange={(e) => setNewPkg({ ...newPkg, travel_destination: e.target.value })}
                placeholder="e.g., Paris, France"
                sx={{
                  "& .MuiInputLabel-root": { color: neon.muted },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#22d3ee" },
                  "& .MuiOutlinedInput-root": {
                    color: neon.text,
                    bgcolor: "rgba(2, 6, 23, 0.35)",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(34, 211, 238, 0.35)" },
                }}
              />
              <Button variant="outlined" color="info" onClick={() => fetchImageFromUnsplash(newPkg.travel_destination)} disabled={fetchingImage || !newPkg.travel_destination}>
                {fetchingImage ? "Fetching Image..." : "Auto-Fetch Image by Location"}
              </Button>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: neon.muted, fontWeight: 600 }}>Custom Image Upload (Optional)</Typography>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ color: neon.muted }} />
              </Box>
              {newPkg.image_url && (
                <Box sx={{ width: "100%", height: 200, bgcolor: "#f0f0f0", borderRadius: 2, overflow: "hidden" }}>
                  <img src={newPkg.image_url} alt="package preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
              )}
              <TextField
                fullWidth
                label="Description"
                value={newPkg.desc}
                onChange={(e) => setNewPkg({ ...newPkg, desc: e.target.value })}
                placeholder="e.g., 3 days exploring the city"
                multiline
                rows={2}
                sx={{
                  "& .MuiInputLabel-root": { color: neon.muted },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#22d3ee" },
                  "& .MuiOutlinedInput-root": {
                    color: neon.text,
                    bgcolor: "rgba(2, 6, 23, 0.35)",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(34, 211, 238, 0.35)" },
                }}
              />
              <TextField
                fullWidth
                label="Travel Plans (Optional)"
                value={newPkg.travel_plans}
                onChange={(e) => setNewPkg({ ...newPkg, travel_plans: e.target.value })}
                placeholder="e.g., Day 1: Eiffel Tower, Day 2: Louvre..."
                multiline
                rows={2}
                sx={{
                  "& .MuiInputLabel-root": { color: neon.muted },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#22d3ee" },
                  "& .MuiOutlinedInput-root": {
                    color: neon.text,
                    bgcolor: "rgba(2, 6, 23, 0.35)",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(34, 211, 238, 0.35)" },
                }}
              />
              <TextField
                fullWidth
                label="Price (₹)"
                type="number"
                value={newPkg.price}
                onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })}
                inputProps={{ min: 1000, step: 100 }}
                sx={{
                  "& .MuiInputLabel-root": { color: neon.muted },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#22d3ee" },
                  "& .MuiOutlinedInput-root": {
                    color: neon.text,
                    bgcolor: "rgba(2, 6, 23, 0.35)",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(34, 211, 238, 0.35)" },
                }}
              />
              <TextField
                fullWidth
                label="Duration (days)"
                type="number"
                value={newPkg.duration}
                onChange={(e) => setNewPkg({ ...newPkg, duration: e.target.value })}
                inputProps={{ min: 1, step: 1 }}
                sx={{
                  "& .MuiInputLabel-root": { color: neon.muted },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#22d3ee" },
                  "& .MuiOutlinedInput-root": {
                    color: neon.text,
                    bgcolor: "rgba(2, 6, 23, 0.35)",
                    borderRadius: "12px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(34, 211, 238, 0.35)" },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleCreatePackage} variant="contained" sx={{ bgcolor: "#22d3ee", color: "#0b0f1f", fontWeight: 800, '&:hover': { bgcolor: "#38bdf8" } }}>Create Package</Button>
            </DialogActions>
          </Dialog>

          <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
            <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: "100%" }}>{snack.msg}</Alert>
          </Snackbar>
        </>
      )}
      </Container>
    </Box>
  );
}
