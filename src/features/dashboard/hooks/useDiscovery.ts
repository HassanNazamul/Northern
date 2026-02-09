import { useState, useCallback, useEffect } from 'react';
import { getDiscoverySuggestions } from '@services';

type DiscoveryTab = 'culinary' | 'exploration' | 'stay' | 'events';

export const useDiscovery = (destination: string, vibe: string, budget: number) => {
    const [activeTab, setActiveTab] = useState<DiscoveryTab>('exploration');
    const [discoveryItems, setDiscoveryItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDiscovery = useCallback(async () => {
        setIsLoading(true);
        try {
            const items = await getDiscoverySuggestions(activeTab, destination, vibe, budget);
            setDiscoveryItems(items);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, destination, vibe, budget]);

    useEffect(() => {
        fetchDiscovery();
    }, [activeTab]);

    return {
        activeTab,
        setActiveTab,
        discoveryItems,
        isLoading,
    };
};
