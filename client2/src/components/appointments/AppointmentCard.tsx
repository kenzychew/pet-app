import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import type { Appointment } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdate: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onUpdate }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <ClockIcon className="h-5 w-5 text-blue-500" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' 
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  const getServiceLabel = (serviceType: string) => {
    return serviceType === 'basic' ? 'Basic Grooming' : 'Full Grooming';
  };

  const getDuration = (serviceType: string) => {
    return serviceType === 'basic' ? '60 mins' : '120 mins';
  };

  const petName = typeof appointment.petId === 'object' ? appointment.petId.name : 'Unknown Pet';

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {getStatusIcon(appointment.status)}
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{petName}</h3>
              <p className="text-sm text-gray-600">{getServiceLabel(appointment.serviceType)}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
            {appointment.status === 'completed' ? 'Completed' : 'Confirmed'}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            <span>{formatDate(appointment.startTime)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)} 
              <span className="text-gray-400 ml-1">({getDuration(appointment.serviceType)})</span>
            </span>
          </div>
        </div>

        {/* Actions - only show for upcoming appointments */}
        {appointment.status === 'confirmed' && new Date(appointment.startTime) > new Date() && (
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button 
              onClick={onUpdate}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
            <button 
              onClick={onUpdate}
              className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AppointmentCard; 
