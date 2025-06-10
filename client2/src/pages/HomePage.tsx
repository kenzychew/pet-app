import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ClockIcon, 
  StarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../store/authStore';
import PageTransition from '../components/layout/PageTransition';
import petGroomingImage from '../assets/pet_grooming.webp';
import AppointmentBookingModal from '../components/appointments/AppointmentBookingModal';
import { petService } from '../services/petService';
import type { Pet } from '../types';

const HomePage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [userPets, setUserPets] = useState<Pet[]>([]);

  // load user pets if authenticated
  useEffect(() => {
    const loadUserPets = async () => {
      if (isAuthenticated && user?.role === 'owner') {
        try {
          const pets = await petService.getUserPets();
          setUserPets(pets);
        } catch (error) {
          console.error('Error loading user pets:', error);
        }
      }
    };

    loadUserPets();
  }, [isAuthenticated, user]);

      const handleBookingSuccess = () => {
      setShowBookingModal(false);
    };

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (user?.role === 'owner') {
      setShowBookingModal(true);
    }
  };

  const combinedFeatures = [
    {
      icon: HeartIcon,
      title: 'Loving Care',
      description: 'Every pet receives personalized attention and gentle handling from our experienced groomers.'
    },
    {
      icon: StarIcon,
      title: 'Professional Service',
      description: 'Our certified groomers use premium products and industry-best practices for exceptional results.'
    },
    {
      icon: ClockIcon,
      title: 'Convenient Booking',
      description: 'Easy online scheduling that fits your busy lifestyle. Book appointments 24/7 through our platform.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Licensed & Insured',
      description: 'Fully licensed pet grooming facility with comprehensive insurance coverage for your peace of mind.'
    },
    {
      icon: UserGroupIcon,
      title: 'Experienced Team',
      description: 'Our groomers have years of experience with all breeds and temperaments.'
    },
    {
      icon: SparklesIcon,
      title: 'Stress-Free Environment',
      description: 'We create a calm, comfortable environment that pets actually enjoy visiting.'
    }
  ];

  const services = [
    {
      title: 'Basic Grooming',
      duration: '60 min',
      features: ['Bath & Dry', 'Nail Clipping', 'Ear Cleaning', 'Basic Trimming']
    },
    {
      title: 'Full Grooming',
      duration: '120 min', 
      features: ['Everything in Basic', 'Full Styling', 'Breed-Specific Cuts', 'Premium Products']
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Hero section with img */}
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Where Pets Get 
                  <span className="text-blue-600 block">Priority</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Professional pet grooming services in the heart of Bedok. We treat your furry family members with the love and care they deserve.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleBookAppointment}>
                    Book Appointment
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/service-rates">
                      View Our Services
                    </Link>
                  </Button>
                </div>
              </motion.div>

              {/* Hero img */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={petGroomingImage}
                    alt="Professional pet grooming session showing a happy dog being groomed by our experienced team"
                    className="w-full h-[500px] object-contain"
                  />
                  {/* Expertise Message Overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg p-6">
                      <p className="text-center text-lg font-medium text-black leading-relaxed">
                        "With over a decade of grooming expertise—your pet is in safe, caring hands from start to finish"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Furkids?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We combine professional expertise with genuine love for animals to provide the best grooming experience.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {combinedFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg p-8 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-6 mx-auto">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Our Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive grooming packages designed to keep your pets healthy, happy, and looking their best.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-lg p-8 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">{service.title}</h3>
                    <span className="text-lg font-medium text-blue-600">{service.duration}</span>
                  </div>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <SparklesIcon className="h-5 w-5 text-green-500 mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    onClick={handleBookAppointment}
                  >
                    Book now
                  </Button>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/service-rates">
                  View All Services & Pricing
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Booking modal */}
        {showBookingModal && isAuthenticated && user?.role === 'owner' && (
          <AppointmentBookingModal
            pets={userPets}
            onClose={() => setShowBookingModal(false)}
            onSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default HomePage;
