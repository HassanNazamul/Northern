import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import discoveryReducer from './slices/discoverySlice';

export const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        discovery: discoveryReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore non-serializable values in drag state
                ignoredPaths: ['dashboard.dragState.activeDragItem'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
