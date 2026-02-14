import React from 'react';
import { Filter, RotateCw, Search, Shuffle } from 'lucide-react';
import { cn } from '@utils';

interface FilterBarProps {
    filters: string[];
    activeFilters: string[];
    isSearchMode?: boolean;
    onToggleFilter: (filter: string) => void;
    onRefresh: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    activeFilters,
    isSearchMode = true,
    onToggleFilter,
    onRefresh
}) => {
    return (
        <div className="flex items-center w-full px-4 py-2 border-b border-slate-100 dark:border-surface-a10 bg-white dark:bg-surface-a0">
            {/* -- Fixed Action Button -- */}
            <div className="flex items-center shrink-0 mr-3">
                <button
                    onClick={onRefresh}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm",
                        isSearchMode
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    )}
                    title={isSearchMode ? "Apply Filters" : "Shuffle Results"}
                >
                    {isSearchMode ? <Search className="w-3 h-3" /> : <Shuffle className="w-3 h-3" />}
                    {isSearchMode ? "Search" : "Shuffle"}
                </button>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-surface-a20 ml-3" />
            </div>

            {/* -- Scrollable Filter Chips -- */}
            <div className="flex-1 overflow-x-auto no-scrollbar mask-gradient-right flex items-center gap-2 pr-2">
                {filters.map((filter) => {
                    const isActive = activeFilters.includes(filter);
                    return (
                        <button
                            key={filter}
                            onClick={() => onToggleFilter(filter)}
                            className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border shrink-0",
                                isActive
                                    ? "bg-slate-900 dark:bg-primary-a30 border-slate-900 dark:border-primary-a30 text-white dark:text-surface-a0 shadow-md"
                                    : "bg-white dark:bg-surface-a10 border-slate-200 dark:border-surface-a20 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-surface-a30 hover:bg-slate-50 dark:hover:bg-surface-a20"
                            )}
                        >
                            {filter}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
