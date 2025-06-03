export interface User {
    _id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: 'owner' | 'groomer';
  }
  
  export interface Pet {
    _id: string;
    name: string;
    species: 'dog' | 'cat';
    breed: string;
    age: number;
    notes?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  }
  // union types are a design choice for MongoDB/Mongoose patterns
  // when fetch from API, get petId: string
  // when populated/joined, get petId: Pet object
  export interface Appointment {
    _id: string;
    petId: string | Pet;
    ownerId: string | User;
    groomerId: string | User;
    serviceType: 'basic' | 'full';
    duration: 60 | 120;
    startTime: string;
    endTime: string;
    status: 'confirmed' | 'completed';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Groomer {
    _id: string;
    name: string;
    email: string;
    specialties?: string[];
  }

  // Add missing auth-related interfaces
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'owner' | 'groomer';
  }

  export interface LoginResponse {
    user: User;
    token: string;
  }

  export interface ApiError {
    error: string;
    message?: string;
  }

  // Service data interfaces
  export interface CreatePetData {
    name: string;
    species: 'dog' | 'cat';
    breed: string;
    age: number;
    notes?: string;
  }
  // UpdatePetData declares no new members {}, essentially a functionally equivalent partial of CreatePetData
  // Partial<T> util type simply makes all props of the original optional
  // Indicates this type is for updating pet data, can always add more update-specific props later if needed
  // Makes sense bc when updating, we only change some fields/props, not all of them
  // Common design pattern for creating semantically meaningful type aliases in TS
  // Now this allows for flexible partial updates while maintaining type safety on the fields that are provided
  export interface UpdatePetData extends Partial<CreatePetData> {}

  export interface CreateAppointmentData {
    petId: string;
    groomerId: string;
    serviceType: 'basic' | 'full';
    startTime: string;
  }

  export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {}

  export interface TimeSlot {
    start: Date;
    end: Date;
    available: boolean;
  }

  export type AppointmentStatus = 'confirmed' | 'completed';

  // add interface for quick actions
  export interface QuickAction {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    link?: string;
    action?: () => void;
    color: string;
  }
