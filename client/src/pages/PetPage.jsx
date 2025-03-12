import React, { useState, useEffect } from "react";
import { 
  Typography, Paper, Box, List, ListItem, ListItemText, 
  Divider, Alert, Container, Button, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import petService from "../services/petService";
import PetForm from "../components/PetForm";

const PetPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ form: false, delete: false, pet: null });

  useEffect(() => {
    petService.getUserPets()
      .then(data => setPets(data))
      .catch(err => setError(err.error || "Failed to load pets"))
      .finally(() => setLoading(false));
  }, []);

  const handleSavePet = async (formData, petId) => {
    try {
      if (petId) {
        const { pet } = await petService.updatePet(petId, formData);
        setPets(pets.map(p => p._id === petId ? pet : p));
      } else {
        const { pet } = await petService.createPet(formData);
        setPets([...pets, pet]);
      }
      setModal({ ...modal, form: false, pet: null });
    } catch (err) {
      setError(err.error || "Failed to save pet");
    }
  };

  const handleDeletePet = async () => {
    try {
      await petService.deletePet(modal.pet._id);
      setPets(pets.filter(p => p._id !== modal.pet._id));
      setModal({ ...modal, delete: false, pet: null });
    } catch (err) {
      setError(err.error || "Failed to delete pet");
      setModal({ ...modal, delete: false });
    }
  };

  if (loading) return <Typography sx={{ textAlign: 'center', py: 4 }}>Loading pets...</Typography>;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">My Pets</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setModal({ ...modal, form: true, pet: null })}
          >
            Add Pet
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Paper elevation={3} sx={{ p: 3 }}>
          {pets.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              You haven't added any pets yet.
            </Typography>
          ) : (
            <List>
              {pets.map((pet, index) => (
                <React.Fragment key={pet._id}>
                  <ListItem
                    secondaryAction={
                      <>
                        <IconButton onClick={() => setModal({ ...modal, form: true, pet })}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => setModal({ ...modal, delete: true, pet })}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={<Typography variant="h6">{pet.name}</Typography>}
                      secondary={`Species: ${pet.species} | Breed: ${pet.breed} | Age: ${pet.age} y/o ${pet.notes ? `| Notes: ${pet.notes}` : ''}`}
                    />
                  </ListItem>
                  {index < pets.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
      
      {/* Pet form modal */}
      <PetForm 
        open={modal.form}
        onClose={() => setModal({ ...modal, form: false, pet: null })}
        pet={modal.pet}
        onSave={handleSavePet}
        error={error}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={modal.delete} onClose={() => setModal({ ...modal, delete: false })}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Confirm deleting {modal.pet?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModal({ ...modal, delete: false })}>Cancel</Button>
          <Button onClick={handleDeletePet} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PetPage;
