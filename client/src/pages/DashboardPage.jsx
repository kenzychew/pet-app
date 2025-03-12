import React from "react";
import { Typography, Paper, Box, Button, Container, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PetsIcon from "@mui/icons-material/Pets";
import EventIcon from "@mui/icons-material/Event";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Welcome, {user?.name}
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {user?.role === "owner" && (
            <>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <PetsIcon sx={{ fontSize: 40, mb: 2, color: "primary.main" }} />
                    <Typography variant="h5" gutterBottom>Manage Pets</Typography>
                    <Typography variant="body2" sx={{ mb: 3, flexGrow: 1 }}>
                      Add, edit, or remove your pets from our system.
                    </Typography>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to="/pets"
                      fullWidth
                    >
                      My Pets
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <EventIcon sx={{ fontSize: 40, mb: 2, color: "primary.main" }} />
                    <Typography variant="h5" gutterBottom>Book Appointment</Typography>
                    <Typography variant="body2" sx={{ mb: 3, flexGrow: 1 }}>
                      Schedule a grooming appointment for your pet.
                    </Typography>
                    <Button 
                      variant="outlined"
                      fullWidth
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </>
          )}
          
          {user?.role === "groomer" && (
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <EventIcon sx={{ fontSize: 40, mb: 2, color: "primary.main" }} />
                  <Typography variant="h5" gutterBottom>Appointments</Typography>
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    View and manage your upcoming appointments.
                  </Typography>
                  <Button 
                    variant="outlined"
                    fullWidth
                    disabled
                  >
                    Coming Soon
                  </Button>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage; 
