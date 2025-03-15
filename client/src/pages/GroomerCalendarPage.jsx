import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Paper } from '@mui/material';
import appointmentService from '../services/appointmentService';
import GroomerCalendar from '../components/GroomerCalendar';

const GroomerCalendarPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getUserAppointments();
            
            const validAppointments = data.filter(appointment => 
                appointment.startTime && appointment.endTime
            );

            setAppointments(validAppointments);
            setError(null);
        } catch (err) {
            console.error("Error fetching appointments:", err);
            setError(err.error || "Failed to load appointments");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (appointments.length === 0) return <Alert severity="info">No appointments found</Alert>;
    
    return (
        <Paper>
            <Box>
                <Typography variant="h5" gutterBottom>
                    Appointment Calendar
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    View and manage your appointments in calendar format
                </Typography>
            </Box>
            <GroomerCalendar appointments={appointments} />
        </Paper>
    ); 
};

export default GroomerCalendarPage;
