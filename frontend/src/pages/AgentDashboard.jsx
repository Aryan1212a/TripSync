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
    <Container sx={{ mt: 6, mb: 6 }}>
      {!user ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" sx={{ color: "#ff6b6b", fontWeight: 800 }}>
            Loading your agent dashboard...
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <div>
              <Typography variant="h4" sx={{ color: "#ff6b6b", fontWeight: 800 }}>
                Agent Dashboard
              </Typography>
              <Typography sx={{ color: "#d84040" }}>Manage packages and track bookings</Typography>
            </div>
            <Chip label={user?.name || "Agent"} color="error" sx={{ bgcolor: "#ff6b6b", color: "#fff", fontWeight: 700 }} />
          </Box>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: "rgba(255,107,107,0.08)", borderRadius: 3 }}>
                  <CardContent>
                    <Typography sx={{ color: "#999", fontSize: 12 }}>Total Bookings</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#ff6b6b", mt: 1 }}>{stats.totalBookings}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: "rgba(255,107,107,0.08)", borderRadius: 3 }}>
                  <CardContent>
                    <Typography sx={{ color: "#999", fontSize: 12 }}>Total Revenue</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#ff6b6b", mt: 1 }}>₹{stats.totalRevenue.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: "rgba(255,107,107,0.08)", borderRadius: 3 }}>
                  <CardContent>
                    <Typography sx={{ color: "#999", fontSize: 12 }}>Commission (10%)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#ff6b6b", mt: 1 }}>₹{(stats.totalRevenue * 0.1).toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: "rgba(255,107,107,0.08)", borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TrendingUpIcon sx={{ color: "#ff6b6b" }} />
                      <Typography sx={{ color: "#999", fontSize: 12 }}>Packages</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#ff6b6b", mt: 1 }}>{packages.length}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          <Box sx={{ mb: 4 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ bgcolor: "#ff6b6b", color: "#fff", fontWeight: 700, '&:hover': { bgcolor: "#ff5252" } }}>Create New Package</Button>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, color: "#d84040", fontWeight: 800 }}>My Packages ({packages.length})</Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {packages.length === 0 && (
              <Grid item xs={12}><Typography sx={{ color: "#999" }}>No packages yet. Create your first package above!</Typography></Grid>
            )}

            {packages.map((pkg) => (
              <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                  <Card sx={{ height: "100%", bgcolor: "rgba(255,107,107,0.04)", borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#c62828" }}>{pkg.title}</Typography>
                      <Typography sx={{ color: "#d84040", mb: 1, fontSize: 13 }}>{pkg.desc}</Typography>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Chip label={`₹${pkg.price}`} color="error" size="small" sx={{ bgcolor: "#ffebee" }} />
                        <Chip label={`${pkg.duration} days`} size="small" sx={{ bgcolor: "#ffebee" }} />
                      </Box>
                      <Typography sx={{ color: "#999", fontSize: 11 }}>Created {new Date(pkg.created_at).toLocaleDateString()}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" sx={{ color: "#ff6b6b" }}>Edit</Button>
                      <Button size="small" onClick={() => handleDeletePackage(pkg.id)} sx={{ color: "#d32f2f" }}>Delete</Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
              <Tab label={`Pending (${pendingPackages.length})`} />
              <Tab label={`Approved (${approvedPackages.length})`} />
              <Tab label={`Rejected (${rejectedPackages.length})`} />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {pendingPackages.length === 0 ? (
                <Grid item xs={12}><Typography sx={{ color: "#999" }}>No pending packages. Create and submit packages for admin approval!</Typography></Grid>
              ) : (
                pendingPackages.map((pkg) => (
                  <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                    <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                      <Card sx={{ height: "100%", bgcolor: "rgba(255,152,0,0.04)", borderRadius: 3 }}>
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "#c62828", flex: 1 }}>{pkg.title}</Typography>
                            <Chip label="Pending" size="small" sx={{ bgcolor: "#fff3e0" }} />
                          </Box>
                          <Typography sx={{ color: "#d84040", mb: 1, fontSize: 13 }}>{pkg.desc}</Typography>
                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <Chip label={`₹${pkg.price}`} color="error" size="small" sx={{ bgcolor: "#ffebee" }} />
                            <Chip label={`${pkg.duration} days`} size="small" sx={{ bgcolor: "#ffebee" }} />
                          </Box>
                          <Typography sx={{ color: "#999", fontSize: 11 }}>Awaiting admin approval...</Typography>
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
                <Grid item xs={12}><Typography sx={{ color: "#999" }}>No approved packages yet.</Typography></Grid>
              ) : (
                approvedPackages.map((pkg) => (
                  <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                    <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                      <Card sx={{ height: "100%", bgcolor: "rgba(76,175,80,0.04)", borderRadius: 3 }}>
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "#2e7d32", flex: 1 }}>{pkg.title}</Typography>
                            <Chip label="Live" color="success" size="small" />
                          </Box>
                          <Typography sx={{ color: "#4caf50", mb: 1, fontSize: 13 }}>{pkg.desc}</Typography>
                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <Chip label={`₹${pkg.price}`} color="success" size="small" sx={{ bgcolor: "#e8f5e9" }} />
                            <Chip label={`${pkg.duration} days`} size="small" sx={{ bgcolor: "#e8f5e9" }} />
                          </Box>
                          <Typography sx={{ color: "#999", fontSize: 11 }}>Approved on {new Date(pkg.approved_at).toLocaleDateString()}</Typography>
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
                <Grid item xs={12}><Typography sx={{ color: "#999" }}>No rejected packages.</Typography></Grid>
              ) : (
                rejectedPackages.map((pkg) => (
                  <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                    <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                      <Card sx={{ height: "100%", bgcolor: "rgba(244,67,54,0.04)", borderRadius: 3 }}>
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "#c62828", flex: 1 }}>{pkg.title}</Typography>
                            <Chip label="Rejected" color="error" size="small" />
                          </Box>
                          <Typography sx={{ color: "#d84040", mb: 1, fontSize: 13 }}>{pkg.desc}</Typography>
                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <Chip label={`₹${pkg.price}`} color="error" size="small" sx={{ bgcolor: "#ffebee" }} />
                            <Chip label={`${pkg.duration} days`} size="small" sx={{ bgcolor: "#ffebee" }} />
                          </Box>
                          <Typography sx={{ color: "#999", fontSize: 11 }}>Rejected on {new Date(pkg.rejected_at).toLocaleDateString()}</Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          <Typography variant="h6" sx={{ mb: 2, color: "#d84040", fontWeight: 800 }}>User Bookings for Your Approved Packages</Typography>

          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
            <Table>
              <TableHead sx={{ bgcolor: "rgba(255,107,107,0.08)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#c62828" }}>Package</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#c62828" }}>Customer Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#c62828" }}>Travel Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#c62828" }} align="right">Persons</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#c62828" }} align="right">Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#c62828" }} align="right">Your Commission (10%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", color: "#999", py: 3 }}>No user bookings yet for your approved packages</TableCell>
                  </TableRow>
                ) : (
                  userBookings.map((booking, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: "rgba(255,107,107,0.02)" } }}>
                      <TableCell sx={{ color: "#c62828", fontWeight: 600 }}>{booking.package_title}</TableCell>
                      <TableCell sx={{ color: "#555" }}>{booking.customer_email || "Guest"}</TableCell>
                      <TableCell sx={{ color: "#555" }}>{new Date(booking.date).toLocaleDateString()}</TableCell>
                      <TableCell align="right" sx={{ color: "#555" }}>{booking.persons}</TableCell>
                      <TableCell align="right" sx={{ color: "#c62828", fontWeight: 700 }}>₹{booking.total?.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ color: "#ff6b6b", fontWeight: 700 }}>₹{Math.round(booking.total * 0.1).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, color: "#ff6b6b" }}>Create New Package</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
              <TextField fullWidth label="Package Title" value={newPkg.title} onChange={(e) => setNewPkg({ ...newPkg, title: e.target.value })} placeholder="e.g., Paris City Tour" />
              <TextField fullWidth label="Travel Destination (Required)" value={newPkg.travel_destination} onChange={(e) => setNewPkg({ ...newPkg, travel_destination: e.target.value })} placeholder="e.g., Paris, France" />
              <Button variant="outlined" color="info" onClick={() => fetchImageFromUnsplash(newPkg.travel_destination)} disabled={fetchingImage || !newPkg.travel_destination}>
                {fetchingImage ? "Fetching Image..." : "Auto-Fetch Image by Location"}
              </Button>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: "#666", fontWeight: 600 }}>Custom Image Upload (Optional)</Typography>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </Box>
              {newPkg.image_url && (
                <Box sx={{ width: "100%", height: 200, bgcolor: "#f0f0f0", borderRadius: 2, overflow: "hidden" }}>
                  <img src={newPkg.image_url} alt="package preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
              )}
              <TextField fullWidth label="Description" value={newPkg.desc} onChange={(e) => setNewPkg({ ...newPkg, desc: e.target.value })} placeholder="e.g., 3 days exploring the city" multiline rows={2} />
              <TextField fullWidth label="Travel Plans (Optional)" value={newPkg.travel_plans} onChange={(e) => setNewPkg({ ...newPkg, travel_plans: e.target.value })} placeholder="e.g., Day 1: Eiffel Tower, Day 2: Louvre..." multiline rows={2} />
              <TextField fullWidth label="Price (₹)" type="number" value={newPkg.price} onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })} inputProps={{ min: 1000, step: 100 }} />
              <TextField fullWidth label="Duration (days)" type="number" value={newPkg.duration} onChange={(e) => setNewPkg({ ...newPkg, duration: e.target.value })} inputProps={{ min: 1, step: 1 }} />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleCreatePackage} variant="contained" sx={{ bgcolor: "#ff6b6b", color: "#fff", '&:hover': { bgcolor: "#ff5252" } }}>Create Package</Button>
            </DialogActions>
          </Dialog>

          <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
            <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: "100%" }}>{snack.msg}</Alert>
          </Snackbar>
        </>
      )}
    </Container>
  );
}
