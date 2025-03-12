import React, { useState, useEffect } from "react";
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from "@mui/material";
import petService from "../services/petService";

const PetManagement = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    notes: ""
  });

  // Fetch user's pets on component mount
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const pets = await petService.getUserPets();
        setPets(pets);
      } catch (err) {
        setError(err.error || "Failed to load pets");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await petService.createPet(formData);
      setPets([...pets, response.pet]);
      
      // Reset form
      setFormData({
        name: "",
        species: "",
        breed: "",
        age: "",
        notes: ""
      });
    } catch (err) {
      setError(err.error || "Failed to add pet");
    }
  };

  if (loading) return <Typography>Loading pets...</Typography>;

  return (
    <Box>
      {/* Add Pet Form */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h5" gutterBottom>Add a New Pet</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            fullWidth
            label="Pet Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Species"
            name="species"
            value={formData.species}
            onChange={handleChange}
            required
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Breed"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            required
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            required
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={2}
          />
          
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Add Pet
          </Button>
        </Box>
      </Paper>
      
      {/* Pet List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Your Pets</Typography>
        
        {pets.length === 0 ? (
          <Typography color="text.secondary">You haven't added any pets yet.</Typography>
        ) : (
          <List>
            {pets.map((pet, index) => (
              <React.Fragment key={pet._id}>
                <ListItem>
                  <ListItemText
                    primary={pet.name}
                    secondary={`${pet.species} • ${pet.breed} • ${pet.age} years old ${pet.notes ? `• ${pet.notes}` : ''}`}
                  />
                </ListItem>
                {index < pets.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default PetManagement; 
