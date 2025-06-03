import React from 'react';
import PageTransition from '../components/layout/PageTransition';

const GroomerCalendarPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Calendar view coming soon...</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default GroomerCalendarPage;
