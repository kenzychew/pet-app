import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, 
  TextField, Stack, FormHelperText, CircularProgress, Alert } from "@mui/material";
import appointmentService from "../services/appointmentService";
import useInitialData from "../hooks/useInitialData";
import useAvailability from "../hooks/useAvailability";
import { formatDateForInput, filterPastTimeSlots } from "../utils/dateUtils";

const BookingForm = ({ open, onClose, onSuccess, onError, isRescheduling = false, appointmentToReschedule = null }) => {
  // uses useInitialData custom hook for fetching initial data required for the form
  const { pets, groomers, loading: dataLoading, error: dataError } = useInitialData(open);
  
  // form state, date appropriately formatted (YYYY-MM-DD)
  const [formData, setFormData] = useState({
    petId: "",
    groomerId: "",
    serviceType: "basic",
    date: formatDateForInput(new Date()),
    startTime: ""
  });
  
  // uses useAvailability custom hook for fetching available time slots based on: selected groomer, chosen date, and service type
  const { 
    slots, 
    loading: slotsLoading, 
    error: slotsError 
  } = useAvailability(formData.groomerId, formData.date, formData.serviceType);
  
  const [submitting, setSubmitting] = useState(false); // indicates if form submission in progress
  const [error, setError] = useState(null); // captures any error that occurs during submission
  
  // combines loading and error states
  const loading = dataLoading || slotsLoading || submitting; // initial data, time slot availability, or submission
  const formError = error || dataError || slotsError; // submission, initial data, or slot fetching

  // useEffect for initializing form data when form is open or if rescheduling mode is active
  useEffect(() => { // if rescheduling, pre-fill form using appointmentToReschedule data
    if (isRescheduling && appointmentToReschedule) {
      const appointmentDate = new Date(appointmentToReschedule.startTime);
      setFormData({
        petId: appointmentToReschedule.petId._id || appointmentToReschedule.petId,
        groomerId: appointmentToReschedule.groomerId._id || appointmentToReschedule.groomerId,
        serviceType: appointmentToReschedule.serviceType,
        date: formatDateForInput(appointmentDate), // output: YYYY-MM-DD
        startTime: ""
      });
    } else { // sets default values for new booking
      setFormData({
        petId: "",
        groomerId: "",
        serviceType: "basic",
        date: formatDateForInput(new Date()),
        startTime: ""
      });
    }
  }, [isRescheduling, appointmentToReschedule, open]);

  // changes to input field updates formData state
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // also resets startTime if any of the fields affecting availability are changed
    if (["date", "groomerId", "serviceType"].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: value, startTime: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      // constructs appointmentData obj with necessary details
      const appointmentData = {
        petId: formData.petId,
        groomerId: formData.groomerId,
        serviceType: formData.serviceType,
        startTime: formData.startTime
      };
      // based on mode, calls appointmentService methods to reschedule or create appt
      if (isRescheduling && appointmentToReschedule) {
        await appointmentService.updateAppointment(
          appointmentToReschedule._id,
          appointmentData
        );
      } else {
        await appointmentService.createAppointment(appointmentData);
      }
      // triggers onSuccess callback which calls fetchAppointments and resets reschedule data, 
      onSuccess();
    } catch (err) { // sets error msg accordingly
      const errorMessage = err.message || `Failed to ${isRescheduling ? 'reschedule' : 'book'} appointment`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // filters out past time slots using the utility function in dateUtils.js
  const validTimeSlots = filterPastTimeSlots(slots, formData.date);

  // form is valid if pet, groomer and startTime are selected
  const isFormValid = formData.petId && formData.groomerId && formData.startTime;
  const today = formatDateForInput(new Date()); // date fields restricted to dates not earlier than today via form input props below

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isRescheduling ? "Reschedule Appointment" : "Book an Appointment"}
      </DialogTitle>
      
      <DialogContent>
        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
        
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Pet Selection */}
          <FormControl fullWidth required>
            <InputLabel>Pet</InputLabel>
            <Select
              name="petId"
              value={formData.petId}
              onChange={handleChange}
              disabled={loading || pets.length === 0}
            >
              {pets.map(pet => (
                <MenuItem key={pet._id} value={pet._id}>
                  {pet.name} ({pet.species})
                </MenuItem>
              ))}
            </Select>
            {pets.length === 0 && (
              <FormHelperText error>You need to add a pet first</FormHelperText>
            )}
          </FormControl>
          
          {/* Groomer Selection */}
          <FormControl fullWidth required>
            <InputLabel>Groomer</InputLabel>
            <Select
              name="groomerId"
              value={formData.groomerId}
              onChange={handleChange}
              disabled={loading}
            >
              {groomers.map(groomer => (
                <MenuItem key={groomer._id} value={groomer._id}>
                  {groomer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Service Type */}
          <FormControl fullWidth required>
            <InputLabel>Service Type</InputLabel>
            <Select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              disabled={loading}
            >
              <MenuItem value="basic">Basic Grooming - 60 min</MenuItem>
              <MenuItem value="full">Full Grooming 120 min</MenuItem>
            </Select>
          </FormControl>
          
          {/* Date Selection */}
          <TextField
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
            disabled={loading}
          />
          
          {/* Time Slot Selection */}
          {formData.groomerId && formData.date && (
            <FormControl fullWidth required>
              <InputLabel>Time Slot</InputLabel>
              <Select
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                disabled={loading || validTimeSlots.length === 0}
              >
                {validTimeSlots.map((slot) => {
                  const time = new Date(slot.start);
                  return (
                    <MenuItem key={slot.start} value={slot.start}>
                      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </MenuItem>
                  );
                })}
              </Select>
              {validTimeSlots.length === 0 && formData.groomerId && (
                <FormHelperText error>No available slots left for this date</FormHelperText>
              )}
            </FormControl>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || !isFormValid}
        >
          {loading ? <CircularProgress size={24} /> : (isRescheduling ? "Reschedule" : "Book")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingForm;

// Vertical Stack of form controls
// pet & groomer selection populated with pets and groomers from useInitialData
// type="date" to render a HTML5 date input element telling browsers to display a calendar picker
//  setting min value to current date prevents users from selecting past dates
// time slot dropdown displays available time slots fetched from useAvailability
//  time slot selection only appears once a groomer and a date have been chosen

// TODO: https://mui.com/x/react-date-pickers/getting-started/ change calendar to datepicker
