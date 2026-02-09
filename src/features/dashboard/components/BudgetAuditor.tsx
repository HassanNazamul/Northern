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

    return (
        <div className="fixed top-4 right-8 z-[100] w-64 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/60 p-3 pointer-events-auto transition-all hover:shadow-xl">
                <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Budget Tracker
                    </h3>
                    <span className={cn("text-sm font-black tabular-nums", isOverBudget ? "text-red-500" : "text-emerald-600")}>
                        {percentage}%
                    </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                    <div
                        className={cn("h-full transition-all duration-700 ease-out", isOverBudget ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-emerald-500 to-emerald-600")}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="tabular-nums">Spent: ${totalCost.toLocaleString()}</span>
                    <span className="tabular-nums">Goal: ${budget.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};
