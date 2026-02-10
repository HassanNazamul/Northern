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

interface DiscoveryState {
    activeTab: DiscoveryTab;
    items: any[];
    loading: boolean;
    error: string | null;
}

const initialState: DiscoveryState = {
    activeTab: 'exploration',
    items: [],
    loading: false,
    error: null,
};

export const fetchDiscoveryItems = createAsyncThunk(
    'discovery/fetchItems',
    async ({ tab }: { tab: DiscoveryTab }) => {
        // Fetch all suggestions from the mock DB
        const response = await api.get<any[]>('/suggestions');
        const allItems = response.data;

        // Filter based on the active tab
        const allowedCategories = TAB_CATEGORY_MAP[tab] || [];

        return allItems.filter(item => {
            // Accommodations might not have a 'category' field but have 'hotelName'
            if (tab === 'stay' && item.hotelName) return true;
            if (tab !== 'stay' && item.hotelName) return false;

            return allowedCategories.includes(item.category);
        });
    }
);

const discoverySlice = createSlice({
    name: 'discovery',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<DiscoveryTab>) => {
            state.activeTab = action.payload;
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

export const { setActiveTab, setDiscoveryItems } = discoverySlice.actions;
export default discoverySlice.reducer;
