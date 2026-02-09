
import React from 'react';

interface BudgetMeterProps {
  current: number;
  total: number;
}

const BudgetMeter: React.FC<BudgetMeterProps> = ({ current, total }) => {
  const percentage = Math.min(100, (current / total) * 100);
  const isOver = current > total;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-slate-700">Budget Progress</h3>
        <span className={`text-xs font-bold ${isOver ? 'text-rose-600' : 'text-slate-500'}`}>
          ${current.toLocaleString()} / ${total.toLocaleString()} CAD
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isOver && (
        <p className="text-[10px] text-rose-500 mt-1 font-medium">Over budget! Consider swapping some activities.</p>
      )}
    </div>
  );
};

export default BudgetMeter;
