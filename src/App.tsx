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
import { fetchItinerary, setTripState, resetDashboard } from './state/slices/dashboardSlice';
import { useAppDispatch } from './state';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [loading, setLoading] = useState(false);

  // -- API Integration --
  // Fetches the persistent itinerary from the backend (or JSON server)
  const handleGenerate = async (trip: TripState) => {
    setLoading(true);
    dispatch(setTripState(trip));

    try {
      // Fetch the 'current' trip from the persistent backend
      // In dev mode, this hits port 3001 (db.json)
      await dispatch(fetchItinerary('current')).unwrap();
      setView('dashboard');
    } catch (err) {
      console.error("Itinerary generation failed", err);
      // Fallback or alert
      alert("Failed to load itinerary. Ensure json-server is running (port 3001).");
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
