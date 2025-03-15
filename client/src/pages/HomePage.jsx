import React from "react";
import { Typography, Paper, Box, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Pet App
        </Typography>
        
        <Typography variant="h6" color="text.secondary">
          Book grooming appointments for your pets with your preferred groomers
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          {isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to="/dashboard"
            >
              Go to Dashboard
            </Button>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/login"
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/register"
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default HomePage;
