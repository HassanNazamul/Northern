import React, { useState } from 'react';
import { LandingPage } from '@features/landing';
import { Dashboard } from '@features/dashboard';
import { TripState, ItineraryResponse } from '@types';
import { generateInitialItinerary } from '@services';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState<TripState | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);

  const handleGenerate = async (trip: TripState) => {
    setLoading(true);
    setTripData(trip);
    try {
      const data = await generateInitialItinerary(trip);
      setItinerary(data);
      setView('dashboard');
    } catch (err) {
      console.error("Itinerary generation failed", err);
      alert("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setView('landing');
    setItinerary(null);
    setTripData(null);
  };

  return (
    <div className="min-h-screen font-sans">
      {view === 'landing' ? (
        <LandingPage onGenerate={handleGenerate} loading={loading} />
      ) : (
        <Dashboard
          itinerary={itinerary!}
          tripState={tripData!}
          onReset={reset}
          setItinerary={setItinerary}
        />
      )}
    </div>
  );
};

export default App;
