import { Activity } from './activity';
import { Accommodation } from './accommodation';

export interface Stats {
    totalCost: number;
    totalDistance: number; // km
    activityCount: number;
}

export interface DayPlan {
    id: string; // Stable ID for drag-and-drop
    tripId: string;
    dayNumber: number;
    date?: string; // ISO Date "YYYY-MM-DD"
    theme: string;
    stats?: Stats;
    accommodation?: Accommodation | null;
    activities: Activity[];
}

export interface Suggestion {
    id: string;
    title: string;
    reason: string;
    cost_estimate: number;
    category: Activity['category'];
    description: string;
    tags?: string[];
}
