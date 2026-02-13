import React, { useEffect } from 'react';
import { TripState } from '@types';
import { useAppDispatch, useAppSelector, selectDiscoveryTab, selectDiscoveryItems, selectDiscoveryLoading, selectDiscoveryFilters } from '@state';
import { setActiveTab, fetchDiscoveryItems, toggleFilter, clearFilters, FILTERS_BY_TAB } from '@state/slices/discoverySlice';
import type { DiscoveryTab } from '@state/slices/discoverySlice';

export const useDiscovery = (tripState: TripState) => {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector(selectDiscoveryTab);
    const discoveryItems = useAppSelector(selectDiscoveryItems);
    const discoveryLoading = useAppSelector(selectDiscoveryLoading);
    const activeFilters = useAppSelector(selectDiscoveryFilters);

    // -- State Sync Logic --
    // "currentlyActiveParams" serves as the source of truth for what is currently displayed on the canvas.
    // If activeFilters (UI state) != currentlyActiveParams (Canvas state), we are in "Search" mode.
    // Otherwise, we are in "Shuffle" mode (refreshing the same parameters).
    const [currentlyActiveParams, setCurrentlyActiveParams] = React.useState<string[]>([]);

    // Derived State: Comparison for Sync Logic
    const isSearchMode = React.useMemo(() => {
        // 1. Length Check: Quick fail if counts differ
        if (activeFilters.length !== currentlyActiveParams.length) return true;

        // 2. Content Check: Ensure every active filter exists in currentlyActiveParams.
        // Since lengths are equal, if A is subset of B, then A == B.
        return !activeFilters.every(f => currentlyActiveParams.includes(f));
    }, [activeFilters, currentlyActiveParams]);

    // -- Discovery Logic --
    // Fetches suggestions based on the current active tab and trip settings.
    // DOES NOT automatically fetch when filters change (manual trigger required).
    useEffect(() => {
        const { destination, vibe, budget } = tripState;

        // Scenario 1: Initial & Reverted State (Tab Change)
        // When tab changes, activeFilters resets to [].
        // We must sync currentlyActiveParams to [] so the button defaults to "Refresh" (Shuffle).
        setCurrentlyActiveParams([]);

        dispatch(fetchDiscoveryItems({
            tab: activeTab,
            filters: activeFilters,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, tripState, dispatch]);

    const handleTabChange = (tab: DiscoveryTab) => {
        dispatch(setActiveTab(tab));
    };

    const handleToggleFilter = (filter: string) => {
        dispatch(toggleFilter(filter));
    };

    const handleRefresh = () => {
        // Scenario 2: Post-Search State
        // On Search Click: Update Canvas state (currentlyActiveParams) to match UI state (activeFilters).
        // This effectively switches the button to "Refresh" (Shuffle).
        setCurrentlyActiveParams(activeFilters);

        // Force re-fetch
        const { destination, vibe, budget } = tripState;
        dispatch(fetchDiscoveryItems({
            tab: activeTab,
            filters: activeFilters,
        }));
    };

    // available filters for current tab
    const availableFilters = FILTERS_BY_TAB[activeTab] || [];

    return {
        activeTab,
        discoveryItems,
        discoveryLoading,
        activeFilters,
        availableFilters,
        isSearchMode, // Expose intent
        handleTabChange,
        handleToggleFilter,
        handleRefresh,
    };
};
