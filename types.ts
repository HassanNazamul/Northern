
export enum TripVibe {
  ADVENTURE = 'Adventure',
  RELAX = 'Relax',
  FAMILY = 'Family',
  LUXURY = 'Luxury',
  BUDGET = 'Budget'
}

export type BookingStatus = 'draft' | 'confirmed' | 'booked';

export interface LocationData {
  lat: number;
  lng: number;
  name?: string;
}

export interface Stats {
  totalCost: number;
  totalDistance: number; // km
  activityCount: number;
}

export interface Accommodation {
  id: string; // e.g., 'htl_...'
  type: 'hotel' | 'bnb' | 'resort';
  hotelName: string;
  address: string;
  pricePerNight: number;
  rating: number; // 0-5
  checkInTime?: string;
  checkOutTime?: string;
  contactNumber?: string;
  bookingUrl?: string;
  bookingStatus: BookingStatus;
  mapLink?: string;
  imageGallery: string[]; // URLs
  amenities: string[];
  description: string;
  details?: Record<string, any>; // Flexible for extra data
}

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
  coordinates?: { lat: number; lng: number };
  travelTimeFromPrev?: number;
  status: 'planned' | 'completed' | 'skipped';
  metadata?: {
    isLocked?: boolean;
    source?: 'ai_generated' | 'user_added';
  };
}

export interface DayPlan {
  id: string; // e.g., 'day_...'
  tripId: string;
  dayNumber: number;
  date?: string; // ISO Date "YYYY-MM-DD"
  theme: string;
  stats?: Stats;
  accommodation?: Accommodation | null;
  activities: Activity[];
}

export interface Suggestion {
  id: string; // e.g., 'sug_...'
  title: string;
  reason: string;
  cost_estimate: number;
  category: Activity['category'];
  description: string;
}

export interface Collaborator {
  email: string;
  id: string;
  role: 'EDITOR' | 'VIEWER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export interface Trip {
  id: string; // e.g., 'trp_...'
  trip_title: string;
  total_days: number;
  currency: string;
  itinerary: DayPlan[];
  sidebar_suggestions: Suggestion[];
  collaborators?: Collaborator[]; // Optional collaborators field
  externalSync?: {
    googleCalendar?: {
      lastSyncedAt: string;
      syncHash: string;
    }
  };
}

export interface TripState {
  destination: string;
  startDate: string;
  endDate: string;
  vibe: TripVibe;
  budget: number;
  travelers: number;
}

// API Request/Response Types (for future strict typing)
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
