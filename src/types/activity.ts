export interface Activity {
    id: string; // e.g., 'act_...'
    type: 'activity' | 'food' | 'transport';
    title: string;
    location: string;
    description: string;
    cost_estimate: number;
    category: 'Food' | 'Sightseeing' | 'Adventure' | 'Relaxation' | 'Transport' | 'Nightlife';
    durationMinutes: number;
    timeSlot?: {
        start: string;
        end: string;
    };
    time?: string; // Display time (e.g., "10:00 AM") - kept for UI compatibility
    coordinates?: { lat: number; lng: number };
    travelTimeFromPrev?: number;
    status: 'planned' | 'completed' | 'skipped';
    metadata?: {
        isLocked?: boolean;
        source?: 'ai_generated' | 'user_added';
    };
    imageUrl?: string; // Kept for backward compatibility if needed, though not in strict schema
    isDraft?: boolean; // UI state
}
