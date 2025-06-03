import type { Appointment, CreateAppointmentData, UpdateAppointmentData, AppointmentStatus, ApiError } from "../types";
import { api } from '../config/api';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

const getUserAppointments = async (): Promise<Appointment[]> => {
  try {
    console.log('Fetching user appointments...');
    const response = await api.get('/appointments');
    console.log('Appointments response:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching appointments:', error);
    const apiError = error as { response?: { data?: ApiError; status?: number } };
    
    // Log more details for debugging
    if (apiError.response) {
      console.error('Response status:', apiError.response.status);
      console.error('Response data:', apiError.response.data);
    }
    
    throw apiError.response?.data || { error: "Failed to fetch appointments" };
  }
};

const getAppointmentById = async (appointmentId: string): Promise<Appointment> => {
  const response = await api.get(`/appointments/${appointmentId}`);
  return response.data;
};

const createAppointment = async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
  try {
    const response = await api.post('/appointments', appointmentData);
    return response.data.appointment || response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: ApiError } };
    throw apiError.response?.data || { error: "Failed to create appointment" };
  }
};

const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus): Promise<Appointment> => {
  try {
    const response = await api.patch(`/appointments/${appointmentId}/status`, {
      status,
    });
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: ApiError } };
    throw apiError.response?.data || { error: "Failed to update appointment status" };
  }
};

const updateAppointment = async (appointmentId: string, appointmentData: UpdateAppointmentData): Promise<Appointment> => {
  try {
    const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data.appointment || response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: ApiError } };
    throw apiError.response?.data || { error: "Failed to update appointment" };
  }
};

const deleteAppointment = async (appointmentId: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: ApiError } };
    throw apiError.response?.data || { error: "Failed to delete appointment" };
  }
};

const getAvailableTimeSlots = async (groomerId: string, date: string, duration: number): Promise<TimeSlot[]> => {
  const response = await api.get(`/appointments/available-slots/${groomerId}`, {
    params: { date, duration }
  });
  return response.data;
};

const appointmentService = {
  getUserAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  getAvailableTimeSlots,
};

export default appointmentService;
