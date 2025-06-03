import { api } from '../config/api';
import type { User, ApiError, TimeSlot, Appointment } from '../types';

// Define slot response interface for API responses
interface SlotResponse {
  start: string;
  end: string;
  available: boolean;
}

// Define groomer schedule interface
interface GroomerSchedule {
  groomerId: string;
  date: string;
  availability: TimeSlot[];
  appointments: Appointment[];
}

const getAllGroomers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/groomers');
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: ApiError } };
    throw apiError.response?.data || { error: "Failed to fetch groomers" };
  }
};

const getGroomerById = async (groomerId: string): Promise<User> => {
  try {
    const response = await api.get(`/groomers/${groomerId}`);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: ApiError } };
    throw apiError.response?.data || { error: "Failed to fetch groomer details" };
  }
};

/*
const date = new Date('2025-03-13T09:01:30Z');
const formattedDate = date instanceof Date ? date.toISOString().split("T")[0] : date;
console.log(formattedDate); Output: "2025-03-13"
*/
const getGroomerAvailability = async (
  groomerId: string, 
  date: string | Date, 
  duration: number = 60
): Promise<TimeSlot[]> => {
  try {
    const formattedDate = date instanceof Date ? date.toISOString().split("T")[0] : date;
    const response = await api.get(
      `/groomers/${groomerId}/availability?date=${formattedDate}&duration=${duration}`
    );

    // convert the dates to Date objects
    return response.data.map((slot: SlotResponse) => ({
      ...slot,
      start: new Date(slot.start),
      end: new Date(slot.end),
    }));
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: ApiError } };
    throw apiError.response?.data || { error: "Failed to fetch groomer availability" };
  }
};

const getGroomerSchedule = async (groomerId: string, date: string): Promise<GroomerSchedule> => {
  try {
    const response = await api.get(`/groomers/${groomerId}/schedule`, {
      params: { date }
    });
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: ApiError } };
    throw apiError.response?.data || { error: "Failed to fetch groomer schedule" };
  }
};

const groomerService = {
  getAllGroomers,
  getGroomerById,
  getGroomerAvailability,
  getGroomerSchedule,
};

export default groomerService;
