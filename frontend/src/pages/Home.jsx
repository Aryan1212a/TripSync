import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Button,
  ButtonBase,
  Card,
  CardMedia,
  CardContent,
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
  IconButton,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allPackages, setAllPackages] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [searchInput, setSearchInput] = useState("");
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const filteredPackages = useMemo(() => {
    const q = searchQuery;
    return allPackages.filter((p) => {
      const matchesQuery = q
        ? `${p.title} ${p.description} ${p.location}`
            .toLowerCase()
            .includes(q)
        : true;
      const price = Number(p.price || 0);
      const matchesPrice =
        price >= Number(minPrice) && price <= Number(maxPrice);
      const matchesCategory =
        category === "All" || p.category === category;
      return matchesQuery && matchesPrice && matchesCategory;
    });
  }, [allPackages, category, maxPrice, minPrice, searchQuery]);

  const priceFormatter = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }),
    []
  );

  useEffect(() => {
    // Always fetch from API first to get latest packages
    const fetchPackages = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const response = await fetch(`${API_URL}/api/packages/`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched from API:", data.length, "packages");
          setAllPackages(data);
          // Store with timestamp
          localStorage.setItem("public_packages", JSON.stringify(data));
          localStorage.setItem("packages_cache_time", Date.now().toString());
        } else {
          console.warn("API returned status:", response.status);
          // Fallback to localStorage if API fails
          const raw = localStorage.getItem("public_packages");
          const parsed = raw ? JSON.parse(raw) : [];
          console.log("Fallback to localStorage:", parsed.length, "packages");
          setAllPackages(parsed);
          setLoadError("Couldn't refresh packages. Showing cached results.");
        }
      } catch (e) {
        console.warn("API fetch failed, using localStorage:", e);
        // If API call fails, use localStorage
        const raw = localStorage.getItem("public_packages");
        const parsed = raw ? JSON.parse(raw) : [];
        console.log("Error fallback - localStorage:", parsed.length, "packages");
        setAllPackages(parsed);
        setLoadError("Couldn't load packages from the server. Showing cached results.");
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    if (!filteredPackages || filteredPackages.length <= 1) return;
    const t = setInterval(
      () => setSlideIndex((p) => (p + 1) % filteredPackages.length),
      5000
    );
    return () => clearInterval(t);
  }, [filteredPackages]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const onCategorySelect = (label) => {
    setCategory(label);
  };

  const onFilterApply = () => {
    setSlideIndex(0);
  };

  const onFilterReset = () => {
    setMinPrice(0);
    setMaxPrice(100000);
    setCategory("All");
    setSlideIndex(0);
  };

  const refreshPackages = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`${API_URL}/api/packages/`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      const data = await response.json();
      setAllPackages(data);
      localStorage.setItem("public_packages", JSON.stringify(data));
      localStorage.setItem("packages_cache_time", Date.now().toString());
    } catch (e) {
      const raw = localStorage.getItem("public_packages");
      setAllPackages(raw ? JSON.parse(raw) : []);
      setLoadError("Couldn't refresh packages. Showing cached results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSlideIndex(0);
  }, [searchQuery, category, minPrice, maxPrice]);


  const openBookingDialog = (pkg) => {
    setSelectedPackage(pkg);
    setBookingOpen(true);
  };

  const closeBookingDialog = () => setBookingOpen(false);

  const confirmBooking = () => {
    if (!selectedPackage) return;
    if (!bookingDate || Number(bookingPersons) < 1) return;

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
    setSlideIndex((p) => (p - 1 + filteredPackages.length) % filteredPackages.length);

  const nextSlide = () =>
    setSlideIndex((p) => (p + 1) % filteredPackages.length);

  const goToSlide = (i) => setSlideIndex(i);

  return (
    <Box
      sx={{
        width: "100%",
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(94, 115, 255, 0.25), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(255, 163, 102, 0.18), transparent 55%), #f7f8fb",
        minHeight: "100vh",
      }}
    >
      {user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              background:
                "linear-gradient(135deg, rgba(20, 30, 80, 0.9) 0%, rgba(52, 62, 120, 0.9) 100%)",
              py: 2,
              px: { xs: 2, md: 4 },
              borderBottom: "1px solid rgba(255,255,255,0.08)",
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
          background:
            "linear-gradient(135deg, rgba(17, 24, 75, 0.95) 0%, rgba(63, 63, 140, 0.95) 45%, rgba(19, 103, 138, 0.92) 100%)",
          py: { xs: 7, md: 10 },
          pb: { xs: 9, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.5,
            background:
              "radial-gradient(400px 280px at 20% 20%, rgba(255,255,255,0.25), transparent 70%), radial-gradient(500px 300px at 80% 10%, rgba(124, 255, 211, 0.3), transparent 70%)",
            pointerEvents: "none",
          }}
        />
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
                sx={{
                  color: "#fff",
                  mb: 2,
                  letterSpacing: "-0.02em",
                }}
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
                sx={{
                  maxWidth: 760,
                  mx: "auto",
                  p: 1,
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Where do you want to go?"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setSearchQuery(searchInput.trim().toLowerCase())}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#ffffff" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      color: "#fff",
                    },
                    "& input::placeholder": {
                      color: "rgba(255,255,255,0.7)",
                    },
                  }}
                />

                <Button
                  variant="contained"
                  onClick={() => setSearchQuery(searchInput.trim().toLowerCase())}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    borderRadius: "16px",
                    textTransform: "none",
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #7c5cff 0%, #4fd1c5 100%)",
                    boxShadow: "0 12px 30px rgba(79, 209, 197, 0.3)",
                  }}
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
            <Typography
              variant="h3"
              fontWeight="900"
              sx={{ mb: 1.5, letterSpacing: "-0.01em" }}
            >
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
              {loading && (
                <Card sx={{ borderRadius: "18px", overflow: "hidden", height: { xs: "auto", md: 420 } }}>
                  <Skeleton variant="rectangular" height={420} />
                </Card>
              )}

              {!loading && filteredPackages.length > 0 && (() => {
                const pkg = filteredPackages[slideIndex];
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
                        boxShadow: "0 18px 50px rgba(20, 20, 60, 0.18)",
                        cursor: "pointer",
                        height: { xs: "auto", md: 420 },
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(8px)",
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
                          loading="lazy"
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
                            bgcolor: "rgba(124, 92, 255, 0.9)",
                            color: "#fff",
                            backdropFilter: "blur(6px)",
                            border: "1px solid rgba(255,255,255,0.3)",
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
                              sx={{ color: "#7c5cff", fontSize: 18 }}
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
                            sx={{ color: "#14183a", mb: 1 }}
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
                                "linear-gradient(135deg, #7c5cff, #4fd1c5)",
                              backgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {priceFormatter.format(pkg.price || 0)}
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
                                borderRadius: "12px",
                                background:
                                  "linear-gradient(135deg,#7c5cff,#4fd1c5)",
                                boxShadow:
                                  "0 10px 20px rgba(79, 209, 197, 0.25)",
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

            {!loading && filteredPackages.length > 1 && (
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
                  <IconButton aria-label="Previous package">❮</IconButton>
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
                  <IconButton aria-label="Next package">❯</IconButton>
                </Box>
              </>
            )}

            {!loading && filteredPackages.length > 1 && (
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="center"
                sx={{ mt: 6 }}
              >
                {filteredPackages.map((_, idx) => (
                  <ButtonBase
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to package ${idx + 1}`}
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
        <Paper
          sx={{
            p: 4,
            borderRadius: "20px",
            mb: 4,
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backdropFilter: "blur(8px)",
          }}
          elevation={2}
        >
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
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: "999px",
                  borderColor: "rgba(124, 92, 255, 0.35)",
                }}
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
            <Button variant="text" onClick={refreshPackages}>
              Refresh
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
                {filteredPackages.length} packages available
              </Typography>
            </Box>
          </Stack>

          {loadError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {loadError}
            </Alert>
          )}

          {loading ? (
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                alignItems: "stretch",
              }}
            >
              {Array.from({ length: 4 }).map((_, idx) => (
                <Box key={idx} sx={{ display: "flex", minWidth: 0 }}>
                  <Skeleton
                    variant="rectangular"
                    height={280}
                    sx={{ borderRadius: "16px", width: "100%" }}
                  />
                </Box>
              ))}
            </Box>
          ) : filteredPackages.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: "center", borderRadius: "20px" }}>
              <Typography variant="h6" sx={{ color: "#94a3b8" }}>
                No packages found
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                alignItems: "stretch",
              }}
            >
              {filteredPackages.map((pkg) => (
                <Box key={pkg._id || pkg.id} sx={{ display: "flex", minWidth: 0 }}>
                  <Card
                    onClick={() =>
                      navigate(`/package/${pkg.id || pkg._id}`)
                    }
                    sx={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      height: "100%",
                      width: "100%",
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 16px 40px rgba(20, 20, 60, 0.18)",
                      },
                      cursor: "pointer",
                      background: "rgba(255,255,255,0.95)",
                      border: "1px solid rgba(15, 23, 42, 0.06)",
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
                        loading="lazy"
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

                    <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", p: 1.5, minHeight: 180, minWidth: 0 }}>
                      <div>
                        <Stack direction="row" spacing={0.5} sx={{ mb: 0.8 }} alignItems="center">
                        <LocationOnIcon sx={{ color: "#7c5cff", fontSize: 14 }} />
                          <Typography
                            sx={{
                              color: "#64748b",
                              fontSize: 11,
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflowWrap: "anywhere",
                              lineHeight: 1.3,
                              minHeight: "1.3em",
                            }}
                          >
                            {pkg.location || "Location TBA"}
                          </Typography>
                        </Stack>

                        <Typography
                          variant="body2"
                          fontWeight="700"
                          sx={{
                            mb: 0.6,
                            fontSize: 13,
                            lineHeight: 1.3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            minHeight: "2.6em",
                          }}
                        >
                          {pkg.title}
                        </Typography>

                        <Typography
                          sx={{
                            color: "#64748b",
                            mb: 1,
                            fontSize: 11,
                            lineHeight: 1.3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            minHeight: "2.6em",
                          }}
                        >
                          {pkg.description || "Travel experience"}
                        </Typography>
                      </div>

                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" fontWeight="700" sx={{ fontSize: 12, color: "#7c5cff" }}>
                          {priceFormatter.format(pkg.price || 0)}
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
                </Box>
              ))}
            </Box>
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
            inputProps={{
              min: new Date().toISOString().split("T")[0],
            }}
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
          <Button
            variant="contained"
            onClick={confirmBooking}
            disabled={!bookingDate || Number(bookingPersons) < 1}
          >
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
