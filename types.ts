
export enum TripVibe {
  ADVENTURE = 'Adventure',
  RELAX = 'Relax',
  FAMILY = 'Family',
  LUXURY = 'Luxury',
  BUDGET = 'Budget'
}

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

export interface Accommodation {
  hotelName: string;
  address: string;
  pricePerNight: number;
  rating: number; // 0-5
  contactNumber: string;
  bookingUrl: string;
  mapLink: string;
  imageGallery: string[]; // URLs
  amenities: string[];
  description: string;
}

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

export interface TripState {
  destination: string;
  startDate: string;
  endDate: string;
  vibe: TripVibe;
  budget: number;
}
