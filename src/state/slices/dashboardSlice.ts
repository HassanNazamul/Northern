import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ItineraryResponse, DayPlan, Activity, Accommodation, TripState } from '@types';
import { recalculateDayTimeline } from '@features/dashboard/utils';
import { api } from '@api/axiosInstance';
import { RootState } from '../store';

// -- Async Thunks --

// -- Async Thunks --
// Uses the centralized API instance to fetch data from the configured VITE_API_BASE_URL
export const fetchItinerary = createAsyncThunk(
    'dashboard/fetchItinerary',
    async (tripId: string = 'current') => {
        console.log(`Fetching itinerary for ${tripId} from backend...`);
        const response = await api.get<ItineraryResponse>(`/trips/${tripId}`);
        console.log('Itinerary received:', response.data);
        return response.data;
    }
);

export const persistItinerary = createAsyncThunk(
    'dashboard/persistItinerary',
    async (_, { getState }) => {
        const state = getState() as RootState;
        const itinerary = state.dashboard.itinerary;
        if (!itinerary) return;

        // We use 'current' as the ID for the main trip in this mock setup
        await api.patch(`/trips/current`, itinerary);
    }
);

interface DashboardState {
    loading: boolean;
    error: string | null;
    // -- Data State --
    // Stores the full itinerary API response (days, activities)
    itinerary: ItineraryResponse | null;
    // Stores trip settings like budget, destination, and travelers
    tripState: TripState | null;

    // -- Drag State --
    // Tracks the currently dragged item for DnD operations
    dragState: {
        activeId: string | null;
        activeDragType: string | null;
        activeDragItem: any | null;
    };

    // UI State
    sidebarOpen: boolean;
    selectedActivity: Activity | null;
    selectedAccommodation: Accommodation | null;
}

const initialState: DashboardState = {
    loading: false,
    error: null,
    itinerary: null,
    tripState: null,
    dragState: {
        activeId: null,
        activeDragType: null,
        activeDragItem: null,
    },
    sidebarOpen: true,
    selectedActivity: null,
    selectedAccommodation: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        // Data Actions
        setItinerary: (state, action: PayloadAction<ItineraryResponse>) => {
            state.itinerary = action.payload;
        },

        setTripState: (state, action: PayloadAction<TripState>) => {
            state.tripState = action.payload;
        },

        resetDashboard: (state) => {
            state.itinerary = null;
            state.tripState = null;
            state.selectedActivity = null;
            state.selectedAccommodation = null;
        },

        // Drag-and-Drop Actions
        dragStart: (state, action: PayloadAction<{ id: string; type: string; item: any }>) => {
            state.dragState.activeId = action.payload.id;
            state.dragState.activeDragType = action.payload.type;
            state.dragState.activeDragItem = action.payload.item;
        },

        dragCancel: (state) => {
            state.dragState.activeId = null;
            state.dragState.activeDragType = null;
            state.dragState.activeDragItem = null;
        },

        // -- Activity Management --
        // Adds a new activity to a specific day, recalculating the timeline
        addActivity: (state, action: PayloadAction<{ dayId: string; activity: Activity; insertionIndex?: number }>) => {
            if (!state.itinerary) return;

            const dayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.dayId);
            if (dayIndex === -1) return;

            const currentActivities = [...state.itinerary.itinerary[dayIndex].activities];
            const insertIndex = action.payload.insertionIndex !== undefined
                ? action.payload.insertionIndex
                : currentActivities.length;

            currentActivities.splice(insertIndex, 0, action.payload.activity);
            state.itinerary.itinerary[dayIndex].activities = recalculateDayTimeline(currentActivities);
        },

        reorderActivitiesWithinDay: (state, action: PayloadAction<{ dayId: string; oldIndex: number; newIndex: number }>) => {
            if (!state.itinerary) return;

            const dayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.dayId);
            if (dayIndex === -1) return;

            const activities = [...state.itinerary.itinerary[dayIndex].activities];
            const [moved] = activities.splice(action.payload.oldIndex, 1);
            activities.splice(action.payload.newIndex, 0, moved);

            state.itinerary.itinerary[dayIndex].activities = recalculateDayTimeline(activities);
            state.dragState = initialState.dragState;
        },

        moveActivityBetweenDays: (
            state,
            action: PayloadAction<{
                sourceDayId: string;
                targetDayId: string;
                activityId: string;
                targetIndex?: number
            }>
        ) => {
            if (!state.itinerary) return;

            const sourceDayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.sourceDayId);
            const targetDayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.targetDayId);

            if (sourceDayIndex === -1 || targetDayIndex === -1) return;

            const sourceActivities = [...state.itinerary.itinerary[sourceDayIndex].activities];
            const activityIndex = sourceActivities.findIndex(a => a.id === action.payload.activityId);

            if (activityIndex === -1) return;

            const [movedActivity] = sourceActivities.splice(activityIndex, 1);
            const targetActivities = [...state.itinerary.itinerary[targetDayIndex].activities];

            const insertIndex = action.payload.targetIndex !== undefined
                ? action.payload.targetIndex
                : targetActivities.length;

            targetActivities.splice(insertIndex, 0, movedActivity);

            state.itinerary.itinerary[sourceDayIndex].activities = recalculateDayTimeline(sourceActivities);
            state.itinerary.itinerary[targetDayIndex].activities = recalculateDayTimeline(targetActivities);
            state.dragState = initialState.dragState;
        },

        removeActivity: (state, action: PayloadAction<{ dayId: string; activityId: string }>) => {
            if (!state.itinerary) return;

            const dayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.dayId);
            if (dayIndex === -1) return;

            const activities = state.itinerary.itinerary[dayIndex].activities;
            const newActivities = activities.filter(a => a.id !== action.payload.activityId);

            state.itinerary.itinerary[dayIndex].activities = recalculateDayTimeline(newActivities);
        },

        reorderDays: (state, action: PayloadAction<{ oldIndex: number; newIndex: number }>) => {
            if (!state.itinerary) return;

            const days = [...state.itinerary.itinerary];
            const [moved] = days.splice(action.payload.oldIndex, 1);
            days.splice(action.payload.newIndex, 0, moved);

            state.itinerary.itinerary = days.map((d, i) => ({ ...d, day: i + 1 }));
            state.dragState = initialState.dragState;
        },

        swapDays: (state, action: PayloadAction<{ index1: number; index2: number }>) => {
            if (!state.itinerary) return;

            const days = [...state.itinerary.itinerary];
            // Direct swap - no shifting
            [days[action.payload.index1], days[action.payload.index2]] =
                [days[action.payload.index2], days[action.payload.index1]];

            state.itinerary.itinerary = days.map((d, i) => ({ ...d, day: i + 1 }));
            state.dragState = initialState.dragState;
        },

        setAccommodation: (state, action: PayloadAction<{ dayId: string; accommodation: Accommodation | null }>) => {
            if (!state.itinerary) return;

            const dayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.dayId);
            if (dayIndex !== -1) {
                // If null, we're removing it. Typescript might complain if DayPlan.accommodation is strictly Accommodation | undefined
                // But usually optional properties allow undefined. We'll set it to undefined if null is passed.
                if (action.payload.accommodation === null) {
                    delete state.itinerary.itinerary[dayIndex].accommodation;
                } else {
                    state.itinerary.itinerary[dayIndex].accommodation = action.payload.accommodation;
                }
            }
        },

        removeAccommodation: (state, action: PayloadAction<{ dayId: string }>) => {
            if (!state.itinerary) return;
            const dayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.dayId);
            if (dayIndex !== -1) {
                delete state.itinerary.itinerary[dayIndex].accommodation;
            }
        },

        // -- Editable Itinerary Actions --
        addDay: (state) => {
            if (!state.itinerary) return;
            const newDayNum = state.itinerary.itinerary.length + 1;
            const newDay: DayPlan = {
                id: `day-${Date.now()}`,
                day: newDayNum,
                theme: 'New Day',
                activities: []
            };
            state.itinerary.itinerary.push(newDay);
            state.itinerary.total_days = newDayNum;
        },

        deleteDay: (state, action: PayloadAction<{ dayId: string }>) => {
            if (!state.itinerary) return;
            const newItinerary = state.itinerary.itinerary.filter(d => d.id !== action.payload.dayId);
            // Re-index days
            state.itinerary.itinerary = newItinerary.map((d, index) => ({
                ...d,
                day: index + 1
            }));
            state.itinerary.total_days = newItinerary.length;
        },

        updateActivity: (state, action: PayloadAction<{ dayId: string; activityId: string; updates: Partial<Activity> }>) => {
            if (!state.itinerary) return;

            const dayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.dayId);
            if (dayIndex === -1) return;

            const activityIndex = state.itinerary.itinerary[dayIndex].activities.findIndex(a => a.id === action.payload.activityId);
            if (activityIndex === -1) return;

            const activity = state.itinerary.itinerary[dayIndex].activities[activityIndex];
            const updatedActivity = { ...activity, ...action.payload.updates };

            state.itinerary.itinerary[dayIndex].activities[activityIndex] = updatedActivity;

            // Recalculate timeline if time/duration changed, or just to be safe
            // This ensures subsequent activities are shifted if necessary
            state.itinerary.itinerary[dayIndex].activities = recalculateDayTimeline(state.itinerary.itinerary[dayIndex].activities);
        },

        // UI State Actions
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },

        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },

        selectActivity: (state, action: PayloadAction<Activity | null>) => {
            state.selectedActivity = action.payload;
        },

        selectAccommodation: (state, action: PayloadAction<Accommodation | null>) => {
            state.selectedAccommodation = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchItinerary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchItinerary.fulfilled, (state, action) => {
                state.loading = false;
                state.itinerary = action.payload;
            })
            .addCase(fetchItinerary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch itinerary';
            });
    }
});

export const {
    setItinerary,
    setTripState,
    resetDashboard,
    dragStart,
    dragCancel,
    addActivity,
    removeActivity,
    reorderActivitiesWithinDay,
    moveActivityBetweenDays,
    reorderDays,
    swapDays,
    setAccommodation,
    removeAccommodation,
    toggleSidebar,
    setSidebarOpen,
    selectActivity,
    selectAccommodation,
    addDay,
    deleteDay,
    updateActivity,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
