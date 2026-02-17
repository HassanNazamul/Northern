import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from '@features/landing';
import { Dashboard } from '@features/dashboard';
import LoginPage from './pages/LoginPage';
import GalleryPage from './pages/GalleryPage';
import { TripState } from '@types';
import { fetchItinerary, setTripState, resetDashboard } from './state/slices/dashboardSlice';
import { useAppDispatch } from './state';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
      navigate('/dashboard');
    } catch (err) {
      console.error("Itinerary generation failed", err);
      // Fallback or alert
      // alert("Failed to load itinerary. Ensure json-server is running (port 3001).");
      // navigate('/dashboard'); // Uncomment if we want to allow navigation even on error
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    dispatch(resetDashboard());
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onGenerate={handleGenerate} loading={loading} />} />
      <Route path="/dashboard" element={<Dashboard onReset={reset} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
    </Routes>
  );
};

export default App;
