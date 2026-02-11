import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Bed, Star, Sparkles, GripVertical, Plus, Trash2 } from 'lucide-react';
import { cn } from '@utils';
import { DayPlan, Activity, Accommodation } from '@types';
import { DRAG_TYPES } from '../utils';
import { SortableActivityItem } from './SortableActivityItem';

interface DayCardProps {
    dayPlan: DayPlan;
    onSelectActivity: (activity: Activity) => void;
    onSelectAccommodation: (accommodation: Accommodation) => void;
    onAutoSuggestAccommodation: (dayId: string) => void;
    onManualAccommodation?: (dayId: string) => void;
    onAddActivity?: (dayId: string) => void;
    onDeleteDay?: (dayId: string) => void;
    activeDragType: string | null;
    dragHandleProps?: {
        attributes: any;
        listeners: any;
    };
}

export const DayCard: React.FC<DayCardProps> = ({
    dayPlan,
    onSelectActivity,
    onSelectAccommodation,
    onAutoSuggestAccommodation,
    onManualAccommodation,
    onAddActivity,
    onDeleteDay,
    activeDragType,
    dragHandleProps
}) => {
    // -- Droppable Zones --
    // 1. Hotel Zone: Dropping an accommodation here updates the day's stay
    const { setNodeRef: setHotelRef, isOver: isHotelOver } = useDroppable({
        id: `hotel-zone-${dayPlan.id}`,
        data: { type: 'HOTEL_ZONE', dayId: dayPlan.id }
    });

    // 2. Activity List Zone: Dropping an activity here adds it to the day's itinerary
    const { setNodeRef: setListRef, isOver: isListOver } = useDroppable({
        id: `activity-list-${dayPlan.id}`,
        data: { type: 'ACTIVITY_LIST', dayId: dayPlan.id }
    });

    return (
        <div className={cn(
            "w-[320px] bg-white rounded-2xl shadow-xl border-2 flex flex-col h-[700px] transition-all overflow-hidden relative",
            (isListOver && activeDragType === DRAG_TYPES.SIDEBAR_ACTIVITY) ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-100"
        )}>
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold">Day {dayPlan.day}</h2>
                        <p className="text-xs text-slate-400 font-medium opacity-80">{dayPlan.theme}</p>
                    </div>
                    {dragHandleProps && (
                        <div
                            className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                            {...dragHandleProps.attributes}
                            {...dragHandleProps.listeners}
                        >
                            <GripVertical className="w-5 h-5 text-white/60" />
                        </div>
                    )}
                </div>
            </div>

            <div
                ref={setHotelRef}
                className={cn(
                    "p-3 bg-slate-50 border-b border-slate-100 shrink-0 transition-colors",
                    (isHotelOver && activeDragType === DRAG_TYPES.SIDEBAR_ACCOMMODATION) && "bg-blue-100 border-blue-400 ring-4 ring-blue-500/10"
                )}
            >
                {dayPlan.accommodation ? (
                    <div
                        onClick={() => onSelectAccommodation(dayPlan.accommodation!)}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 transition-all group relative"
                    >
                        <div className="flex items-start gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                <Bed className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{dayPlan.accommodation.hotelName}</h4>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                                    <span>{dayPlan.accommodation.rating}</span>
                                    <span className="text-emerald-600 font-bold ml-1">${dayPlan.accommodation.pricePerNight}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onAutoSuggestAccommodation(dayPlan.id)}
                            className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-white transition-all gap-1"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase">Auto-Find</span>
                        </button>
                        <button
                            onClick={() => onManualAccommodation && onManualAccommodation(dayPlan.id)}
                            className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-white transition-all gap-1"
                        >
                            <GripVertical className="w-4 h-4 rotate-90" />
                            <span className="text-[10px] font-bold uppercase">Fill Manual</span>
                        </button>
                    </div>
                )}
            </div>

            <div
                ref={setListRef}
                className="flex-1 overflow-y-auto p-3 custom-scrollbar relative bg-slate-50/20"
            >
                <SortableContext
                    items={dayPlan.activities.map((a) => a.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {dayPlan.activities.map((activity) => (
                        <SortableActivityItem
                            key={activity.id}
                            activity={activity}
                            dayId={dayPlan.id}
                            onClick={() => onSelectActivity(activity)}
                        />
                    ))}
                </SortableContext>

                {dayPlan.activities.length === 0 && (
                    <div className="absolute inset-0 m-3 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl pointer-events-none">
                        <span className="text-xs font-medium">No activities planned</span>
                    </div>
                )}

                {/* -- Add Activity Button -- */}
                <button
                    onClick={() => onAddActivity && onAddActivity(dayPlan.id)}
                    className="w-full mt-3 py-3 px-4 flex items-center justify-center gap-2
                               rounded-xl border border-dashed border-slate-200 dark:border-slate-700
                               text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10
                               transition-all duration-200 group opacity-70 hover:opacity-100 mb-4"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Activity</span>
                </button>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-1/3 text-left">
                    {dayPlan.activities.length} Stops
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/3 text-center">
                    Est: ${dayPlan.activities.reduce((s, a) => s + a.cost_estimate, 0) + (dayPlan.accommodation?.pricePerNight || 0)}
                </span>
                <div className="w-1/3 flex justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDay?.(dayPlan.id);
                        }}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                        title="Delete Day"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
