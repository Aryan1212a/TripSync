import React from "react";
import { Box, Chip } from "@mui/material";

const categories = [
  "All",
  "Beaches",
  "Honeymoon",
  "Adventure",
  "Family",
  "Luxury",
  "Budget",
];

export default function CategoryTabs({ onSelect = () => {} }) {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {categories.map((c) => (
        <Chip
          key={c}
          label={c}
          clickable
          onClick={() => onSelect(c === "All" ? "" : c)}
          sx={{ px: 2, py: 1, fontWeight: 700 }}
        />
      ))}
    </Box>
  );
}
