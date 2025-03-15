import React, { useState } from "react";
import { Typography, Paper, Box, Button } from "@mui/material";
import AppointmentList from "../components/AppointmentList";
import BookingForm from "../components/BookingForm";

const AppointmentPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleBookingSuccess = () => {
    setBookingOpen(false);
    setRefreshKey(prev => prev + 1); // Trigger list refresh
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            My Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your pet grooming appointments
          </Typography>
        </div>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setBookingOpen(true)}
        >
          Create Appointment
        </Button>
      </Box>
      
      <AppointmentList key={refreshKey} />
      
      <BookingForm 
        open={bookingOpen} 
        onClose={() => setBookingOpen(false)}
        onSuccess={handleBookingSuccess}
      />
    </Paper>
  );
};

export default AppointmentPage; 
