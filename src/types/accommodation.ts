export type BookingStatus = 'draft' | 'confirmed' | 'booked';

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
