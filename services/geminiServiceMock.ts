
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ItineraryResponse, TripState, DayPlan, Accommodation, Activity } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// ============================================
// MOCK MODE - For development without API limits
// ============================================
const ENABLE_MOCK_MODE = true; // Set to true to always use mock data
const FALLBACK_ON_429 = true;   // Automatically fallback to mock on rate limit errors

const MOCK_ITINERARY: ItineraryResponse = {
    trip_title: "Mock Toronto Adventure",
    total_days: 3,
    currency: "CAD",
    itinerary: [
        {
            id: "day-1-mock",
            day: 1,
            theme: "Downtown Exploration",
            accommodation: {
                hotelName: "Fairmont Royal York",
                address: "100 Front St W, Toronto, ON",
                pricePerNight: 250,
                rating: 4.5,
                contactNumber: "+1-416-368-2511",
                bookingUrl: "https://example.com/booking",
                mapLink: "https://maps.google.com/?q=Fairmont+Royal+York+Toronto",
                imageGallery: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500"],
                amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
                description: "Historic luxury hotel in downtown Toronto"
            },
            activities: [
                {
                    id: "activity-1-1",
                    title: "CN Tower Visit",
                    description: "Iconic Toronto landmark with stunning city views",
                    time: "09:00",
                    durationMinutes: 120,
                    cost_estimate: 40,
                    category: "Sightseeing",
                    location: "301 Front St W, Toronto",
                    coordinates: { lat: 43.6426, lng: -79.3871 }
                },
                {
                    id: "activity-1-2",
                    title: "Ripley's Aquarium",
                    description: "Explore marine life and underwater tunnels",
                    time: "12:00",
                    durationMinutes: 150,
                    cost_estimate: 35,
                    category: "Sightseeing",
                    location: "288 Bremner Blvd, Toronto",
                    coordinates: { lat: 43.6424, lng: -79.3860 }
                },
                {
                    id: "activity-1-3",
                    title: "Dinner at St. Lawrence Market",
                    description: "Famous food market with diverse culinary options",
                    time: "18:00",
                    durationMinutes: 90,
                    cost_estimate: 30,
                    category: "Food",
                    location: "93 Front St E, Toronto",
                    coordinates: { lat: 43.6487, lng: -79.3716 }
                }
            ]
        },
        {
            id: "day-2-mock",
            day: 2,
            theme: "Culture & Arts",
            accommodation: {
                hotelName: "The Gladstone Hotel",
                address: "1214 Queen St W, Toronto, ON",
                pricePerNight: 180,
                rating: 4.2,
                contactNumber: "+1-416-531-4635",
                bookingUrl: "https://example.com/booking",
                mapLink: "https://maps.google.com/?q=Gladstone+Hotel+Toronto",
                imageGallery: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500"],
                amenities: ["WiFi", "Art Gallery", "Restaurant", "Bar"],
                description: "Boutique hotel with artistic flair in West Queen West"
            },
            activities: [
                {
                    id: "activity-2-1",
                    title: "Royal Ontario Museum (ROM)",
                    description: "World-class museum of art, culture, and natural history",
                    time: "10:00",
                    durationMinutes: 180,
                    cost_estimate: 25,
                    category: "Sightseeing",
                    location: "100 Queen's Park, Toronto",
                    coordinates: { lat: 43.6677, lng: -79.3948 }
                },
                {
                    id: "activity-2-2",
                    title: "Kensington Market Exploration",
                    description: "Vibrant multicultural neighborhood with unique shops and cafes",
                    time: "14:30",
                    durationMinutes: 120,
                    cost_estimate: 20,
                    category: "Relaxation",
                    location: "Kensington Ave, Toronto",
                    coordinates: { lat: 43.6544, lng: -79.4008 }
                },
                {
                    id: "activity-2-3",
                    title: "Dinner at Chinatown",
                    description: "Authentic Asian cuisine in Toronto's bustling Chinatown",
                    time: "19:00",
                    durationMinutes: 90,
                    cost_estimate: 25,
                    category: "Food",
                    location: "Spadina Ave, Toronto",
                    coordinates: { lat: 43.6532, lng: -79.3983 }
                }
            ]
        },
        {
            id: "day-3-mock",
            day: 3,
            theme: "Waterfront & Departure",
            accommodation: {
                hotelName: "The Westin Harbour Castle",
                address: "1 Harbour Square, Toronto, ON",
                pricePerNight: 220,
                rating: 4.3,
                contactNumber: "+1-416-869-1600",
                bookingUrl: "https://example.com/booking",
                mapLink: "https://maps.google.com/?q=Westin+Harbour+Castle+Toronto",
                imageGallery: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500"],
                amenities: ["WiFi", "Pool", "Spa", "Lake View"],
                description: "Waterfront hotel with stunning lake views"
            },
            activities: [
                {
                    id: "activity-3-1",
                    title: "Toronto Islands Ferry & Bike Tour",
                    description: "Scenic island getaway with bike rentals and beaches",
                    time: "09:30",
                    durationMinutes: 240,
                    cost_estimate: 30,
                    category: "Adventure",
                    location: "Jack Layton Ferry Terminal",
                    coordinates: { lat: 43.6389, lng: -79.3752 }
                },
                {
                    id: "activity-3-2",
                    title: "Harbourfront Centre",
                    description: "Cultural center with art galleries and lakefront views",
                    time: "14:30",
                    durationMinutes: 90,
                    cost_estimate: 0,
                    category: "Sightseeing",
                    location: "235 Queens Quay W, Toronto",
                    coordinates: { lat: 43.6385, lng: -79.3817 }
                }
            ]
        }
    ],
    sidebar_suggestions: [
        {
            id: "suggestion-1",
            title: "Casa Loma",
            reason: "Gothic Revival castle with beautiful gardens",
            cost_estimate: 30,
            category: "Sightseeing",
            description: "Explore this majestic castle with stunning architecture"
        },
        {
            id: "suggestion-2",
            title: "Distillery District",
            reason: "Historic area with art galleries, boutiques, and restaurants",
            cost_estimate: 15,
            category: "Relaxation",
            description: "Victorian-era buildings transformed into trendy shops and cafes"
        },
        {
            id: "suggestion-3",
            title: "High Park",
            reason: "Large urban park perfect for outdoor activities",
            cost_estimate: 0,
            category: "Adventure",
            description: "Nature trails, gardens, and recreational facilities"
        }
    ]
};

/**
 * Mock function to replace real API calls during development
 * Returns hardcoded Toronto itinerary regardless of input parameters
 */
export const generateMockItinerary = async (trip: TripState): Promise<ItineraryResponse> => {
    console.log('🎭 DEVELOPMENT MODE: Using hardcoded mock data');
    console.log('📍 Ignoring trip parameters:', {
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget
    });
    console.log('💡 Returning: 3-day Toronto itinerary');

    // Simulate slight API delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));

    return Promise.resolve(MOCK_ITINERARY);
};

export { ENABLE_MOCK_MODE, FALLBACK_ON_429, MOCK_ITINERARY };
