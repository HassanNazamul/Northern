import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getDiscoverySuggestions } from '@services';

export type DiscoveryTab = 'culinary' | 'exploration' | 'stay' | 'events';

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
    async ({ tab, destination, vibe, budget }: {
        tab: DiscoveryTab;
        destination: string;
        vibe: string;
        budget: number;
    }) => {
        const items = await getDiscoverySuggestions(tab, destination, vibe, budget);
        return items;
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
