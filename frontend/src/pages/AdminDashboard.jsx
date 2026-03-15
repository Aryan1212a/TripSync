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
  Box,
  Snackbar,
  Alert,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pendingPackages, setPendingPackages] = useState([]);
  const [approvedPackages, setApprovedPackages] = useState([]);
  const [rejectedPackages, setRejectedPackages] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const neon = {
    bg: "radial-gradient(1200px 600px at 10% 0%, rgba(34, 211, 238, 0.18), transparent 60%), radial-gradient(1000px 500px at 90% 10%, rgba(124, 92, 255, 0.2), transparent 55%), #0b0f1f",
    card: "rgba(15, 23, 42, 0.72)",
    border: "1px solid rgba(124, 92, 255, 0.35)",
    glow: "0 12px 30px rgba(124, 92, 255, 0.25)",
    text: "#e5e7eb",
    muted: "#94a3b8",
  };

  useEffect(() => {
    // Fetch pending, approved, and rejected packages from backend API
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem("ts_token");
        
        // Fetch pending packages (admin-only endpoint)
        const pendingRes = await fetch("http://localhost:8000/api/packages/pending/all", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (pendingRes.ok) {
          const pending = await pendingRes.json();
          setPendingPackages(pending);
        }
        
        // Fetch all packages to get approved and rejected
        const allRes = await fetch("http://localhost:8000/api/packages/");
        if (allRes.ok) {
          const all = await allRes.json();
          // Approved packages are already shown on homepage, we'll get them via a separate call
          // For now, just set empty for approved display
          setApprovedPackages([]);
          setRejectedPackages([]);
        }
      } catch (e) {
        console.error("Failed loading packages:", e);
      }
    };
    
    fetchPackages();
  }, []);

  const handleApprove = async (pkg) => {
    try {
      const token = localStorage.getItem("ts_token");
      const packageId = pkg.id || pkg._id;
      
      const response = await fetch(`http://localhost:8000/api/packages/${packageId}/approve`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        // Remove from pending and update UI
        const updated = pendingPackages.filter(p => (p.id || p._id) !== packageId);
        setPendingPackages(updated);
        setSnack({ open: true, msg: `Package "${pkg.title}" approved!`, severity: "success" });
      } else {
        setSnack({ open: true, msg: "Failed to approve package", severity: "error" });
      }
    } catch (e) {
      console.error("Error approving package:", e);
      setSnack({ open: true, msg: `Error: ${e.message}`, severity: "error" });
    }
  };

  const handleReject = async (pkg) => {
    try {
      const token = localStorage.getItem("ts_token");
      const packageId = pkg.id || pkg._id;
      
      const response = await fetch(`http://localhost:8000/api/packages/${packageId}/reject`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        // Remove from pending and update UI
        const updated = pendingPackages.filter(p => (p.id || p._id) !== packageId);
        setPendingPackages(updated);
        setSnack({ open: true, msg: `Package "${pkg.title}" rejected.`, severity: "warning" });
      } else {
        setSnack({ open: true, msg: "Failed to reject package", severity: "error" });
      }
    } catch (e) {
      console.error("Error rejecting package:", e);
      setSnack({ open: true, msg: `Error: ${e.message}`, severity: "error" });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: neon.bg, py: { xs: 6, md: 8 } }}>
      <Container sx={{ mt: 0, mb: 0 }}>
      {!user ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" sx={{ color: "#22d3ee", fontWeight: 800 }}>
            Loading admin dashboard...
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <div>
              <Typography variant="h4" sx={{ color: "#7c5cff", fontWeight: 900, letterSpacing: "-0.02em" }}>
                Admin Dashboard
              </Typography>
              <Typography sx={{ color: neon.muted }}>Verify and approve travel packages from agents</Typography>
            </div>
            <Chip label={user?.name || "Admin"} sx={{ bgcolor: "#22d3ee", color: "#0b0f1f", fontWeight: 800 }} />
          </Box>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PendingIcon sx={{ color: "#f59e0b" }} />
                      <Typography sx={{ color: neon.muted, fontSize: 12 }}>Pending</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#f59e0b", mt: 1 }}>
                      {pendingPackages.length}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon sx={{ color: "#22c55e" }} />
                      <Typography sx={{ color: neon.muted, fontSize: 12 }}>Approved</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#22c55e", mt: 1 }}>
                      {approvedPackages.length}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CancelIcon sx={{ color: "#f43f5e" }} />
                      <Typography sx={{ color: neon.muted, fontSize: 12 }}>Rejected</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#f43f5e", mt: 1 }}>
                      {rejectedPackages.length}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                  <CardContent>
                    <Typography sx={{ color: neon.muted, fontSize: 12 }}>Total</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#38bdf8", mt: 1 }}>
                      {pendingPackages.length + approvedPackages.length + rejectedPackages.length}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          <Box sx={{ borderBottom: "1px solid rgba(124, 92, 255, 0.35)", mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} textColor="inherit" TabIndicatorProps={{ style: { background: "#22d3ee" } }}>
              <Tab label={`Pending (${pendingPackages.length})`} sx={{ color: neon.text }} />
              <Tab label={`Approved (${approvedPackages.length})`} sx={{ color: neon.text }} />
              <Tab label={`Rejected (${rejectedPackages.length})`} sx={{ color: neon.text }} />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <>
              {pendingPackages.length === 0 ? (
                <Typography sx={{ color: neon.muted, textAlign: "center", py: 4 }}>
                  No pending packages awaiting approval
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {pendingPackages.map((pkg) => (
                    <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                      <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                        <Card sx={{ height: "100%", bgcolor: neon.card, borderRadius: 3, border: neon.border, boxShadow: neon.glow }}>
                          <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 800, color: "#e2e8f0", flex: 1 }}>
                                {pkg.title}
                              </Typography>
                              <Chip label="Pending" size="small" sx={{ bgcolor: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.5)" }} />
                            </Box>
                            <Typography sx={{ color: neon.muted, mb: 1, fontSize: 13 }}>{pkg.description || pkg.desc}</Typography>
                            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                              <Chip label={`₹${pkg.price}`} size="small" sx={{ bgcolor: "rgba(56, 189, 248, 0.2)", color: "#7dd3fc", border: "1px solid rgba(56, 189, 248, 0.5)" }} />
                              <Chip label={`${pkg.days || pkg.duration} days`} size="small" sx={{ bgcolor: "rgba(124, 92, 255, 0.2)", color: "#a78bfa", border: "1px solid rgba(124, 92, 255, 0.5)" }} />
                            </Box>
                            <Typography sx={{ color: neon.muted, fontSize: 11, mb: 1 }}>
                              By: {pkg.created_by || pkg.createdBy}
                            </Typography>
                            <Typography sx={{ color: neon.muted, fontSize: 11 }}>
                              Location: {pkg.location}
                            </Typography>
                          </CardContent>
                          <CardActions sx={{ justifyContent: "flex-end", gap: 1 }}>
                            <Button size="small" variant="outlined" sx={{ borderColor: "#f43f5e", color: "#f43f5e" }} onClick={() => handleReject(pkg)}>
                              Reject
                            </Button>
                            <Button size="small" variant="contained" sx={{ bgcolor: "#22d3ee", color: "#0b0f1f", fontWeight: 700 }} onClick={() => handleApprove(pkg)}>
                              Approve
                            </Button>
                          </CardActions>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {tabValue === 1 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2, bgcolor: neon.card, border: neon.border, boxShadow: neon.glow }}>
              <Table>
                <TableHead sx={{ bgcolor: "rgba(34, 197, 94, 0.12)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: "#22c55e" }}>Package</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#22c55e" }}>Agent</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#22c55e" }} align="right">Price</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#22c55e" }}>Approved Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvedPackages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", color: neon.muted, py: 3 }}>
                        No approved packages yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    approvedPackages.map((pkg) => (
                      <TableRow key={pkg.id} sx={{ '&:hover': { bgcolor: "rgba(34, 197, 94, 0.08)" } }}>
                        <TableCell sx={{ color: neon.text, fontWeight: 600 }}>{pkg.title}</TableCell>
                        <TableCell sx={{ color: neon.muted }}>{pkg.createdBy}</TableCell>
                        <TableCell align="right" sx={{ color: "#22c55e", fontWeight: 700 }}>₹{pkg.price}</TableCell>
                        <TableCell sx={{ color: neon.muted }}>{new Date(pkg.approved_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 2 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2, bgcolor: neon.card, border: neon.border, boxShadow: neon.glow }}>
              <Table>
                <TableHead sx={{ bgcolor: "rgba(244, 63, 94, 0.12)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: "#f43f5e" }}>Package</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#f43f5e" }}>Agent</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#f43f5e" }} align="right">Price</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#f43f5e" }}>Rejected Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rejectedPackages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", color: neon.muted, py: 3 }}>
                        No rejected packages
                      </TableCell>
                    </TableRow>
                  ) : (
                    rejectedPackages.map((pkg) => (
                      <TableRow key={pkg.id} sx={{ '&:hover': { bgcolor: "rgba(244, 63, 94, 0.08)" } }}>
                        <TableCell sx={{ color: neon.text, fontWeight: 600 }}>{pkg.title}</TableCell>
                        <TableCell sx={{ color: neon.muted }}>{pkg.createdBy}</TableCell>
                        <TableCell align="right" sx={{ color: "#f43f5e", fontWeight: 700 }}>₹{pkg.price}</TableCell>
                        <TableCell sx={{ color: neon.muted }}>{new Date(pkg.rejected_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
            <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: "100%" }}>
              {snack.msg}
            </Alert>
          </Snackbar>
        </>
      )}
      </Container>
    </Box>
  );
}
