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
    <Container sx={{ mt: 6, mb: 6 }}>
      {!user ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" sx={{ color: "#ffa500", fontWeight: 800 }}>
            Loading admin dashboard...
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <div>
              <Typography variant="h4" sx={{ color: "#ff6b6b", fontWeight: 800 }}>
                Admin Dashboard
              </Typography>
              <Typography sx={{ color: "#d84040" }}>Verify and approve travel packages from agents</Typography>
            </div>
            <Chip label={user?.name || "Admin"} color="error" sx={{ bgcolor: "#ff6b6b", color: "#fff", fontWeight: 700 }} />
          </Box>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: "rgba(255,152,0,0.08)", borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PendingIcon sx={{ color: "#ff6b6b" }} />
                      <Typography sx={{ color: "#999", fontSize: 12 }}>Pending</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#ff6b6b", mt: 1 }}>
                      {pendingPackages.length}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: "rgba(76,175,80,0.08)", borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon sx={{ color: "#4caf50" }} />
                      <Typography sx={{ color: "#999", fontSize: 12 }}>Approved</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#4caf50", mt: 1 }}>
                      {approvedPackages.length}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: "rgba(244,67,54,0.08)", borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CancelIcon sx={{ color: "#f44336" }} />
                      <Typography sx={{ color: "#999", fontSize: 12 }}>Rejected</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#f44336", mt: 1 }}>
                      {rejectedPackages.length}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -4 }}>
                <Card sx={{ bgcolor: "rgba(33,150,243,0.08)", borderRadius: 3 }}>
                  <CardContent>
                    <Typography sx={{ color: "#999", fontSize: 12 }}>Total</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#2196f3", mt: 1 }}>
                      {pendingPackages.length + approvedPackages.length + rejectedPackages.length}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
              <Tab label={`Pending (${pendingPackages.length})`} />
              <Tab label={`Approved (${approvedPackages.length})`} />
              <Tab label={`Rejected (${rejectedPackages.length})`} />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <>
              {pendingPackages.length === 0 ? (
                <Typography sx={{ color: "#999", textAlign: "center", py: 4 }}>
                  No pending packages awaiting approval
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {pendingPackages.map((pkg) => (
                    <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                      <motion.div whileHover={{ y: -6 }} style={{ height: "100%" }}>
                        <Card sx={{ height: "100%", bgcolor: "rgba(255,152,0,0.04)", borderRadius: 3 }}>
                          <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 800, color: "#c62828", flex: 1 }}>
                                {pkg.title}
                              </Typography>
                              <Chip label="Pending" color="error" size="small" sx={{ bgcolor: "#ffebee" }} />
                            </Box>
                            <Typography sx={{ color: "#d84040", mb: 1, fontSize: 13 }}>{pkg.description || pkg.desc}</Typography>
                            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                              <Chip label={`₹${pkg.price}`} color="error" size="small" sx={{ bgcolor: "#ffebee" }} />
                              <Chip label={`${pkg.days || pkg.duration} days`} size="small" sx={{ bgcolor: "#f5f5f5" }} />
                            </Box>
                            <Typography sx={{ color: "#999", fontSize: 11, mb: 1 }}>
                              By: {pkg.created_by || pkg.createdBy}
                            </Typography>
                            <Typography sx={{ color: "#999", fontSize: 11 }}>
                              Location: {pkg.location}
                            </Typography>
                          </CardContent>
                          <CardActions sx={{ justifyContent: "flex-end", gap: 1 }}>
                            <Button size="small" variant="outlined" color="error" onClick={() => handleReject(pkg)}>
                              Reject
                            </Button>
                            <Button size="small" variant="contained" sx={{ bgcolor: "#4caf50", color: "#fff" }} onClick={() => handleApprove(pkg)}>
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
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "rgba(76,175,80,0.08)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "#4caf50" }}>Package</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#4caf50" }}>Agent</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#4caf50" }} align="right">Price</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#4caf50" }}>Approved Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvedPackages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", color: "#999", py: 3 }}>
                        No approved packages yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    approvedPackages.map((pkg) => (
                      <TableRow key={pkg.id} sx={{ '&:hover': { bgcolor: "rgba(76,175,80,0.02)" } }}>
                        <TableCell sx={{ color: "#4caf50", fontWeight: 600 }}>{pkg.title}</TableCell>
                        <TableCell sx={{ color: "#555" }}>{pkg.createdBy}</TableCell>
                        <TableCell align="right" sx={{ color: "#4caf50", fontWeight: 700 }}>₹{pkg.price}</TableCell>
                        <TableCell sx={{ color: "#999" }}>{new Date(pkg.approved_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 2 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "rgba(244,67,54,0.08)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "#f44336" }}>Package</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#f44336" }}>Agent</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#f44336" }} align="right">Price</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#f44336" }}>Rejected Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rejectedPackages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", color: "#999", py: 3 }}>
                        No rejected packages
                      </TableCell>
                    </TableRow>
                  ) : (
                    rejectedPackages.map((pkg) => (
                      <TableRow key={pkg.id} sx={{ '&:hover': { bgcolor: "rgba(244,67,54,0.02)" } }}>
                        <TableCell sx={{ color: "#f44336", fontWeight: 600 }}>{pkg.title}</TableCell>
                        <TableCell sx={{ color: "#555" }}>{pkg.createdBy}</TableCell>
                        <TableCell align="right" sx={{ color: "#f44336", fontWeight: 700 }}>₹{pkg.price}</TableCell>
                        <TableCell sx={{ color: "#999" }}>{new Date(pkg.rejected_at).toLocaleDateString()}</TableCell>
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
  );
}
