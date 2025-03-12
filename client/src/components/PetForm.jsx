import { useState, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Alert
} from "@mui/material";

const PetForm = ({ open, onClose, pet, onSave, error }) => {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    notes: ""
  });

  // reset form when pet changes or modal opens
  useEffect(() => {
    setFormData(pet ? {
      name: pet.name || "",
      species: pet.species || "",
      breed: pet.breed || "",
      age: pet.age || "",
      notes: pet.notes || ""
    } : {
      name: "",
      species: "",
      breed: "",
      age: "",
      notes: ""
    });
  }, [pet, open]);

  const handleChange = e => setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });

  const handleSubmit = e => {
    e.preventDefault();
    onSave(formData, pet?._id);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{pet ? "Edit Pet" : "Add Pet"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth margin="normal"
                label="Name" name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth margin="normal"
                label="Species" name="species"
                value={formData.species}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth margin="normal"
                label="Breed" name="breed"
                value={formData.breed}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth margin="normal"
                label="Age" name="age" type="number"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth margin="normal"
                label="Notes" name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PetForm; 
