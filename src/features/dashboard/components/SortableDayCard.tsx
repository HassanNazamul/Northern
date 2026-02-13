import React from 'react';
import { useDndContext } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DayPlan, Activity, Accommodation } from '@types';
import { DRAG_TYPES } from '../utils';
import { DayCard } from './DayCard';

interface SortableDayCardProps {
    dayPlan: DayPlan;
    onSelectActivity: (activity: Activity) => void;
    onSelectAccommodation: (accommodation: Accommodation) => void;
    onAutoSuggestAccommodation: (dayId: string) => void;
    onManualAccommodation?: (dayId: string) => void;
    onAddActivity?: (dayId: string) => void;
    onDeleteDay?: (dayId: string) => void;
    activeDragType: string | null;

    // Smart Restore Props
    isSelected?: boolean;
    onSelectDay?: (dayId: string) => void;
    trashBinOpen?: boolean;
    onUpdateDay?: (dayId: string, updates: Partial<DayPlan>) => void;
}

export const SortableDayCard: React.FC<SortableDayCardProps> = (props) => {
    // -- Sortable Hook --
    // Provides drag attributes and transform styles for dnd-kit
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props.dayPlan.id,
        data: { type: DRAG_TYPES.DAY, dayPlan: props.dayPlan },
        // Disable all layout animations to prevent jittering during swap
        animateLayoutChanges: () => false,
    });

    const { over } = useDndContext();
    const isOver = over?.id === props.dayPlan.id;

    const style = {
        // Only apply transform to the dragged item. 
        // Bystander items will ignore the sortable transform, effectively disabling the shift animation.
        transform: isDragging ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.05 : 1, // Almost invisible but keeps layout space
        zIndex: isDragging ? 999 : (isOver ? 998 : 'auto'),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group h-full transition-all duration-200 ${isOver && !isDragging ? 'ring-4 ring-blue-500 ring-offset-2 scale-105 rounded-2xl' : ''}`}
        >
            <DayCard
                {...props}
                onAddActivity={props.onAddActivity}
                onDeleteDay={props.onDeleteDay}
                dragHandleProps={{ attributes, listeners }}
                isSelected={props.isSelected}
                onSelectDay={props.onSelectDay}
                trashBinOpen={props.trashBinOpen}
                onUpdateDay={props.onUpdateDay}
            />
            {/* Swap Indicator Overlay */}
            {isOver && !isDragging && (
                <div className="absolute inset-0 bg-blue-500/10 rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Swap</span>
                </div>
            )}
        </div>
    );
};
