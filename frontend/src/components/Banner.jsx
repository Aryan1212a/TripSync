import React from "react";
import { Box } from "@mui/material";

export default function Banner() {
  return (
    <Box
      sx={{
        height: 300,
        backgroundImage:
          "url('https://images.unsplash.com/photo-1519125323398-675f0ddb6308')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: 2,
        mb: 3,
      }}
    ></Box>
  );
}
