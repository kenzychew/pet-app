import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography, CircularProgress, Alert } from "@mui/material";
import AppointmentCard from "./AppointmentCard";
import BookingForm from "./BookingForm";
import appointmentService from "../services/appointmentService";

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [rescheduleData, setRescheduleData] = useState({ open: false, appointment: null });

  // fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // fetch appt data from api
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getUserAppointments();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err.error || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await appointmentService.deleteAppointment(id);
      fetchAppointments();
    } catch (err) {
      setError(err.error || "Failed to cancel appointment");
      setLoading(false);
    }
  };

  // sorted by startTime in asc order
  const currentDate = new Date();
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  const upcomingAppointments = sortedAppointments.filter(
    appt => new Date(appt.startTime) >= currentDate
  );
  
  const pastAppointments = sortedAppointments.filter(
    appt => new Date(appt.startTime) < currentDate
  );

  // status color mapping - primary, secondary, error, info (blue)
  const statusColors = {
    confirmed: "warning",
    completed: "success"
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} centered>
        <Tab label={`Upcoming (${upcomingAppointments.length})`} />
        <Tab label={`Past (${pastAppointments.length})`} />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {/* Display appointments based on active tab */}
        {activeTab === 0 ? (
          upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => (
              <AppointmentCard 
                key={appointment._id} 
                appointment={appointment} 
                statusColors={statusColors}
                onReschedule={(appt) => setRescheduleData({ open: true, appointment: appt })}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", mt: 3 }}>
              No upcoming appointments
            </Typography>
          )
        ) : (
          pastAppointments.length > 0 ? (
            pastAppointments.map(appointment => (
              <AppointmentCard 
                key={appointment._id} 
                appointment={appointment} 
                statusColors={statusColors}
                onReschedule={(appt) => setRescheduleData({ open: true, appointment: appt })}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", mt: 3 }}>
              No past appointments
            </Typography>
          )
        )}
      </Box>
      {/* Reschedule form */}
      {rescheduleData.appointment && (
        <BookingForm
          open={rescheduleData.open}
          onClose={() => setRescheduleData({ open: false, appointment: null })}
          onSuccess={() => {
            fetchAppointments();
            setRescheduleData({ open: false, appointment: null });
          }}
          isRescheduling={true}
          appointmentToReschedule={rescheduleData.appointment}
        />
      )}
    </Box>
  );
};

export default AppointmentList;
