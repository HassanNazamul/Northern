import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@api/axiosInstance';

export type DiscoveryTab = 'culinary' | 'exploration' | 'stay' | 'events';

// -- Mock data mapping --
// Maps the UI tabs to the categories in db.json
const TAB_CATEGORY_MAP: Record<string, string[]> = {
    culinary: ['Food', 'Drink'],
    exploration: ['Adventure', 'Sightseeing', 'Relaxation'],
    stay: ['Accommodation', 'Hotel'],
    events: ['Event', 'Festival']
};

// -- Filter Constants --
export const FILTERS_BY_TAB: Record<string, string[]> = {
    culinary: ['Local Favorites', 'Fine Dining', 'Budget', 'Romantic', 'Spicy', 'Casual'],
    exploration: ['Nature', 'History', 'Free', 'Shopping', 'Architecture', 'Walkable'],
    stay: ['Luxury', 'Boutique', 'Central', 'Trendy', 'Spa'],
    events: ['Music', 'Live', 'Culture', 'Social']
};

interface DiscoveryState {
    activeTab: DiscoveryTab;
    items: any[];
    activeFilters: string[];
    loading: boolean;
    error: string | null;
}

const initialState: DiscoveryState = {
    activeTab: 'exploration',
    items: [],
    activeFilters: [],
    loading: false,
    error: null,
};

export const fetchDiscoveryItems = createAsyncThunk(
    'discovery/fetchItems',
    async ({ tab, filters }: { tab: DiscoveryTab, filters: string[] }) => {
        // Fetch all suggestions from the mock DB
        const response = await api.get<any[]>('/suggestions');
        const allItems = response.data;

        // Filter based on the active tab
        const allowedCategories = TAB_CATEGORY_MAP[tab] || [];

        return allItems.filter(item => {
            // 1. Category Filter
            let matchesCategory = false;
            // Accommodations might not have a 'category' field but have 'hotelName'
            if (tab === 'stay' && item.hotelName) matchesCategory = true;
            else if (tab !== 'stay' && item.hotelName) matchesCategory = false;
            else matchesCategory = allowedCategories.includes(item.category);

            if (!matchesCategory) return false;

            // 2. Tag Filter (Context-Aware)
            // If no filters are selected, show all items for the category
            if (filters.length === 0) return true;

            // If filters are selected, item MUST match at least one filter
            // (OR logic between filters, could be AND if stricter)
            // User requested "Multi-Select", usually implies OR or AND.
            // Let's go with OR for discovery (generous).
            // Check if item.tags contains ANY of the activeFilters
            if (!item.tags) return false;
            return filters.some(filter => item.tags.includes(filter));
        });
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
        setDiscoveryItems: (state, action: PayloadAction<any[]>) => {
            state.items = action.payload;
            state.loading = false;
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
                state.items = action.payload;
            })
            .addCase(fetchDiscoveryItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch discovery items';
            });
    },
});

export const { setActiveTab, setDiscoveryItems, toggleFilter, clearFilters } = discoverySlice.actions;

export default discoverySlice.reducer;
