import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Dashboard Selectors
export const selectItinerary = (state: RootState) => state.dashboard.itinerary;
export const selectTripState = (state: RootState) => state.dashboard.tripState;
export const selectDragState = (state: RootState) => state.dashboard.dragState;
export const selectSidebarOpen = (state: RootState) => state.dashboard.sidebarOpen;
export const selectSelectedActivity = (state: RootState) => state.dashboard.selectedActivity;
export const selectSelectedAccommodation = (state: RootState) => state.dashboard.selectedAccommodation;

// Memoized Dashboard Selectors
export const selectTotalCost = createSelector(
    [selectItinerary],
    (itinerary) => {
        if (!itinerary) return 0;
        return itinerary.itinerary.reduce(
            (acc, d) => acc + (d.accommodation?.pricePerNight || 0) + d.activities.reduce((s, a) => s + a.cost_estimate, 0),
            0
        );
    }
);

// Discovery Selectors
export const selectDiscoveryTab = (state: RootState) => state.discovery.activeTab;
export const selectDiscoveryItems = (state: RootState) => state.discovery.items;
export const selectDiscoveryLoading = (state: RootState) => state.discovery.loading;
export const selectDiscoveryError = (state: RootState) => state.discovery.error;
