import React from "react";
import { Card, CardMedia, CardContent, Typography, Box, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function PackageCard({ pkg }) {
  const navigate = useNavigate();
  const pkgId = pkg._id || pkg.id;

  const finalPrice = Math.round(pkg.price * (1 - (pkg.discount || 0) / 100));

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
      <Card
        onClick={() => navigate(`/package/${pkgId}`)}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        }}
      >
        <CardMedia
          component="img"
          height="220"
          src={
            pkg.images?.[0] ||
            pkg.imageUrls?.[0] ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400"
          }
          alt={pkg.title}
          sx={{ objectFit: "cover" }}
        />

        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {pkg.title}
            </Typography>
            <Chip label={`${pkg.rating || 4.5}★`} color="primary" size="small" />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {pkg.description?.slice(0, 80)}...
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#007bff" }}>
                ₹ {finalPrice}
              </Typography>
              {pkg.discount && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  ₹ {pkg.price}
                </Typography>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {pkg.duration}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
