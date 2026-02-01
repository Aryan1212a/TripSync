import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [packages, setPackages] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [category, setCategory] = useState("All");
  const categories = [
    { label: "All", icon: "🌍" },
    { label: "Beaches", icon: "🏖️" },
    { label: "Adventure", icon: "⛰️" },
    { label: "Hotels", icon: "🏨" },
  ];

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingPersons, setBookingPersons] = useState(1);

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" });

  useEffect(() => {
    // Always fetch from API first to get latest packages
    const fetchPackages = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/packages/", {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched from API:", data.length, "packages");
          setPackages(data);
          // Store with timestamp
          localStorage.setItem("public_packages", JSON.stringify(data));
          localStorage.setItem("packages_cache_time", Date.now().toString());
        } else {
          console.warn("API returned status:", response.status);
          // Fallback to localStorage if API fails
          const raw = localStorage.getItem("public_packages");
          const parsed = raw ? JSON.parse(raw) : [];
          console.log("Fallback to localStorage:", parsed.length, "packages");
          setPackages(parsed);
        }
      } catch (e) {
        console.warn("API fetch failed, using localStorage:", e);
        // If API call fails, use localStorage
        const raw = localStorage.getItem("public_packages");
        const parsed = raw ? JSON.parse(raw) : [];
        console.log("Error fallback - localStorage:", parsed.length, "packages");
        setPackages(parsed);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    if (!packages || packages.length <= 1) return;
    const t = setInterval(
      () => setSlideIndex((p) => (p + 1) % packages.length),
      5000
    );
    return () => clearInterval(t);
  }, [packages]);

  const onSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    
    // Fetch fresh data for search
    fetch("http://localhost:8000/api/packages/")
      .then(r => r.json())
      .then(list => {
        if (!q) {
          setPackages(list);
          return;
        }

        setPackages(
          list.filter((p) =>
            `${p.title} ${p.description} ${p.location}`
              .toLowerCase()
              .includes(q)
          )
        );
        setSlideIndex(0);
      })
      .catch(() => {
        // Fallback to localStorage if API fails
        const raw = localStorage.getItem("public_packages");
        const list = raw ? JSON.parse(raw) : [];
        setPackages(q ? list.filter((p) =>
          `${p.title} ${p.description} ${p.location}`
            .toLowerCase()
            .includes(q)
        ) : list);
        setSlideIndex(0);
      });
  };

  const onCategorySelect = (label) => {
    setCategory(label);
    // Fetch fresh data for category filter
    fetch("http://localhost:8000/api/packages/")
      .then(r => r.json())
      .then(list => {
        if (label === "All") setPackages(list);
        else setPackages(list.filter((p) => p.category === label));
        setSlideIndex(0);
      })
      .catch(() => {
        // Fallback
        const raw = localStorage.getItem("public_packages");
        const list = raw ? JSON.parse(raw) : [];
        setPackages(label === "All" ? list : list.filter((p) => p.category === label));
        setSlideIndex(0);
      });
  };

  const onFilterApply = () => {
    // Fetch fresh data for price/category filter
    fetch("http://localhost:8000/api/packages/")
      .then(r => r.json())
      .then(list => {
        const filtered = list.filter(
          (p) =>
            p.price >= Number(minPrice) &&
            p.price <= Number(maxPrice) &&
            (category === "All" || p.category === category)
        );
        setPackages(filtered);
        setSlideIndex(0);
      })
      .catch(() => {
        // Fallback
        const raw = localStorage.getItem("public_packages");
        const list = raw ? JSON.parse(raw) : [];
        const filtered = list.filter(
          (p) =>
            p.price >= Number(minPrice) &&
            p.price <= Number(maxPrice) &&
            (category === "All" || p.category === category)
        );
        setPackages(filtered);
        setSlideIndex(0);
      });
  };

  const onFilterReset = () => {
    setMinPrice(0);
    setMaxPrice(100000);
    setCategory("All");
    // Fetch fresh data for reset
    fetch("http://localhost:8000/api/packages/")
      .then(r => r.json())
      .then(list => {
        setPackages(list);
        setSlideIndex(0);
      })
      .catch(() => {
        // Fallback
        const raw = localStorage.getItem("public_packages");
        setPackages(raw ? JSON.parse(raw) : []);
        setSlideIndex(0);
      });
  };

  const openBookingDialog = (pkg) => {
    setSelectedPackage(pkg);
    setBookingOpen(true);
  };

  const closeBookingDialog = () => setBookingOpen(false);

  const confirmBooking = () => {
    if (!selectedPackage) return;

    const total =
      (selectedPackage.price || 0) * Number(bookingPersons || 1);

    const newBooking = {
      id: `${selectedPackage._id || selectedPackage.id}_${Date.now()}`,
      package_id: selectedPackage._id || selectedPackage.id,
      package_title: selectedPackage.title,
      date: bookingDate,
      persons: Number(bookingPersons),
      total,
      created_at: new Date().toISOString(),
    };

    const storageKey = user?.email
      ? `ts_bookings_${user.email}`
      : "ts_bookings_guest";

    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      existing.push(newBooking);
      localStorage.setItem(storageKey, JSON.stringify(existing));
      setSnack({
        open: true,
        msg: "Booking saved! View in My Dashboard",
        severity: "success",
      });
    } catch (e) {
      setSnack({ open: true, msg: "Booking failed", severity: "error" });
    }

    setBookingOpen(false);
  };

  const prevSlide = () =>
    setSlideIndex((p) => (p - 1 + packages.length) % packages.length);

  const nextSlide = () =>
    setSlideIndex((p) => (p + 1) % packages.length);

  const goToSlide = (i) => setSlideIndex(i);

  return (
    <Box sx={{ width: "100%", backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              py: 2,
              px: 4,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              color: "white",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <WavingHandIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>
                Welcome, {user.name}!
              </Typography>
            </Stack>
          </Box>
        </motion.div>
      )}

      {/* HERO */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: 8,
          pb: 10,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h2"
                fontWeight="900"
                sx={{ color: "#fff", mb: 2 }}
              >
                Discover Your Next Adventure
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 300,
                  mb: 4,
                }}
              >
                Explore handpicked travel destinations with exclusive deals
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                sx={{ maxWidth: 700, mx: "auto" }}
              >
                <TextField
                  fullWidth
                  placeholder="Where do you want to go?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && onSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#667eea" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  variant="contained"
                  onClick={onSearch}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ px: 5, borderRadius: "16px" }}
                >
                  Explore
                </Button>
              </Stack>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* POPULAR PACKAGES SLIDESHOW */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{ mb: 5 }}>
            <Typography variant="h3" fontWeight="900" sx={{ mb: 2 }}>
              Popular Packages
            </Typography>
            <Typography variant="h6" sx={{ color: "#64748b", fontWeight: 400 }}>
              Check out our most-loved travel destinations
            </Typography>
          </Box>

          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 3,
                overflow: "hidden",
              }}
            >
              {packages.length > 0 && (() => {
                const pkg = packages[slideIndex];
                if (!pkg) return null;

                return (
                  <motion.div
                    key={pkg._id || pkg.id || slideIndex}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    whileHover={{ y: -6 }}
                  >
                    <Card
                      onClick={() =>
                        navigate(`/package/${pkg.id || pkg._id}`)
                      }
                      sx={{
                        borderRadius: "18px",
                        overflow: "hidden",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                        cursor: "pointer",
                        height: { xs: "auto", md: 420 },
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          overflow: "hidden",
                          flex: 1,
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="100%"
                          image={pkg.image}
                          alt={pkg.title}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />

                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.2) 60%)",
                            zIndex: 1,
                          }}
                        />

                        <Chip
                          label="Popular"
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            zIndex: 2,
                            bgcolor: "#ff6b6b",
                            color: "#fff",
                          }}
                        />
                      </Box>

                      <CardContent
                        sx={{
                          flex: 1,
                          p: 3.5,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ mb: 1.5 }}
                          >
                            <LocationOnIcon
                              sx={{ color: "#667eea", fontSize: 18 }}
                            />
                            <Typography
                              sx={{
                                color: "#64748b",
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {pkg.location}
                            </Typography>
                          </Stack>

                          <Typography
                            variant="h5"
                            fontWeight="800"
                            sx={{ color: "#1e1b4b", mb: 1 }}
                          >
                            {pkg.title}
                          </Typography>

                          <Typography sx={{ color: "#64748b", mb: 2 }}>
                            {pkg.description?.slice(0, 160)}...
                          </Typography>
                        </div>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="h4"
                            fontWeight="900"
                            sx={{
                              background:
                                "linear-gradient(135deg, #667eea, #764ba2)",
                              backgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            ₹{pkg.price}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {pkg.rating && (
                              <Chip
                                icon={<StarIcon />}
                                label={`${pkg.rating}`}
                                size="small"
                                sx={{
                                  bgcolor: "#fef3c7",
                                  color: "#d97706",
                                }}
                              />
                            )}

                            <Button
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                openBookingDialog(pkg);
                              }}
                              sx={{
                                textTransform: "none",
                                borderRadius: "10px",
                                background:
                                  "linear-gradient(135deg,#667eea,#764ba2)",
                              }}
                            >
                              Book Now
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })()}
            </Box>

            {packages.length > 1 && (
              <>
                <Box
                  onClick={prevSlide}
                  sx={{
                    position: "absolute",
                    left: -20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                    display: { xs: "none", md: "block" },
                  }}
                >
                  <Button>❮</Button>
                </Box>

                <Box
                  onClick={nextSlide}
                  sx={{
                    position: "absolute",
                    right: -20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                    display: { xs: "none", md: "block" },
                  }}
                >
                  <Button>❯</Button>
                </Box>
              </>
            )}

            {packages.length > 1 && (
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="center"
                sx={{ mt: 6 }}
              >
                {packages.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    sx={{
                      width: slideIndex === idx ? 32 : 12,
                      height: 12,
                      borderRadius: 6,
                      background:
                        slideIndex === idx
                          ? "linear-gradient(135deg, #667eea, #764ba2)"
                          : "rgba(102, 126, 234, 0.3)",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </motion.div>
      </Container>

      {/* CATEGORY SECTION */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 4 }}>
        <Paper sx={{ p: 4, borderRadius: "20px", mb: 4 }} elevation={3}>
          <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>
            Browse by Category
          </Typography>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 4 }}>
            {categories.map((cat) => (
              <Chip
                key={cat.label}
                label={`${cat.icon} ${cat.label}`}
                clickable
                onClick={() => onCategorySelect(cat.label)}
                sx={{ px: 2.5, py: 1.5 }}
                variant={category === cat.label ? "filled" : "outlined"}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              size="small"
              sx={{ width: 200 }}
            >
              {categories.map((c) => (
                <MenuItem key={c.label} value={c.label}>
                  {c.icon} {c.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Min Price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              size="small"
              sx={{ width: 140 }}
            />

            <TextField
              label="Max Price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              size="small"
              sx={{ width: 140 }}
            />

            <Button variant="contained" onClick={onFilterApply}>
              Apply
            </Button>
            <Button variant="outlined" onClick={onFilterReset}>
              Reset
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* GRID LISTING */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ mb: 6 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h5" fontWeight="700">
                {category !== "All"
                  ? `${category} Packages`
                  : "Popular Packages"}
              </Typography>
              <Typography sx={{ color: "#64748b" }}>
                {packages.length} packages available
              </Typography>
            </Box>
          </Stack>

          {packages.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: "center", borderRadius: "20px" }}>
              <Typography variant="h6" sx={{ color: "#94a3b8" }}>
                No packages found
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {packages.map((pkg) => (
                <Grid item xs={12} sm={6} md={3} key={pkg._id || pkg.id}>
                  <Card
                    onClick={() =>
                      navigate(`/package/${pkg.id || pkg._id}`)
                    }
                    sx={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 30px rgba(102, 126, 234, 0.2)",
                      },
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: 200,
                        overflow: "hidden",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={pkg.image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=60"}
                        alt={pkg.title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=60";
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", p: 1.5, minHeight: 180 }}>
                      <div>
                        <Stack direction="row" spacing={0.5} sx={{ mb: 0.8 }} alignItems="center">
                          <LocationOnIcon sx={{ color: "#667eea", fontSize: 14 }} />
                          <Typography sx={{ color: "#64748b", fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {pkg.location || "Location TBA"}
                          </Typography>
                        </Stack>

                        <Typography
                          variant="body2"
                          fontWeight="700"
                          sx={{ mb: 0.6, fontSize: 13, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                        >
                          {pkg.title}
                        </Typography>

                        <Typography sx={{ color: "#64748b", mb: 1, fontSize: 11, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", height: 24 }}>
                          {pkg.description || "Travel experience"}
                        </Typography>
                      </div>

                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" fontWeight="700" sx={{ fontSize: 12, color: "#667eea" }}>
                          ₹{pkg.price?.toLocaleString() || "N/A"}
                        </Typography>

                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openBookingDialog(pkg);
                          }}
                          sx={{ fontSize: 10, padding: "4px 10px" }}
                        >
                          Book
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* BOOKING DIALOG */}
      <Dialog open={bookingOpen} onClose={closeBookingDialog}>
        <DialogTitle>Book {selectedPackage?.title}</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 320,
            mt: 1,
          }}
        >
          <TextField
            label="Travel Date"
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Persons"
            type="number"
            value={bookingPersons}
            onChange={(e) => setBookingPersons(e.target.value)}
            inputProps={{ min: 1 }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700 }}>Total Price:</Typography>
            <Typography>
              ₹
              {selectedPackage
                ? (selectedPackage.price || 0) * bookingPersons
                : 0}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeBookingDialog}>Cancel</Button>
          <Button variant="contained" onClick={confirmBooking}>
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
