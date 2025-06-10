import React from 'react';
import { motion } from 'framer-motion';
import { 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import type { Pet } from '../../types';

interface PetCardProps {
  pet: Pet;
  onView: (pet: Pet) => void;
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
}

const PetCard = ({ pet, onView, onEdit, onDelete }: PetCardProps) => {
  const getSpeciesEmoji = (species: string) => {
    return species === 'dog' ? '🐶' : '😸';
  };

  const formatAge = (age: number) => {
    return age === 1 ? '1 year old' : `${age} years old`;
  };

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
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{getSpeciesEmoji(pet.species)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
            <p className="text-sm text-gray-600 capitalize">
              {pet.breed} • {formatAge(pet.age)}
            </p>
          </div>
        </div>

        {/* Notes */}
        {pet.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">{pet.notes}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <CalendarDaysIcon className="h-4 w-4 mr-1" />
          <span>Added {new Date(pet.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(pet)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(pet)}
            className="flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(pet)}
            className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PetCard; 
