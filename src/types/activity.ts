export interface Activity {
    id: string;
    time: string;
    title: string;
    location: string;
    description: string;
    cost_estimate: number;
    category: 'Food' | 'Sightseeing' | 'Adventure' | 'Relaxation' | 'Transport';
    durationMinutes?: number;
    coordinates?: { lat: number; lng: number };
    travelTimeFromPrev?: number;
}
