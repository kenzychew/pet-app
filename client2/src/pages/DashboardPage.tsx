import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  UserIcon, 
  ClockIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import PageTransition from '../components/layout/PageTransition';
import LoadingSpinner from '../components/ui/loading-spinner';
import type { Appointment, Pet, QuickAction } from '../types';
import AppointmentBookingModal from '../components/appointments/AppointmentBookingModal';
import { useAppointmentData, usePetData, useModal } from '../hooks';
import appointmentService from '../services/appointmentService';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  
  // Custom hooks for data management
  const {
    appointments,
    loading: appointmentsLoading,
    loadAppointments,
    addAppointment
  } = useAppointmentData();
  
  const {
    pets,
    loading: petsLoading
  } = usePetData(user?.role === 'owner');
  
  const bookingModal = useModal();

  const loading = appointmentsLoading || petsLoading;

  // State variables for cancel functionality
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // State for editing appointment
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleBookingSuccess = (appointment: Appointment) => {
    bookingModal.close();
    if (editingAppointment) {
      // this was a reschedule
      setEditingAppointment(null);
    }
    addAppointment(appointment);
    loadAppointments(); // rf to get any server-side updates
  };

  // Add this helper to check if owner has pets
  const ownerHasPets = user?.role === 'owner' && pets.length > 0;
  const ownerHasNoPets = user?.role === 'owner' && pets.length === 0 && !petsLoading;

  const ownerQuickActions: QuickAction[] = [
    {
      title: 'Book Appointment',
      description: ownerHasPets 
        ? 'Schedule a grooming session for your pet'
        : 'Add a pet first to book appointments',
      icon: CalendarDaysIcon,
      action: ownerHasPets ? bookingModal.open : undefined,
      link: ownerHasPets ? undefined : '/pets',
      color: ownerHasPets 
        ? 'bg-blue-500 hover:bg-blue-600' 
        : 'bg-gray-400 hover:bg-gray-500'
    },
    {
      title: 'Manage Pets',
      description: 'View your pet profiles and grooming history',
      icon: HeartIcon,
      link: '/pets',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      title: 'Manage Appointments',
      description: 'View your upcoming and past appointments',
      icon: ClockIcon,
      link: '/appointments',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  const groomerQuickActions: QuickAction[] = [
    {
      title: 'Today\'s Schedule',
      description: 'View your appointments for today',
      icon: ClockIcon,
      link: '/schedule',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Calendar View',
      description: 'See your weekly and monthly schedule',
      icon: CalendarDaysIcon,
      link: '/calendar',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      title: 'Client Management',
      description: 'Manage your client appointments',
      icon: UserIcon,
      link: '/schedule',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  const quickActions = user?.role === 'groomer' ? groomerQuickActions : ownerQuickActions;

  const getAppointmentStatus = (appointment: Appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.startTime);
    
    if (appointment.status === 'completed') {
      return { label: 'Completed', color: 'text-green-600', icon: CheckCircleIcon };
    } else if (appointmentDate > now) {
      return { label: 'Upcoming', color: 'text-blue-600', icon: ClockIcon };
    } else {
      return { label: 'Past', color: 'text-gray-600', icon: XCircleIcon };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Add this new formatting function for clearer date display
  const formatDateClear = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const ordinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      year: 'numeric'
    }).replace(/\d+/, `${day}${ordinalSuffix(day)}`);
  };

  const formatTimeClear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(' ', ''); // rm space before AM/PM
  };

  const getDuration = (serviceType: string) => {
    return serviceType === 'basic' ? '60 min' : '120 min';
  };

  const getPetName = (petId: string | Pet) => {
    if (typeof petId === 'object' && petId !== null) {
      return petId.name || 'Unknown Pet';
    }
    if (typeof petId === 'string') {
      const pet = pets.find(p => p._id === petId);
      return pet?.name || 'Unknown Pet';
    }
    return 'Unknown Pet';
  };

  const getGroomerName = (groomerId: string | { name?: string; firstName?: string; lastName?: string }) => {
    if (typeof groomerId === 'object' && groomerId !== null) {
      return groomerId.name || 
             (groomerId.firstName && groomerId.lastName ? `${groomerId.firstName} ${groomerId.lastName}` : '') || 
             'Unknown Groomer';
    }
    return 'Unknown Groomer';
  };

  // get recent appointments (last 5)
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Add these new handler functions
  const handleReschedule = (appointment: Appointment) => {
    // Set the appointment to edit and open modal
    setEditingAppointment(appointment);
    bookingModal.open();
  };

  const handleCancelClick = (appointment: Appointment) => {
    setCancellingAppointment(appointment);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancellingAppointment) return;

    try {
      setCancelLoading(true);
      await appointmentService.deleteAppointment(cancellingAppointment._id);
      // Remove from local state
      loadAppointments(); // Refresh appointments
      setShowCancelDialog(false);
      setCancellingAppointment(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel appointment';
      alert(errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
    setCancellingAppointment(null);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              {user?.role === 'groomer' 
                ? 'Manage your grooming schedule and clients'
                : 'Take care of your furry friends with ease'
              }
            </p>
          </motion.div>

          {/* New Pet Owner Guide Message */}
          {ownerHasNoPets && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <HeartIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Welcome to Furkids!
                  </h3>
                  <p className="text-blue-800 mb-4">
                    To book your first grooming appointment, you'll need to add your pet's information first. 
                    This helps our groomers provide the best care tailored to your furry friend's needs.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/pets">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Add Your First Pet
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: ownerHasNoPets && action.title === 'Book Appointment' ? 1 : 1.02 }}
                whileTap={{ scale: ownerHasNoPets && action.title === 'Book Appointment' ? 1 : 0.98 }}
              >
                {action.link ? (
                  <Link to={action.link}>
                    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
                      ownerHasNoPets && action.title === 'Book Appointment' 
                        ? 'opacity-75 cursor-pointer' 
                        : ''
                    }`}>
                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-lg ${action.color} text-white`}>
                          <action.icon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {action.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-gray-600">{action.description}</p>

                    </div>
                  </Link>
                ) : (
                  <div 
                    onClick={action.action}
                    className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                      ownerHasNoPets && action.title === 'Book Appointment' 
                        ? 'opacity-75 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {action.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-600">{action.description}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity to show</p>
                <p className="text-sm mt-2">
                  {user?.role === 'groomer' 
                    ? 'Your recent appointments will appear here'
                    : 'Your pet care activity will appear here'
                  }
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {recentAppointments.map((appointment, index) => {
                  const status = getAppointmentStatus(appointment);
                  const StatusIcon = status.icon;
                  
                  return (
                    <AccordionItem key={appointment._id} value={`item-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center space-x-4">
                            <StatusIcon className={`h-5 w-5 ${status.color}`} />
                            <div className="text-left">
                              <div className="font-medium text-gray-900">
                                Booking #{appointment._id.slice(-8).toUpperCase()} - {getPetName(appointment.petId)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDateClear(appointment.startTime)} ({formatTimeClear(appointment.startTime)} - {formatTimeClear(appointment.endTime)})
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-right">
                            <div>
                              <div className={`text-sm font-medium ${status.color}`}>
                                {status.label}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.serviceType === 'basic' ? 'Basic' : 'Full'} ({getDuration(appointment.serviceType)})
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4 pl-9 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Pet:</span>
                              <span className="ml-2 text-gray-600">{getPetName(appointment.petId)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Service:</span>
                              <span className="ml-2 text-gray-600">
                                {appointment.serviceType === 'basic' ? 'Basic' : 'Full'} Grooming
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Groomer:</span>
                              <span className="ml-2 text-gray-600">{getGroomerName(appointment.groomerId)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Duration:</span>
                              <span className="ml-2 text-gray-600">{getDuration(appointment.serviceType)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Date:</span>
                              <span className="ml-2 text-gray-600">{formatDate(appointment.startTime)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Time:</span>
                              <span className="ml-2 text-gray-600">
                                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                              </span>
                            </div>
                          </div>
                          
                          {user?.role === 'owner' && (
                            <div className="pt-3 border-t">
                              {(() => {
                                const now = new Date();
                                const appointmentTime = new Date(appointment.startTime);
                                const isUpcoming = appointmentTime > now;
                                const hoursDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                                const canModify = hoursDifference > 24;

                                return (
                                  <div className="space-y-3">
                                    {appointment.status === 'confirmed' && isUpcoming && (
                                      <div className="flex flex-wrap gap-2">
                                        <Button 
                                          size="sm" 
                                          className={`${
                                            canModify 
                                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                          }`}
                                          onClick={canModify ? () => handleReschedule(appointment) : undefined}
                                          disabled={!canModify}
                                        >
                                          Reschedule
                                        </Button>
                                        
                                        <Button 
                                          size="sm" 
                                          className={`${
                                            canModify 
                                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                          }`}
                                          onClick={canModify ? () => handleCancelClick(appointment) : undefined}
                                          disabled={!canModify}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    )}
                                    
                                    {appointment.status === 'confirmed' && isUpcoming && !canModify && (
                                      <p className="text-xs text-amber-600">
                                        *Unable to reschedule/cancel as it is less than 24 hours before appointment time. Please call/whatsapp us if urgent*
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
            
            {recentAppointments.length > 0 && (
              <div className="mt-6 text-center">
                <Link to="/appointments">
                  <Button variant="outline">
                    View All Appointments
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Booking Modal - Updated to handle rescheduling */}
      {bookingModal.isOpen && user?.role === 'owner' && ownerHasPets && (
        <AppointmentBookingModal
          pets={pets}
          editingAppointment={editingAppointment}
          onClose={() => {
            bookingModal.close();
            setEditingAppointment(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && cancellingAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCancelDialogClose} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Cancel Appointment
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to cancel the appointment for {getPetName(cancellingAppointment.petId)} on{' '}
                {formatDate(cancellingAppointment.startTime)} at {formatTime(cancellingAppointment.startTime)}?
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancelDialogClose}
                  disabled={cancelLoading}
                  className="flex-1"
                >
                  Keep Appointment
                </Button>
                <Button
                  onClick={handleCancelConfirm}
                  disabled={cancelLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {cancelLoading ? <LoadingSpinner size="sm" /> : 'Cancel Appointment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default DashboardPage; 
