import React, { useState } from "react";
import { Typography, Paper, Box, Button, Snackbar, Alert } from "@mui/material";
import AppointmentList from "../components/AppointmentList";
import BookingForm from "../components/BookingForm";

const AppointmentPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" // success, error, warning, info
  });
  
  const handleBookingSuccess = () => {
    setBookingOpen(false);
    setRefreshKey(prev => prev + 1);
    showNotification("Appointment successfully created", "success");
  };
  
  const handleRescheduleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    showNotification("Appointment successfully rescheduled", "success");
  };
  
  const handleDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1);
    showNotification("Appointment successfully cancelled", "success");
  };
  
  const handleError = (message) => {
    showNotification(message || "An error occurred", "error");
  };
  
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
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
      
      <AppointmentList 
        key={refreshKey} 
        onRescheduleSuccess={handleRescheduleSuccess}
        onDeleteSuccess={handleDeleteSuccess}
        onError={handleError}
      />
      
      <BookingForm 
        open={bookingOpen} 
        onClose={() => setBookingOpen(false)}
        onSuccess={handleBookingSuccess}
        onError={handleError}
      />
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AppointmentPage;
