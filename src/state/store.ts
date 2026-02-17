import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import discoveryReducer from './slices/discoverySlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        discovery: discoveryReducer,
        user: userReducer,
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
