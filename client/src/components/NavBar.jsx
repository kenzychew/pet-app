import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const NavBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: "none", color: "white" }}
        >
          Furkids
        </Typography>
        <Box>
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              
              {/* Owner-specific navigation */}
              {user?.role === "owner" && (
                <>
                  <Button color="inherit" component={Link} to="/pets">
                    Pets
                  </Button>
                  <Button color="inherit" component={Link} to="/appointments">
                    Appointments
                  </Button>
                </>
              )}
              
              {/* Groomer-specific navigation */}
              {user?.role === "groomer" && (
                <>
                <Button color="inherit" component={Link} to="/schedule">
                  Schedule
                </Button>
                <Button color="inherit" component={Link} to="/calendar">
                  Calendar
                </Button>
                </>
              )}
              
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
