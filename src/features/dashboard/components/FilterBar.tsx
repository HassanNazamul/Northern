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
        <div className="flex items-center w-full px-4 py-2 border-b border-slate-100 bg-white">
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
                <div className="h-4 w-[1px] bg-slate-200 ml-3" />
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
                                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
