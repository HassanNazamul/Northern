import { useEffect } from 'react';
import { TripState } from '@types';
import { useAppDispatch, useAppSelector, selectDiscoveryTab, selectDiscoveryItems, selectDiscoveryLoading } from '@state';
import { setActiveTab, fetchDiscoveryItems } from '@state/slices/discoverySlice';
import type { DiscoveryTab } from '@state/slices/discoverySlice';

export const useDiscovery = (tripState: TripState) => {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector(selectDiscoveryTab);
    const discoveryItems = useAppSelector(selectDiscoveryItems);
    const discoveryLoading = useAppSelector(selectDiscoveryLoading);

    useEffect(() => {
        const { destination, vibe, budget } = tripState;
        dispatch(fetchDiscoveryItems({
            tab: activeTab,
            destination,
            vibe,
            budget,
        }));
    }, [activeTab, tripState, dispatch]);

    const handleTabChange = (tab: DiscoveryTab) => {
        dispatch(setActiveTab(tab));
    };

    return {
        activeTab,
        discoveryItems,
        discoveryLoading,
        handleTabChange,
    };
};
