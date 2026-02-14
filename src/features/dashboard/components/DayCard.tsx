import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Bed, Star, Sparkles, GripVertical, Plus, Trash2, Edit2 } from 'lucide-react';
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
    // Smart Restore Selection
    isSelected?: boolean;
    onSelectDay?: (dayId: string) => void;
    trashBinOpen?: boolean;
    onUpdateDay?: (dayId: string, updates: Partial<DayPlan>) => void;
    dayIndex: number;
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
    dragHandleProps,
    isSelected = false,
    onSelectDay,
    trashBinOpen = false,
    onUpdateDay,
    dayIndex
}) => {
    // -- Local Editing State --
    const [isEditing, setIsEditing] = React.useState(false);
    const [themeText, setThemeText] = React.useState(dayPlan.theme);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        if (themeText !== dayPlan.theme && onUpdateDay) {
            onUpdateDay(dayPlan.id, { theme: themeText });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setThemeText(dayPlan.theme);
        }
    };

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
        <div
            onClick={() => {
                if (trashBinOpen && onSelectDay) {
                    onSelectDay(dayPlan.id);
                }
            }}
            className={cn(
                "w-[320px] bg-white dark:bg-[#050505] rounded-2xl shadow-xl border-2 flex flex-col h-[700px] transition-all overflow-hidden relative",
                (isListOver && activeDragType === DRAG_TYPES.SIDEBAR_ACTIVITY) ? "border-primary-a0 ring-4 ring-[#da09de66]" : "border-slate-100 dark:border-white/20",
                // Selection Styling for Smart Restore
                (trashBinOpen && isSelected) && "border-primary-a0 ring-4 ring-[#da09de66] scale-[1.02] shadow-2xl z-10 cursor-pointer",
                (trashBinOpen && !isSelected) && "opacity-60 grayscale-[0.5] scale-95 hover:opacity-100 hover:grayscale-0 hover:scale-100 cursor-pointer"
            )}>
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex-1 mr-2">
                        <h2 className="text-lg font-bold select-none text-white">Day {dayIndex + 1}</h2>
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                value={themeText}
                                onChange={(e) => setThemeText(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={handleKeyDown}
                                className="text-xs text-slate-800 font-medium w-full bg-white/90 rounded px-1 py-0.5 outline-none border border-primary-a30"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <p
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="text-xs text-slate-400 font-medium opacity-80 hover:opacity-100 hover:text-white cursor-pointer transition-colors truncate border border-transparent hover:border-white/20 rounded px-1 -ml-1"
                                title="Click to rename"
                            >
                                {dayPlan.theme || "New Day"}
                            </p>
                        )}
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
                    "p-3 bg-slate-50 dark:bg-surface-a0 border-b border-slate-100 dark:border-surface-a10 shrink-0 transition-colors",
                    (isHotelOver && activeDragType === DRAG_TYPES.SIDEBAR_ACCOMMODATION) && "bg-[#da09de33] border-primary-a0 ring-4 ring-[#da09de66]"
                )}
            >
                {dayPlan.accommodation ? (
                    <div
                        onClick={() => onSelectAccommodation(dayPlan.accommodation!)}
                        className="bg-white dark:bg-surface-a10 p-3 rounded-xl border border-slate-200 dark:border-surface-a20 shadow-sm cursor-pointer hover:border-primary-a30 dark:hover:border-primary-a30 transition-all group relative"
                    >
                        <div className="flex items-start gap-3">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Bed className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{dayPlan.accommodation.hotelName}</h4>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                                    <span>{dayPlan.accommodation.rating}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">${dayPlan.accommodation.pricePerNight}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onAutoSuggestAccommodation(dayPlan.id)}
                            className="flex-1 border-2 border-dashed border-slate-200 dark:border-surface-a40 rounded-xl p-3 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-primary-a30 dark:hover:border-primary-a30 hover:text-primary-a30 dark:hover:text-primary-a30 hover:bg-white dark:hover:bg-surface-a30 transition-all gap-1"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase">Auto-Find</span>
                        </button>
                        <button
                            onClick={() => onManualAccommodation && onManualAccommodation(dayPlan.id)}
                            className="flex-1 border-2 border-dashed border-slate-200 dark:border-surface-a40 rounded-xl p-3 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-primary-a30 dark:hover:border-primary-a30 hover:text-primary-a30 dark:hover:text-primary-a30 hover:bg-white dark:hover:bg-surface-a30 transition-all gap-1"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase">Fill Manual</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 relative min-h-0 bg-slate-50/20 dark:bg-transparent">
                <div
                    ref={setListRef}
                    className="absolute inset-0 overflow-y-auto p-3 no-scrollbar cancel-pan-zoom overscroll-y-none"
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
                        <div className="absolute inset-0 m-3 flex flex-col items-center justify-center text-slate-300 dark:text-surface-a40 border-2 border-dashed border-slate-100 dark:border-surface-a20 rounded-xl pointer-events-none">
                            <span className="text-xs font-medium">No activities planned</span>
                        </div>
                    )}

                    {/* -- Add Activity Button -- */}
                    <button
                        onClick={() => onAddActivity && onAddActivity(dayPlan.id)}
                        className="w-full mt-3 py-3 px-4 flex items-center justify-center gap-2
                                   rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-500
                                   text-slate-500 dark:text-slate-400 font-medium
                                   hover:bg-[#da09de1a] dark:hover:bg-[#da09de1a] hover:text-primary-a0 dark:hover:text-primary-a10 hover:border-primary-a0 dark:hover:border-primary-a10
                                   transition-all duration-200 group opacity-80 hover:opacity-100 mb-4"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Add Activity</span>
                    </button>
                </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-surface-a0 border-t border-slate-100 dark:border-surface-a10 shrink-0 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider w-1/3 text-left">
                    {dayPlan.activities.length} Stops
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/3 text-center">
                    Est: ${dayPlan.activities.reduce((s, a) => s + a.cost_estimate, 0) + (dayPlan.accommodation?.pricePerNight || 0)}
                </span>
                <div className="w-1/3 flex justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDay?.(dayPlan.id);
                        }}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Day"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
