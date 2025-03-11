import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Alert,
  MenuItem,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "owner",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword, role } = formData;

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      await register({ name, email, password, role });
      navigate("/dashboard");
    } catch (err) {
      setError(err.error || "Registration failed");
    }
  };

  return (
    <Paper>
      <Box p={2} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5">Register</Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          margin="normal"
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <TextField
          margin="normal"
          fullWidth
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <TextField
          margin="normal"
          fullWidth
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <TextField
          margin="normal"
          fullWidth
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <TextField
          select
          margin="normal"
          fullWidth
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <MenuItem value="owner">Pet Owner</MenuItem>
          <MenuItem value="groomer">Groomer</MenuItem>
        </TextField>

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
          Register
        </Button>

        <Box mt={2}>
          <Link to="/login">Already have an account? Login</Link>
        </Box>
      </Box>
    </Paper>
  );
};

export default Register;
