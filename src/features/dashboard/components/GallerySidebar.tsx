import React from 'react';
import { Sparkles, PanelLeftClose, Filter, SortAsc, Heart, BarChart2 } from 'lucide-react';
import { cn } from '@utils';
import { SidebarFooter } from './SidebarFooter';

interface GallerySidebarProps {
    isOpen: boolean;
    onClose: () => void;

    // Filter State
    activeCategory: string;
    onSelectCategory: (category: string) => void;

    // Sort State
    sortBy: 'recent' | 'alphabetical' | 'destination';
    onSortChange: (sort: 'recent' | 'alphabetical' | 'destination') => void;

    // Favorites
    showFavoritesOnly: boolean;
    onToggleFavorites: () => void;

    // Stats
    totalTrips: number;
}

export const GallerySidebar: React.FC<GallerySidebarProps> = ({
    isOpen,
    onClose,
    activeCategory,
    onSelectCategory,
    sortBy,
    onSortChange,
    showFavoritesOnly,
    onToggleFavorites,
    totalTrips
}) => {
    const categories = ['All', 'Luxury', 'Adventure', 'Family', 'Relax', 'Budget'];

    return (
        <div className={cn(
            "h-full bg-white dark:bg-surface-a0 border-r border-slate-200 dark:border-surface-a10 flex flex-col relative shadow-2xl w-[340px]",
            "transition-all duration-500 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0"
        )}>
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-100 dark:border-surface-a10 bg-slate-50/50 dark:bg-surface-a0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="font-bold tracking-tight">My Trips</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-surface-a10 rounded-full text-slate-400 dark:text-slate-500">
                        <PanelLeftClose className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats Widget */}
            <div className="p-4 m-4 bg-slate-50 dark:bg-surface-a10 rounded-xl border border-slate-100 dark:border-surface-a20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <BarChart2 className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Saved</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{totalTrips} Trips</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">

                {/* Sort */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <SortAsc className="w-3 h-3" /> Sort By
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { id: 'recent', label: 'Most Recent' },
                            { id: 'alphabetical', label: 'Alphabetical' },
                            { id: 'destination', label: 'Destination' }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => onSortChange(opt.id as any)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-lg text-left transition-all",
                                    sortBy === opt.id
                                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-500 border border-purple-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-a10"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => onSelectCategory(cat)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-semibold rounded-full border transition-all",
                                    activeCategory === cat
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md"
                                        : "bg-white dark:bg-surface-a0 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-surface-a20 hover:border-slate-300 dark:hover:border-surface-a30"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Favorites Toggle */}
                <div className="pt-4 border-t border-slate-100 dark:border-surface-a10">
                    <button
                        onClick={onToggleFavorites}
                        className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all group",
                            showFavoritesOnly
                                ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30"
                                : "bg-white dark:bg-surface-a0 border-slate-200 dark:border-surface-a20 hover:border-red-200 dark:hover:border-red-900/30"
                        )}
                    >
                        <span className={cn(
                            "text-sm font-medium",
                            showFavoritesOnly ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400 group-hover:text-red-500"
                        )}>
                            Show Favorites Only
                        </span>
                        <Heart
                            className={cn(
                                "w-4 h-4 transition-colors",
                                showFavoritesOnly ? "fill-red-500 text-red-500" : "text-slate-400 group-hover:text-red-500"
                            )}
                        />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <SidebarFooter />
        </div>
    );
};
