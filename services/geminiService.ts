
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ItineraryResponse, TripState, DayPlan, Accommodation, Activity } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Robustly extracts the first JSON object or array found in a string.
 */
const extractJSON = (text: string) => {
  try {
    const match = text.match(/[\{\[]([\s\S]*)[\}\]]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from text:", text);
    throw e;
  }
};

export const generateInitialItinerary = async (trip: TripState): Promise<ItineraryResponse> => {
  const ai = getAI();
  const diffInMs = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
  const totalDays = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) + 1);

  const prompt = `
    Create a hyper-specific, logistically sound Canadian travel itinerary in JSON format.
    Destination: ${trip.destination}
    Duration: ${totalDays} days
    Vibe: ${trip.vibe}
    Budget Total Goal: ${trip.budget} CAD

    Constraints:
    1. ONLY suggest Canadian locations.
    2. Ensure travel times between activities are realistic for Canadian geography.
    3. If destination is seasonal (e.g. Banff in January), include winter activities.
    4. Provide exactly ${totalDays} days.
    5. Each day MUST have a unique stable "id" string.
    6. Suggest a unique, highly-rated accommodation for each day based on the location of that day's activities.
    7. For accommodations, provide amenities, real image urls if possible (or placeholders), and booking links.
    8. For activities, provide estimated duration in minutes and approximate latitude/longitude coordinates if known.

    Output strictly valid JSON with the following structure:
    {
      "trip_title": "string",
      "total_days": number,
      "currency": "CAD",
      "itinerary": [
        {
          "id": "string",
          "day": number,
          "theme": "string",
          "accommodation": {
            "hotelName": "string",
            "address": "string",
            "pricePerNight": number,
            "rating": number,
            "contactNumber": "string",
            "bookingUrl": "string",
            "mapLink": "string",
            "imageGallery": ["string"],
            "amenities": ["string"],
            "description": "string"
          },
          "activities": [
            {
              "id": "string",
              "time": "string",
              "title": "string",
              "location": "string",
              "description": "string",
              "cost_estimate": number,
              "category": "Food" | "Sightseeing" | "Adventure" | "Relaxation" | "Transport",
              "durationMinutes": number,
              "coordinates": { "lat": number, "lng": number }
            }
          ]
        }
      ],
      "sidebar_suggestions": [
        {
          "id": "string",
          "title": "string",
          "reason": "string",
          "cost_estimate": number,
          "category": "string",
          "description": "string"
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });

  return extractJSON(response.text);
};

export const getAccommodationSuggestion = async (location: string, budget: number, existingHotelName?: string): Promise<Accommodation> => {
  const ai = getAI();
  const prompt = `
    Suggest a ${existingHotelName ? 'DIFFERENT' : ''} highly-rated accommodation in or near ${location}.
    Budget context: Around ${Math.round(budget / 5)} CAD/night (just an estimate).
    ${existingHotelName ? `Do NOT suggest: ${existingHotelName}` : ''}
    Provide real amenities, booking links, and image URLs.

    Output strictly valid JSON with the following structure:
    {
      "hotelName": "string",
      "address": "string",
      "pricePerNight": number,
      "rating": number,
      "contactNumber": "string",
      "bookingUrl": "string",
      "mapLink": "string",
      "imageGallery": ["string"],
      "amenities": ["string"],
      "description": "string"
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });

  return extractJSON(response.text);
};

export const getDiscoverySuggestions = async (
  category: 'culinary' | 'exploration' | 'stay' | 'events',
  location: string,
  vibe: string,
  budget: number
): Promise<any[]> => {
  const ai = getAI();
  const prompt = `
    Generate 5 distinct, high-quality suggestions for a Canadian trip to ${location}.
    Category: ${category} (Culinary = Restaurants, Exploration = Activities/Sites, Stay = Hotels, Events = Local Events/Festivals).
    Vibe: ${vibe}.
    Daily Budget Context: ${Math.round(budget / 5)} CAD.

    Output strictly valid JSON array of objects.
    
    If Category is 'stay', return Accommodation objects:
    [{ "hotelName": "...", "pricePerNight": 100, "rating": 4.5, "address": "...", "description": "...", "imageGallery": ["..."], "amenities": ["..."], "bookingUrl": "..." }]

    If Category is 'culinary', 'exploration', or 'events', return Activity objects:
    [{ "id": "uuid", "title": "...", "location": "...", "description": "...", "cost_estimate": 50, "category": "Food"|"Sightseeing"|"Adventure", "time": "Flexible", "durationMinutes": 90, "coordinates": {"lat": 0, "lng": 0} }]
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });

  try {
    const data = extractJSON(response.text);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to fetch discovery items", e);
    return [];
  }
}

export const optimizeRoute = async (itinerary: DayPlan[], destination: string): Promise<DayPlan[]> => {
  const ai = getAI();
  const prompt = `
    I have a Canadian travel itinerary for ${destination}. 
    Please optimize the order of activities for each day to minimize driving time and improve logistics.
    Return ONLY the updated itinerary as a JSON array of day objects, identical in structure to the input.
    Current Itinerary: ${JSON.stringify(itinerary)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });

  try {
    const data = extractJSON(response.text);
    return Array.isArray(data) ? data : (data.itinerary || [data]);
  } catch (e) {
    console.error("Failed to parse optimized itinerary", e);
    return itinerary;
  }
};

export const getWeather = async (destination: string) => {
  const ai = getAI();
  const prompt = `What is the current weather in ${destination}? Return a JSON object with: temp (Celsius string, e.g. "20°C"), condition (e.g. "Sunny", "Cloudy", "Rainy"), and a brief summary.
  If you cannot determine the weather, return a JSON object with: temp: "N/A", condition: "Unknown", summary: "Weather data unavailable."`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });

  const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map(chunk => chunk.web?.uri)
    .filter(uri => !!uri) || [];

  try {
    return {
      ...extractJSON(response.text),
      sourceUrl: urls[0] || null
    };
  } catch (error) {
    console.warn("Weather data parsing failed, returning fallback.");
    return {
      temp: "--",
      condition: "Unknown",
      summary: "Could not retrieve weather data.",
      sourceUrl: null
    };
  }
};

export const handleRainyDay = async (currentDay: DayPlan, destination: string): Promise<DayPlan> => {
  const ai = getAI();
  const prompt = `
    The weather forecast is rainy for ${destination}. 
    Swap the following outdoor activities for high-quality indoor alternatives in the same area.
    Keep the timing and structure similar.
    Return the result as a JSON object with an "activities" array.
    Current Day Activities: ${JSON.stringify(currentDay.activities)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });

  try {
    const data = extractJSON(response.text);
    const updatedActivities = data.activities || (Array.isArray(data) ? data : []);
    return { ...currentDay, activities: updatedActivities };
  } catch (e) {
    console.error("Failed to handle rainy day", e);
    return currentDay;
  }
};

export const askChatbot = async (message: string, context: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      You are the "Northern Path AI" travel assistant. 
      Answer questions about Canadian travel based on this current trip context: ${context}.
      User question: ${message}
    `,
    config: {
      tools: [{ googleMaps: {} }],
    }
  });
  return response.text;
};
