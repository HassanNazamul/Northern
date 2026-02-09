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
