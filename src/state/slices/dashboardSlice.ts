import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ItineraryResponse, DayPlan, Activity, Accommodation, TripState } from '@types';
import { recalculateDayTimeline } from '@features/dashboard/utils';

interface DashboardState {
    // Data State
    itinerary: ItineraryResponse | null;
    tripState: TripState | null;

    // Drag State
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

        // Activity Management
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

        reorderDays: (state, action: PayloadAction<{ oldIndex: number; newIndex: number }>) => {
            if (!state.itinerary) return;

            const days = [...state.itinerary.itinerary];
            const [moved] = days.splice(action.payload.oldIndex, 1);
            days.splice(action.payload.newIndex, 0, moved);

            state.itinerary.itinerary = days.map((d, i) => ({ ...d, day: i + 1 }));
            state.dragState = initialState.dragState;
        },

        setAccommodation: (state, action: PayloadAction<{ dayId: string; accommodation: Accommodation }>) => {
            if (!state.itinerary) return;

            const dayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.dayId);
            if (dayIndex !== -1) {
                state.itinerary.itinerary[dayIndex].accommodation = action.payload.accommodation;
            }
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
});

export const {
    setItinerary,
    setTripState,
    resetDashboard,
    dragStart,
    dragCancel,
    addActivity,
    reorderActivitiesWithinDay,
    moveActivityBetweenDays,
    reorderDays,
    setAccommodation,
    toggleSidebar,
    setSidebarOpen,
    selectActivity,
    selectAccommodation,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
