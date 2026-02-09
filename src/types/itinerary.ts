import { Activity } from './activity';
import { Accommodation } from './accommodation';

export interface DayPlan {
    id: string; // Stable ID for drag-and-drop
    day: number;
    theme: string;
    accommodation?: Accommodation;
    activities: Activity[];
}

export interface Suggestion {
    id: string;
    title: string;
    reason: string;
    cost_estimate: number;
    category: Activity['category'];
    description: string;
}

export interface ItineraryResponse {
    trip_title: string;
    total_days: number;
    currency: string;
    itinerary: DayPlan[];
    sidebar_suggestions: Suggestion[];
}
