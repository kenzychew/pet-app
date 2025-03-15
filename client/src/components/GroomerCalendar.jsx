import {React, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import petService from '../services/petService';
import AppointmentPetDetails from './AppointmentPetDetails';
import { Paper, Typography, Box } from '@mui/material';

const GroomerCalendar = ({ appointments }) => {
    // state for pet details dialog
    const [petDetailsOpen, setPetDetailsOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [petLoading, setPetLoading] = useState(false);
    const [petError, setPetError] = useState(null);

    const events = appointments.map(appointment => {
        const color = appointment.serviceType === 'basic' ? 'blue' : 'purple';
        return {
            id: appointment._id,
            title: `${appointment.petId?.name || 'Pet'} - ${appointment.serviceType}`,
            start: appointment.startTime,
            end: appointment.endTime,
            backgroundColor: color,
            borderColor: color,
            extendedProps: {
                appointment: appointment
            }
        };
    });

    const handleEventClick = async (clickInfo) => {
        try {
            setPetLoading(true);
            setPetError(null);
            
            const appointment = clickInfo.event.extendedProps.appointment;
            const petId = appointment.petId._id || appointment.petId;
            
            const petDetails = await petService.getPetById(petId);
            
            setSelectedPet({
                ...petDetails,
                ownerName: appointment.ownerId?.name || "Pet Owner",
                appointmentTime: new Date(appointment.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                serviceType: appointment.serviceType
            });
            setPetDetailsOpen(true);
        } catch (error) {
            console.error("Error fetching pet details:", error);
            setPetError(error.message || "Failed to load pet details");
        } finally {
            setPetLoading(false);
        }
    };

    const handleClosePetDetails = () => {
        setPetDetailsOpen(false);
        setSelectedPet(null);
    };

    return (
        <Paper>
            <Typography>
                Appointment Calendar
            </Typography>
            <Box sx={{ height: '550px'}}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev today next',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={events}
                eventClick={handleEventClick}
                height="100%"
                slotMinTime={"09:00:00"}
                slotMaxTime={"18:00:00"}
                allDaySlot={false}
                businessHours={{
                    daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // Monday - Friday
                    startTime: '09:00',
                    endTime: '17:00',
                }}
            />
            </Box>

            {/* Pet details dialog */}
            <AppointmentPetDetails
                open={petDetailsOpen}
                onClose={handleClosePetDetails}
                pet={selectedPet}
                loading={petLoading}
                error={petError}
            />
        </Paper>
    );  
};

export default GroomerCalendar;
