import React, { useState } from 'react';
import { LandingPage } from '@features/landing';
import { Dashboard } from '@features/dashboard';
import { TripState, TripGenerationRequest } from '@types';
import { createTrip } from '@services/api';
import { setItinerary, setTripState, resetDashboard } from './state/slices/dashboardSlice';
import { useAppDispatch } from './state';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [loading, setLoading] = useState(false);

  // -- API Integration --
  const handleGenerate = async (tripState: TripState) => {
    setLoading(true);
    dispatch(setTripState(tripState));

    try {
      // Map TripState to TripGenerationRequest
      const request: TripGenerationRequest = {
        destination: {
          city: tripState.destination,
          // We could add country/coordinates if TripState had them or via geocoding
        },
        dates: {
          startDate: tripState.startDate,
          endDate: tripState.endDate,
        },
        travelers: {
          count: tripState.travelers || 1, // Default to 1 if not in TripState
          type: 'friends' // Default or derive from TripState if added
        },
        budget: {
          amount: tripState.budget,
          currency: 'CAD', // Default
          level: 'moderate' // Default or derive
        },
        preferences: {
          theme: tripState.vibe,
          interests: [] // Populate if TripState has interests
        }
      };

      console.log("Generating trip with request:", request);

      // Call the Mock API to generate (or fetch mock) trip
      const newTrip = await createTrip(request);

      // Update Redux state with the new trip
      dispatch(setItinerary(newTrip));

      setView('dashboard');
    } catch (err) {
      console.error("Itinerary generation failed", err);
      alert("Failed to generate itinerary. Ensure json-server is running (port 3001) for mock data.");
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
