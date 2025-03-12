import axios from "axios";

const API_URL = "http://localhost:3000/api/pets";

// Get all pets for the current user
const getUserPets = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch pets" };
  }
};

// Get a specific pet by ID
const getPetById = async (petId) => {
  try {
    const response = await axios.get(`${API_URL}/${petId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch pet details" };
  }
};

// Create a new pet
const createPet = async (petData) => {
  try {
    const response = await axios.post(API_URL, petData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to create pet" };
  }
};

// Update a pet
const updatePet = async (petId, petData) => {
  try {
    const response = await axios.put(`${API_URL}/${petId}`, petData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to update pet" };
  }
};

// Delete a pet
const deletePet = async (petId) => {
  try {
    const response = await axios.delete(`${API_URL}/${petId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to delete pet" };
  }
};

const petService = {
  getUserPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
};

export default petService;
