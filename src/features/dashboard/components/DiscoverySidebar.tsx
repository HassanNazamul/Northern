import React from 'react';
import { Sparkles, PanelLeftClose, Compass, Utensils, Bed, Music, RefreshCcw } from 'lucide-react';
import { cn } from '@utils';
import { SidebarDraggableItem } from './SidebarDraggableItem';
import { SidebarFooter } from './SidebarFooter';

interface DiscoverySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: 'culinary' | 'exploration' | 'stay' | 'events';
    setActiveTab: (tab: 'culinary' | 'exploration' | 'stay' | 'events') => void;
    discoveryItems: any[];
    isLoading: boolean;
}

export const DiscoverySidebar: React.FC<DiscoverySidebarProps> = ({
    isOpen,
    onClose,
    activeTab,
    setActiveTab,
    discoveryItems,
    isLoading
}) => {
    const tabs = [
        { id: 'exploration', label: 'Activities', icon: Compass },
        { id: 'culinary', label: 'Food', icon: Utensils },
        { id: 'stay', label: 'Stays', icon: Bed },
        { id: 'events', label: 'Events', icon: Music }
    ] as const;

    return (
        <div className={cn(
            "h-full bg-white border-r border-slate-200 flex flex-col relative shadow-2xl w-[340px]",
            "transition-opacity duration-500 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0"
        )}>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-900">
                        <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="font-bold tracking-tight">Discovery</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <PanelLeftClose className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* -- Tabs Navigation -- */}
            <div className="flex p-2 bg-slate-50 gap-1 border-b border-slate-100">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 flex flex-col items-center gap-1 py-3 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wide",
                            activeTab === tab.id ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />{tab.label}
                    </button>
                ))}
            </div>

            {/* -- Draggable Items List -- */}
            {/* Renders a list of items that can be dragged onto the canvas */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <RefreshCcw className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-bold">Curating Suggestions...</span>
                    </div>
                ) : discoveryItems.map((item, idx) => (
                    <SidebarDraggableItem key={idx} item={item} type={activeTab === 'stay' ? 'accommodation' : 'activity'} />
                ))}
            </div>

            {/* -- Footer -- */}
            <SidebarFooter />
        </div>
    );
};
