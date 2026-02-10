import React from 'react';
import { DollarSign } from 'lucide-react';
import { cn } from '@utils';

interface BudgetAuditorProps {
    totalCost: number;
    budget: number;
}

export const BudgetAuditor: React.FC<BudgetAuditorProps> = ({ totalCost, budget }) => {
    const percentage = Math.round((totalCost / budget) * 100);
    const isOverBudget = totalCost > budget;
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div
            className="absolute top-[88px] right-6 z-[90] transition-all duration-300 ease-in-out"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div
                className={cn(
                    "bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/60 transition-all duration-300 overflow-hidden cursor-default",
                    isExpanded ? "rounded-xl p-4 w-72" : "rounded-full p-1 w-32 hover:w-40"
                )}
            >
                {/* Collapsed View (Progress Bar Only) */}
                <div className={cn("flex flex-col gap-2", !isExpanded && "justify-center h-2")}>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-700 ease-out",
                                isOverBudget ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                            )}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                    </div>
                </div>

                {/* Expanded Details */}
                <div className={cn(
                    "transition-all duration-300 space-y-3",
                    isExpanded ? "opacity-100 max-h-40 mt-2" : "opacity-0 max-h-0 overflow-hidden mt-0"
                )}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Budget Tracker
                        </h3>
                        <span className={cn("text-sm font-black tabular-nums", isOverBudget ? "text-red-500" : "text-emerald-600")}>
                            {percentage}%
                        </span>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <div className="flex flex-col">
                            <span className="text-[9px]">Spent</span>
                            <span className="text-slate-600">${totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px]">Goal</span>
                            <span className="text-slate-600">${budget.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
