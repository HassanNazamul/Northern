import React from 'react';
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
    activeDragType: string | null;
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
    } = useSortable({ id: props.dayPlan.id, data: { type: DRAG_TYPES.DAY, dayPlan: props.dayPlan } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group h-full">
            <DayCard {...props} onAddActivity={props.onAddActivity} dragHandleProps={{ attributes, listeners }} />
        </div>
    );
};
