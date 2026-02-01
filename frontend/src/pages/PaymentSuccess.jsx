import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <Container sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4">🎉 Booking Confirmed!</Typography>

      <Typography sx={{ mt: 2 }}>Your trip is booked successfully.</Typography>

      <Button variant="contained" sx={{ mt: 3 }} component={Link} to="/">
        Go Home
      </Button>
    </Container>
  );
}
