import React, { useContext } from "react";
import { useAuth } from "../context/AuthContext"; 
import { createBooking } from "../services/booking";
import { Container, Typography, Button } from "@mui/material";

export default function Payment() {
  const { user } = useAuth();

  const confirmPayment = async () => {
    const temp = JSON.parse(localStorage.getItem("booking_temp"));
    
    const payload = {
      ...temp,
      total: temp.persons * 1000  // demo calculation
    };

    try {
      await createBooking(user.token, payload);
      window.location.href = "/payment-success";
    } catch (err) {
      alert("Payment failed.");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Payment</Typography>

      <Typography sx={{ mt: 2 }}>
        Demo payment — press Pay Now to continue.
      </Typography>

      <Button variant="contained" fullWidth sx={{ mt: 3 }}
        onClick={confirmPayment}>
        Pay Now
      </Button>
    </Container>
  );
}
