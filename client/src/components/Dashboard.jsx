import React from "react";
import { Typography, Paper, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Paper>
      <Box p={2}>
        <Typography variant="h5" gutterBottom>Dashboard</Typography>
        <Typography variant="body1" gutterBottom>
          Welcome, {user?.name} ({user?.role})
        </Typography>
        
        {user?.role === "owner" && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>Pet Owner Options</Typography>
            <Button 
              variant="contained" 
              component={Link} 
              to="/pets"
              sx={{ mr: 1 }}
            >
              Manage Pets
            </Button>
            <Button 
              variant="outlined"
              disabled
            >
              Book Appointment (Coming Soon)
            </Button>
          </Box>
        )}
        
        {user?.role === "groomer" && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>Groomer Options</Typography>
            <Button 
              variant="outlined"
              disabled
            >
              View Appointments (Coming Soon)
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default Dashboard;
