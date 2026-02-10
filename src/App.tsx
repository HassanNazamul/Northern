import React, { useState } from 'react';
import { LandingPage } from '@features/landing';
import { Dashboard } from '@features/dashboard';
import { TripState } from '@types';

// ========================================
// REAL API (Commented out due to rate limits)
// ========================================
// import { generateInitialItinerary } from '@services';

// ========================================
// MOCK DATA FOR DEVELOPMENT
// ========================================
import { generateMockItinerary } from '../services/geminiServiceMock';

import { useAppDispatch } from './state';
import { setItinerary, setTripState, resetDashboard } from './state/slices/dashboardSlice';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (trip: TripState) => {
    setLoading(true);
    dispatch(setTripState(trip));

    try {
      // Using mock data instead of real API
      const data = await generateMockItinerary(trip);
      dispatch(setItinerary(data));
      setView('dashboard');
    } catch (err) {
      console.error("Itinerary generation failed", err);
      alert("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    dispatch(resetDashboard());
    setView('landing');
  };

  return view === 'landing' ? (
    <LandingPage onGenerate={handleGenerate} loading={loading} />
  ) : (
    <Dashboard onReset={reset} />
  );
};

export default App;
