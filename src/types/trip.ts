export enum TripVibe {
    ADVENTURE = 'Adventure',
    RELAX = 'Relax',
    FAMILY = 'Family',
    LUXURY = 'Luxury',
    BUDGET = 'Budget'
}

export interface TripState {
    destination: string;
    startDate: string;
    endDate: string;
    vibe: TripVibe;
    budget: number;
}
