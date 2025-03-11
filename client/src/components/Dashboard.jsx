import React from "react";
import { Typography, Paper, Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Paper>
      <Box p={2}>
        <Typography variant="h5">Dashboard</Typography>
        <Typography variant="body1">
          Welcome, {user?.name} ({user?.role})
        </Typography>
      </Box>
    </Paper>
  );
};

export default Dashboard;
