import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PackageDetail from "./pages/PackageDetail";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";

import UserDashboard from "./pages/UserDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Header />
      <Routes>

        {/* PUBLIC PAGES */}
        <Route path="/" element={<Home />} />
        <Route path="/package/:id" element={<PackageDetail />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DASHBOARDS */}
        <Route path="/user/dashboard" 
               element={<ProtectedRoute role="traveler"><UserDashboard/></ProtectedRoute>} />
        <Route path="/dashboard/user" 
               element={<ProtectedRoute role="traveler"><UserDashboard/></ProtectedRoute>} />

        <Route path="/agent/dashboard" 
               element={<ProtectedRoute role="travel_partner"><AgentDashboard/></ProtectedRoute>} />
        <Route path="/dashboard/agent" 
               element={<ProtectedRoute role="travel_partner"><AgentDashboard/></ProtectedRoute>} />

        <Route path="/travel_partner/dashboard" 
               element={<ProtectedRoute role="travel_partner"><AgentDashboard/></ProtectedRoute>} />
        <Route path="/dashboard/travel_partner" 
               element={<ProtectedRoute role="travel_partner"><AgentDashboard/></ProtectedRoute>} />

        <Route path="/admin/dashboard" 
               element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>} />
        <Route path="/dashboard/admin" 
               element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>} />

      </Routes>
    </>
  );
}

export default App;
