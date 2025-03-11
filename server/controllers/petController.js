const Pet = require("../models/Pet");

exports.getUserPets = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const pets = await Pet.find({ ownerId });
    res.status(200).json(pets);
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({ error: "Server error fetching pets" });
  }
};

exports.getPetById = async (req, res) => {
  try {
    const petId = req.params.id;
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    // if owner, check if pet belongs to them
    if (req.user.role === "owner" && pet.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to view this pet" });
    }
    res.status(200).json(pet);
  } catch (error) {
    console.error("Error fetching pet:", error);
    res.status(500).json({ error: "Server error fetching pet details" });
  }
};

exports.createPet = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only pet owners can add pets" });
    }
    const { name, species, breed, age, notes } = req.body;
    if (!name || !species || !breed || !age) {
      return res
        .status(400)
        .json({ error: "Missing required pet information" });
    }

    // create new pet with owner ID from authenticated user
    const newPet = new Pet({
      name,
      species,
      breed,
      age,
      notes,
      ownerId: req.user.id,
      updatedAt: Date.now(),
    });

    await newPet.save();

    res.status(201).json({
      message: "Pet added successfully",
      pet: newPet,
    });
  } catch (error) {
    console.error("Error creating pet:", error);
    res.status(500).json({ error: "Server error creating pet" });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const petId = req.params.id;
    const { name, species, breed, age, notes } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    if (pet.ownerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this pet" });
    }

    if (name) pet.name = name;
    if (species) pet.species = species;
    if (breed) pet.breed = breed;
    if (age) pet.age = age;
    if (notes !== undefined) pet.notes = notes;

    pet.updatedAt = Date.now();

    await pet.save();

    res.status(200).json({
      message: "Pet updated successfully",
      pet,
    });
  } catch (error) {
    console.error("Error updating pet:", error);
    res.status(500).json({ error: "Server error updating pet" });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const petId = req.params.id;

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    if (pet.ownerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this pet" });
    }

    await Pet.deleteOne({ _id: petId });

    res.status(200).json({
      message: "Pet deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pet:", error);
    res.status(500).json({ error: "Server error deleting pet" });
  }
};
