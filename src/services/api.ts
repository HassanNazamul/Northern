import { Trip, TripGenerationRequest, Suggestion } from '../types';

const API_BASE_URL = 'http://localhost:3001';

/**
 * Fetch the current trip (or a specific trip by ID).
 */
export const getTrip = async (tripId: string = 'trp_current'): Promise<Trip | null> => {
    try {
        // In a real app, this would be /trips/${tripId}
        // For json-server, we might need to filter if the structure is flat, 
        // but our db.json has a "trips" array.
        const response = await fetch(`${API_BASE_URL}/trips`);
        if (!response.ok) throw new Error('Failed to fetch trips');

        const trips: Trip[] = await response.json();
        const trip = trips.find(t => t.id === tripId || t.id === 'trp_' + tripId) || trips[0];
        return trip || null;
    } catch (error) {
        console.error('Error fetching trip:', error);
        return null;
    }
};

/**
 * Mock creating a trip. 
 * In reality, this would POST to the backend.
 * Here, we'll just return the existing mock trip to simulate a successful generation.
 */
export const createTrip = async (request: TripGenerationRequest): Promise<Trip> => {
    console.log('Mocking Trip Generation for:', request);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return the "current" mock trip from db.json
    const trip = await getTrip('trp_current');
    if (!trip) throw new Error('Failed to generate trip (mock data missing)');

    return trip;
};

/**
 * Mock returning suggestions.
 */
export const getSuggestions = async (context: any): Promise<Suggestion[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return hardcoded suggestions or fetch from db.json sidebar_suggestions
    const trip = await getTrip('trp_current');
    return trip?.sidebar_suggestions || [];
}
