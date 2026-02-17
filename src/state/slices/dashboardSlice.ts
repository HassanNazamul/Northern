import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Trip, DayPlan, Activity, Accommodation, TripState, TripVibe } from '@types';
import { recalculateDayTimeline } from '@features/dashboard/utils';
import { getTrip, getAllTrips } from '@services/api';
import { RootState } from '../store';

// -- Async Thunks --
// Uses the centralized API service to fetch data
export const fetchItinerary = createAsyncThunk(
    'dashboard/fetchItinerary',
    async (tripId: string = 'current') => {
        console.log(`Fetching itinerary for ${tripId} from backend...`);
        const trip = await getTrip(tripId);
        if (!trip) throw new Error('Trip not found');
        console.log('Itinerary received:', trip);
        return trip;
    }
);

// Fetch all saved trips for the gallery
export const fetchSavedTrips = createAsyncThunk(
    'dashboard/fetchSavedTrips',
    async () => {
        const trips = await getAllTrips();
        return trips;
    }
);

// Persist stub - in a real app this would call api.updateTrip or similar
export const persistItinerary = createAsyncThunk(
    'dashboard/persistItinerary',
    async (_, { getState }) => {
        const state = getState() as RootState;
        const itinerary = state.dashboard.itinerary;
        if (!itinerary) return;
        console.log('Persisting itinerary (stub):', itinerary);
    }
);

interface TrashItem {
    id: string; // unique trash id
    originalDayId: string;
    description: string; // for UI
    type: 'activity' | 'accommodation';
    data: Activity | Accommodation;
    deletedAt: number;
}

interface DashboardState {
    loading: boolean;
    error: string | null;
    // -- Data State --
    // Stores the full trip API response
    itinerary: Trip | null;
    // Stores trip settings like budget, destination, and travelers
    tripState: TripState | null;
    savedTrips: Trip[]; // List of all saved trips

    // -- Trash Bin -- 
    trashBin: TrashItem[];

    // -- Drag State --
    // Tracks the currently dragged item for DnD operations
    dragState: {
        activeId: string | null;
        activeDragType: string | null;
        activeDragItem: any | null;
    };

    // UI State
    sidebarOpen: boolean;
    trashBinOpen: boolean;
    selectedDayId: string | null;
    selectedActivity: Activity | null;
    selectedAccommodation: Accommodation | null;
}

const initialState: DashboardState = {
    loading: false,
    error: null,
    itinerary: null,
    tripState: null,
    savedTrips: [],
    trashBin: [],
    dragState: {
        activeId: null,
        activeDragType: null,
        activeDragItem: null,
    },
    sidebarOpen: true,
    trashBinOpen: false,
    selectedDayId: null,
    selectedActivity: null,
    selectedAccommodation: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setItinerary: (state, action: PayloadAction<Trip>) => {
            state.itinerary = action.payload;
        },

        setTripState: (state, action: PayloadAction<TripState>) => {
            state.tripState = action.payload;
        },

        resetDashboard: (state) => {
            state.itinerary = null;
            state.tripState = null;
            state.trashBin = [];
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
            const activityToRemove = activities.find(a => a.id === action.payload.activityId);

            if (activityToRemove) {
                // Move to Trash
                state.trashBin.push({
                    id: `trash-${Date.now()}`,
                    originalDayId: action.payload.dayId,
                    description: `Activity: ${activityToRemove.title || 'Untitled'}`,
                    type: 'activity',
                    data: activityToRemove,
                    deletedAt: Date.now()
                });
            }

            const newActivities = activities.filter(a => a.id !== action.payload.activityId);
            state.itinerary.itinerary[dayIndex].activities = recalculateDayTimeline(newActivities);
        },

        reorderDays: (state, action: PayloadAction<{ oldIndex: number; newIndex: number }>) => {
            if (!state.itinerary) return;

            const days = [...state.itinerary.itinerary];
            const [moved] = days.splice(action.payload.oldIndex, 1);
            days.splice(action.payload.newIndex, 0, moved);

            state.itinerary.itinerary = days.map((d, i) => ({ ...d, dayNumber: i + 1 }));
            state.dragState = initialState.dragState;
        },

        swapDays: (state, action: PayloadAction<{ index1: number; index2: number }>) => {
            if (!state.itinerary) return;

            const days = [...state.itinerary.itinerary];
            // Direct swap - no shifting
            [days[action.payload.index1], days[action.payload.index2]] =
                [days[action.payload.index2], days[action.payload.index1]];

            state.itinerary.itinerary = days.map((d, i) => ({ ...d, dayNumber: i + 1 }));
            state.dragState = initialState.dragState;
        },

        setAccommodation: (state, action: PayloadAction<{ dayId: string; accommodation: Accommodation | null }>) => {
            if (!state.itinerary) return;

            const dayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.dayId);
            if (dayIndex !== -1) {
                if (action.payload.accommodation === null) {
                    const currentAccom = state.itinerary.itinerary[dayIndex].accommodation;
                    if (currentAccom) {
                        // Move to Trash
                        state.trashBin.push({
                            id: `trash-${Date.now()}`,
                            originalDayId: action.payload.dayId,
                            description: `Hotel: ${currentAccom.hotelName}`,
                            type: 'accommodation',
                            data: currentAccom,
                            deletedAt: Date.now()
                        });
                    }
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
                const currentAccom = state.itinerary.itinerary[dayIndex].accommodation;
                if (currentAccom) {
                    // Move to Trash
                    state.trashBin.push({
                        id: `trash-${Date.now()}`,
                        originalDayId: action.payload.dayId,
                        description: `Hotel: ${currentAccom.hotelName}`,
                        type: 'accommodation',
                        data: currentAccom,
                        deletedAt: Date.now()
                    });
                }
                delete state.itinerary.itinerary[dayIndex].accommodation;
            }
        },

        // -- Editable Itinerary Actions --
        addDay: (state) => {
            if (!state.itinerary) return;
            const newDayNum = state.itinerary.itinerary.length + 1;
            const newDay: DayPlan = {
                id: `day-${Date.now()}`,
                tripId: state.itinerary.id,
                dayNumber: newDayNum,
                theme: 'New Day',
                activities: []
            };
            state.itinerary.itinerary.push(newDay);
            state.itinerary.total_days = newDayNum;
        },

        deleteDay: (state, action: PayloadAction<{ dayId: string }>) => {
            if (!state.itinerary) return;

            const dayToDelete = state.itinerary.itinerary.find(d => d.id === action.payload.dayId);
            if (dayToDelete) {
                // Move contents to Trash
                if (dayToDelete.accommodation) {
                    state.trashBin.push({
                        id: `trash-accom-${Date.now()}`,
                        originalDayId: action.payload.dayId,
                        description: `Hotel: ${dayToDelete.accommodation.hotelName} (from Deleted Day ${dayToDelete.dayNumber})`,
                        type: 'accommodation',
                        data: dayToDelete.accommodation,
                        deletedAt: Date.now()
                    });
                }
                dayToDelete.activities.forEach((act, idx) => {
                    state.trashBin.push({
                        id: `trash-act-${Date.now()}-${idx}`,
                        originalDayId: action.payload.dayId,
                        description: `Activity: ${act.title || 'Untitled'} (from Deleted Day ${dayToDelete.dayNumber})`,
                        type: 'activity',
                        data: act,
                        deletedAt: Date.now()
                    });
                });
            }

            const newItinerary = state.itinerary.itinerary.filter(d => d.id !== action.payload.dayId);
            // Re-index days
            state.itinerary.itinerary = newItinerary.map((d, index) => ({
                ...d,
                dayNumber: index + 1
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
            state.itinerary.itinerary[dayIndex].activities = recalculateDayTimeline(state.itinerary.itinerary[dayIndex].activities);
        },

        updateDay: (state, action: PayloadAction<{ dayId: string; updates: Partial<DayPlan> }>) => {
            if (!state.itinerary) return;
            const dayIndex = state.itinerary.itinerary.findIndex(d => d.id === action.payload.dayId);
            if (dayIndex === -1) return;

            state.itinerary.itinerary[dayIndex] = {
                ...state.itinerary.itinerary[dayIndex],
                ...action.payload.updates
            };
        },

        // -- Trash Actions --
        restoreFromTrash: (state, action: PayloadAction<string>) => {
            if (!state.itinerary) return;
            const trashIndex = state.trashBin.findIndex(t => t.id === action.payload);
            if (trashIndex === -1) return;

            const trashItem = state.trashBin[trashIndex];

            // Smart Restore Logic
            let targetDayIndex = -1;

            if (state.selectedDayId) {
                targetDayIndex = state.itinerary.itinerary.findIndex(d => d.id === state.selectedDayId);
            }

            // Hotel-Specific: Scan for empty slot
            if (trashItem.type === 'accommodation' && targetDayIndex === -1) {
                for (let i = state.itinerary.itinerary.length - 1; i >= 0; i--) {
                    if (!state.itinerary.itinerary[i].accommodation) {
                        targetDayIndex = i;
                        break;
                    }
                }
            }

            // Fallback to Original Day
            if (targetDayIndex === -1) {
                targetDayIndex = state.itinerary.itinerary.findIndex(d => d.id === trashItem.originalDayId);
            }

            // Fallback to Latest Day
            if (targetDayIndex === -1 && state.itinerary.itinerary.length > 0) {
                targetDayIndex = state.itinerary.itinerary.length - 1;
            }

            // Create New Day if needed
            if (targetDayIndex === -1) {
                const newDayNum = state.itinerary.itinerary.length + 1;
                const newDay: DayPlan = {
                    id: `day-${Date.now()}`,
                    tripId: state.itinerary.id,
                    dayNumber: newDayNum,
                    theme: 'Restored Day',
                    activities: []
                };
                state.itinerary.itinerary.push(newDay);
                state.itinerary.total_days = newDayNum;
                targetDayIndex = state.itinerary.itinerary.length - 1;
            }

            // Place Item
            if (trashItem.type === 'activity') {
                state.itinerary.itinerary[targetDayIndex].activities.push(trashItem.data as Activity);
                state.itinerary.itinerary[targetDayIndex].activities = recalculateDayTimeline(state.itinerary.itinerary[targetDayIndex].activities);
            } else if (trashItem.type === 'accommodation') {
                if (!state.itinerary.itinerary[targetDayIndex].accommodation) {
                    state.itinerary.itinerary[targetDayIndex].accommodation = trashItem.data as Accommodation;
                } else {
                    const newDayNum = state.itinerary.itinerary.length + 1;
                    const newDay: DayPlan = {
                        id: `day-${Date.now()}`,
                        tripId: state.itinerary.id,
                        dayNumber: newDayNum,
                        theme: 'Restored Day',
                        accommodation: trashItem.data as Accommodation,
                        activities: []
                    };
                    state.itinerary.itinerary.push(newDay);
                    state.itinerary.total_days = newDayNum;
                }
            }

            // Remove from trash
            state.trashBin.splice(trashIndex, 1);

            if (state.trashBin.length === 0) {
                state.trashBinOpen = false;
            }
        },

        emptyTrash: (state) => {
            state.trashBin = [];
            state.trashBinOpen = false;
        },

        // UI State Actions
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },

        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },

        setTrashBinOpen: (state, action: PayloadAction<boolean>) => {
            state.trashBinOpen = action.payload;
        },

        selectDay: (state, action: PayloadAction<string | null>) => {
            state.selectedDayId = action.payload;
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

                // Derive TripState from the fetched Trip to ensure Dashboard renders
                if (action.payload.itinerary.length > 0) {
                    const firstDay = action.payload.itinerary[0];
                    const lastDay = action.payload.itinerary[action.payload.itinerary.length - 1];

                    state.tripState = {
                        destination: action.payload.trip_title.replace('Mock ', '').replace(' Adventure', '').replace(' Escape', '').replace(' Cultural', ''), // Simple cleanup
                        startDate: firstDay.date || new Date().toISOString().split('T')[0],
                        endDate: lastDay.date || new Date().toISOString().split('T')[0],
                        vibe: TripVibe.RELAX, // Default or derive if added to DB
                        budget: 1000, // Default or derive
                        travelers: 2 // Default
                    };
                }
            })
            .addCase(fetchItinerary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch itinerary';
            })
            // Fetch Saved Trips
            .addCase(fetchSavedTrips.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSavedTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.savedTrips = action.payload;
            })
            .addCase(fetchSavedTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch saved trips';
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
    updateDay,
    restoreFromTrash,
    emptyTrash,
    selectDay,
    setTrashBinOpen
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
