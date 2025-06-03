import { api } from '../config/api';
import type { Pet, CreatePetData, UpdatePetData, Appointment, ApiError } from '../types';

export const petService = {
  // get all pets for current user
  getUserPets: async (): Promise<Pet[]> => {
    try {
      console.log('Fetching user pets...');
      const response = await api.get('/pets');
      console.log('Pets response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching pets:', error);
      throw error;
    }
  },

  // get pet by ID
  getPetById: async (petId: string): Promise<Pet> => {
    try {
      console.log('Fetching pet by ID:', petId);
      const response = await api.get(`/pets/${petId}`);
      console.log('Pet response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching pet by ID:', error);
      throw error;
    }
  },

  // create new pet
  createPet: async (petData: CreatePetData): Promise<Pet> => {
    try {
      console.log('Creating pet with data:', petData);
      const response = await api.post('/pets', petData);
      console.log('Create pet response:', response.data);
      // Handle both possible response structures
      return response.data.pet || response.data;
    } catch (error) {
      console.error('Error creating pet:', error);
      throw error;
    }
  },

  // update pet - now properly handles response
  updatePet: async (petId: string, updateData: UpdatePetData): Promise<Pet> => {
    try {
      console.log('Updating pet:', petId, 'with data:', updateData);
      const response = await api.put(`/pets/${petId}`, updateData);
      console.log('Update pet response:', response.data);
      
      // handle both possible response structures from backend
      const updatedPet = response.data.pet || response.data;
      
      // validate that we have the required fields
      if (!updatedPet._id || !updatedPet.name) {
        throw new Error('Invalid pet data received from server');
      }
      
      return updatedPet;
    } catch (error: unknown) {
      console.error('Error updating pet:', error);
      const apiError = error as { response?: { data?: ApiError } };
      throw apiError.response?.data || { error: "Failed to update pet" };
    }
  },

  // delete pet
  deletePet: async (petId: string): Promise<void> => {
    try {
      console.log('Deleting pet:', petId);
      await api.delete(`/pets/${petId}`);
      console.log('Pet deleted successfully');
    } catch (error) {
      console.error('Error deleting pet:', error);
      throw error;
    }
  },

  // get appointments for a specific pet (grooming history)
  getPetAppointments: async (petId: string): Promise<Appointment[]> => {
    try {
      console.log(`Fetching appointments for pet ${petId}...`);
      const response = await api.get<Appointment[]>(`/pets/${petId}/appointments`);
      console.log(`Pet appointments response:`, response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('Error fetching pet appointments:', error);
      throw error;
    }
  }
};
