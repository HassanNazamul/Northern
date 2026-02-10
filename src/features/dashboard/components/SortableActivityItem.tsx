import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, DollarSign, GripHorizontal } from 'lucide-react';
import { Activity } from '@types';
import { DRAG_TYPES } from '../utils';

interface SortableActivityItemProps {
    activity: Activity;
    onClick: () => void;
}

export const SortableActivityItem: React.FC<SortableActivityItemProps> = ({ activity, onClick }) => {
    // -- Sortable Logic --
    // Hooks into dnd-kit's sorting system to allow reordering within the list.
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: activity.id, data: { type: DRAG_TYPES.ACTIVITY, activity } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="group relative bg-white p-3 rounded-xl border border-slate-100 shadow-sm mb-2 hover:border-blue-400 transition-all cursor-pointer"
        >
            <div
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1"
                {...attributes} {...listeners}
                onClick={(e) => e.stopPropagation()}
            >
                <GripHorizontal className="w-4 h-4 text-slate-300 hover:text-blue-500" />
            </div>
            <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1 min-w-[3rem]">
                    <span className="text-xs font-bold text-slate-700">{activity.time}</span>
                    <div className="h-full w-0.5 bg-slate-100 my-1 relative">
                        {activity.travelTimeFromPrev ? (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 text-[9px] px-1 rounded-full whitespace-nowrap text-slate-400">
                                +{activity.travelTimeFromPrev}m
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="flex-1 pr-6">
                    <h4 className="text-sm font-semibold text-slate-800 leading-tight mb-1">{activity.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">{activity.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.durationMinutes}m</span>
                        <span className="flex items-center gap-1 text-emerald-600"><DollarSign className="w-3 h-3" /> {activity.cost_estimate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
