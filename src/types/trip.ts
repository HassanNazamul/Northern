import { DayPlan, Suggestion } from './itinerary';

export enum TripVibe {
    ADVENTURE = 'Adventure',
    RELAX = 'Relax',
    FAMILY = 'Family',
    LUXURY = 'Luxury',
    BUDGET = 'Budget'
}

export interface LocationData {
    lat: number;
    lng: number;
    name?: string;
}

export interface TripState {
    destination: string;
    startDate: string;
    endDate: string;
    vibe: TripVibe;
    budget: number;
    travelers: number;
}

export interface Trip {
    id: string; // e.g., 'trp_...'
    trip_title: string;
    total_days: number;
    currency: string;
    itinerary: DayPlan[];
    sidebar_suggestions: Suggestion[];
    externalSync?: {
        googleCalendar?: {
            lastSyncedAt: string;
            syncHash: string;
        }
    };
}

// API Request/Response Types
export interface TripGenerationRequest {
    userId?: string;
    destination: {
        city: string;
        country?: string;
        coordinates?: LocationData;
    };
    dates: {
        startDate: string;
        endDate: string;
        isFlexible?: boolean;
    };
    travelers: {
        count: number;
        type: 'couple' | 'family' | 'solo' | 'friends';
    };
    budget: {
        amount: number;
        currency: string;
        level: 'budget' | 'moderate' | 'luxury';
    };
    preferences: {
        theme: string;
        interests: string[];
    };
}
