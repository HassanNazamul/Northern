import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { getSuggestions } from '@services/api';
import { RootState } from '../store';

export type DiscoveryTab = 'culinary' | 'exploration' | 'stay' | 'events';

// -- Mock data mapping --
const TAB_CATEGORY_MAP: Record<string, string[]> = {
    culinary: ['Food', 'Drink'],
    exploration: ['Adventure', 'Sightseeing', 'Relaxation'],
    stay: ['Accommodation', 'Hotel'],
    events: ['Event', 'Festival']
};

export const FILTERS_BY_TAB: Record<string, string[]> = {
    culinary: ['Local Favorites', 'Fine Dining', 'Budget', 'Romantic', 'Spicy', 'Casual'],
    exploration: ['Nature', 'History', 'Free', 'Shopping', 'Architecture', 'Walkable'],
    stay: ['Luxury', 'Boutique', 'Central', 'Trendy', 'Spa'],
    events: ['Music', 'Live', 'Culture', 'Social']
};

interface DiscoveryState {
    activeTab: DiscoveryTab;
    allItems: any[]; // Store ALL fetched suggestions here
    activeFilters: string[];
    loading: boolean;
    error: string | null;
}

const initialState: DiscoveryState = {
    activeTab: 'exploration',
    allItems: [],
    activeFilters: [],
    loading: false,
    error: null,
};

// Fetches ALL suggestions from the backend (or mock)
// Should be called on initial load or "Search/Shuffle"
export const fetchDiscoveryItems = createAsyncThunk(
    'discovery/fetchItems',
    async () => {
        // Fetch all suggestions from the mock DB via the centralized service
        return await getSuggestions({}) as any[];
    }
);

const discoverySlice = createSlice({
    name: 'discovery',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<DiscoveryTab>) => {
            state.activeTab = action.payload;
            state.activeFilters = []; // Reset filters on tab change
        },
        toggleFilter: (state, action: PayloadAction<string>) => {
            const filter = action.payload;
            if (state.activeFilters.includes(filter)) {
                state.activeFilters = state.activeFilters.filter(f => f !== filter);
            } else {
                state.activeFilters.push(filter);
            }
        },
        clearFilters: (state) => {
            state.activeFilters = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDiscoveryItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDiscoveryItems.fulfilled, (state, action) => {
                state.loading = false;
                state.allItems = action.payload;
            })
            .addCase(fetchDiscoveryItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch discovery items';
            });
    },
});

export const { setActiveTab, toggleFilter, clearFilters } = discoverySlice.actions;

// -- Selectors --

export const selectDiscoveryTab = (state: RootState) => state.discovery.activeTab;
export const selectDiscoveryFilters = (state: RootState) => state.discovery.activeFilters;
export const selectDiscoveryLoading = (state: RootState) => state.discovery.loading;

// Client-side filtering selector
export const selectDiscoveryItems = createSelector(
    [(state: RootState) => state.discovery.allItems, (state: RootState) => state.discovery.activeTab, (state: RootState) => state.discovery.activeFilters],
    (allItems, tab, filters) => {
        const allowedCategories = TAB_CATEGORY_MAP[tab] || [];

        return allItems.filter(item => {
            // 1. Category Filter
            let matchesCategory = false;
            if (tab === 'stay' && item.hotelName) matchesCategory = true;
            else if (tab !== 'stay' && item.hotelName) matchesCategory = false;
            else matchesCategory = allowedCategories.includes(item.category);

            if (!matchesCategory) return false;

            // 2. Tag Filter
            if (filters.length === 0) return true;
            if (!item.tags) return false;
            return filters.some(filter => item.tags.includes(filter));
        });
    }
);

export default discoverySlice.reducer;
