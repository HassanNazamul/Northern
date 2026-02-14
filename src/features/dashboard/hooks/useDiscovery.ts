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
    // OPTIMIZATION: Only fetch if we don't have items, or on explicit refresh.
    // Tab changes are handled client-side via selectors.
    useEffect(() => {
        // Initial Fetch if empty
        if (discoveryItems.length === 0 && !discoveryLoading) {
            dispatch(fetchDiscoveryItems());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]); // Run once on mount (or if dispatch changes, which is stable)

    const handleTabChange = (tab: DiscoveryTab) => {
        dispatch(setActiveTab(tab));
        // No fetch needed - selector handles filtering
    };

    const handleToggleFilter = (filter: string) => {
        dispatch(toggleFilter(filter));
    };

    const handleRefresh = () => {
        // Force re-fetch (simulates getting new AI suggestions)
        dispatch(fetchDiscoveryItems());
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
