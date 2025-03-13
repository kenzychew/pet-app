import React from "react";
import { Box, Typography, Card, CardContent, Chip, Button } from "@mui/material";

const AppointmentCard = ({ appointment, statusColors, onReschedule }) => {
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);
  
  const formattedDate = startTime.toLocaleDateString();
  const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // check if appt is in future and confirmed
  const currentTime = new Date();
  const isUpcoming = startTime > currentTime;
  const isConfirmed = appointment.status === "confirmed";
  const canReschedule = isUpcoming && isConfirmed;
  
  // allow modification if >24 hrs
  const hoursDifference = (startTime - currentTime) / (1000 * 60 * 60);
  const canModify = hoursDifference > 24;
  
  const handleReschedule = () => {
    if (onReschedule) {
      onReschedule(appointment);
    }
  };
  
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h6">
              {appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)} Grooming [{appointment.duration / 60} hours]
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {formattedDate}, {formattedStartTime} - {formattedEndTime}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Pet: {appointment.petId?.name || "Pet"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Groomer: {appointment.groomerId?.name || "Assigned Groomer"}
            </Typography>
            
            {canReschedule && (
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={handleReschedule}
                  disabled={!canModify}
                >
                  Reschedule
                </Button>
                {!canModify && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Cannot reschedule less than 24 hours before appointment
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          <Chip 
            label={appointment.status} 
            color={statusColors[appointment.status] || "default"} 
            size="med" 
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard; 
