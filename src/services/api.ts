import { Trip, TripGenerationRequest, Suggestion } from '../types';

const MOCK_API_BASE = 'http://localhost:3001';
const REAL_API_BASE = 'http://localhost:8080/api';

/**
 * Fetch the current trip (or a specific trip by ID).
 */
export const getTrip = async (tripId: string = 'trp_current', email?: string | null): Promise<Trip | null> => {
    try {
        const isMock = tripId === 'trp_current' || tripId === 'current';
        const url = isMock
            ? `${MOCK_API_BASE}/trips`
            : `${REAL_API_BASE}/trips/${tripId}`;

        const headers: HeadersInit = {};
        if (!isMock && email) {
            headers['X-User-Email'] = email;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Failed to fetch trip: ${response.statusText}`);

        const result = await response.json();

        // json-server returns an array for /trips, but the real backend should return a single object for /trips/{id}
        if (isMock) {
            const trips: Trip[] = result;
            const trip = trips.find(t => t.id === tripId || t.id === 'trp_' + tripId) || trips[0];
            return trip || null;
        }

        return result;
    } catch (error) {
        console.error('Error fetching trip:', error);
        return null;
    }
};

/**
 * Fetch all saved trips.
 */
export const getAllTrips = async (email?: string | null): Promise<Trip[]> => {
    try {
        const headers: HeadersInit = {};
        if (email) {
            headers['X-User-Email'] = email;
        }

        const response = await fetch(`${REAL_API_BASE}/trips`, { headers });
        if (!response.ok) throw new Error('Failed to fetch trips from real backend');
        return await response.json();
    } catch (error) {
        console.error('Error fetching all trips:', error);
        return [];
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
    // We always use the mock trip for suggestions as requested
    const trip = await getTrip('trp_current');
    return trip?.sidebar_suggestions || [];
}

/**
 * Update a trip on the backend.
 */
export const updateTrip = async (trip: Trip, email: string): Promise<Trip | null> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${trip.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Email': email
            },
            body: JSON.stringify(trip)
        });

        if (!response.ok) throw new Error(`Failed to update trip: ${response.statusText}`);

        return await response.json();
    } catch (error) {
        console.error('Error updating trip:', error);
        return null;
    }
};

/**
 * Delete a trip from the backend.
 */
export const deleteTrip = async (tripId: string, email: string): Promise<boolean> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}`, {
            method: 'DELETE',
            headers: {
                'X-User-Email': email
            }
        });

        if (!response.ok) throw new Error(`Failed to delete trip: ${response.statusText}`);

        return true;
    } catch (error) {
        console.error('Error deleting trip:', error);
        return false;
    }
};

/**
 * Invite a user to a trip.
 */
export const inviteUserToTrip = async (tripId: string, invitedEmail: string): Promise<boolean> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ invitedEmail })
        });

        if (!response.ok) throw new Error(`Failed to invite user: ${response.statusText}`);

        return true;
    } catch (error) {
        console.error('Error inviting user:', error);
        return false;
    }
};

/**
 * Remove a collaborator from a trip.
 */
export const removeCollaborator = async (tripId: string, collaboratorEmail: string): Promise<boolean> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}/collaborators?email=${collaboratorEmail}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error(`Failed to remove collaborator: ${response.statusText}`);

        return true;
    } catch (error) {
        console.error('Error removing collaborator:', error);
        return false;
    }
};

/**
 * Fetch trip invitations for a user (GET).
 */
export const getTripInvitations = async (email: string): Promise<any[]> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/invitations?email=${email}`, {
            headers: {
                'X-User-Email': email
            }
        });
        if (!response.ok) throw new Error(`Failed to fetch invitations: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return [];
    }
};

/**
 * Respond to a trip invitation (ACCEPT or DECLINE).
 */
export const respondToInvitation = async (tripId: string, email: string, action: 'ACCEPT' | 'DECLINE'): Promise<boolean> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}/respond?email=${email}&action=${action}`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error(`Failed to respond to invitation: ${response.statusText}`);
        return true;
    } catch (error) {
        console.error('Error responding to invitation:', error);
        return false;
    }
};
