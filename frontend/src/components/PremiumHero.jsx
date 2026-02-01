import React, { useState } from "react";
import { Box, Typography, TextField, IconButton, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function PremiumHero({ onSearch = () => {} }) {
  const [q, setQ] = useState("");

  return (
    <Box sx={{
      background: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(240,248,255,0.85))",
      borderRadius: 3,
      p: { xs: 2, md: 4 },
      boxShadow: "0 10px 30px rgba(20,60,120,0.06)"
    }}>
      <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
        Explore places you’ll love
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Curated trips, flight + hotel combos and verified partners.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Box sx={{
          display: "flex",
          alignItems: "center",
          background: "white",
          borderRadius: "999px",
          px: 2,
          py: 1,
          boxShadow: "0 6px 18px rgba(5,40,80,0.04)",
          flex: "1 1 360px"
        }}>
          <SearchIcon color="action" sx={{ mr: 1 }} />
          <TextField
            placeholder="Search city, package or attraction"
            variant="standard"
            InputProps={{ disableUnderline: true }}
            fullWidth
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSearch(q); }}
          />
        </Box>

        <Button variant="contained" onClick={() => onSearch(q)} sx={{ height: 48 }}>
          Search
        </Button>

        <Button variant="outlined" sx={{ height: 48, ml: "auto", display: { xs: "none", md: "inline-flex" } }}>
          Trending: Maldives
        </Button>
      </Box>
    </Box>
  );
}
