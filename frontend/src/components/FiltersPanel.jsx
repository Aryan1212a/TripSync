import React, { useState } from "react";
import { Box, TextField, Button, MenuItem } from "@mui/material";

export default function FiltersPanel({ onApply = () => {} }) {
  const [filters, setFilters] = useState({ category: "", minPrice: "", maxPrice: "" });

  return (
    <Box sx={{
      display: "flex",
      gap: 2,
      flexWrap: "wrap",
      alignItems: "center"
    }}>
      <TextField
        select
        label="Category"
        value={filters.category}
        onChange={(e) => setFilters((s) => ({ ...s, category: e.target.value }))}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Any</MenuItem>
        <MenuItem value="Beaches">Beaches</MenuItem>
        <MenuItem value="Honeymoon">Honeymoon</MenuItem>
        <MenuItem value="Adventure">Adventure</MenuItem>
        <MenuItem value="Family">Family</MenuItem>
      </TextField>

      <TextField
        label="Min price"
        type="number"
        value={filters.minPrice}
        onChange={(e) => setFilters((s) => ({ ...s, minPrice: e.target.value }))}
        sx={{ width: 120 }}
      />

      <TextField
        label="Max price"
        type="number"
        value={filters.maxPrice}
        onChange={(e) => setFilters((s) => ({ ...s, maxPrice: e.target.value }))}
        sx={{ width: 120 }}
      />

      <Button variant="contained" onClick={() => onApply(filters)}>Apply</Button>
      <Button onClick={() => { setFilters({ category: "", minPrice: "", maxPrice: "" }); onApply({}); }}>Reset</Button>
    </Box>
  );
}

