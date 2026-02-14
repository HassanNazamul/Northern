import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, DollarSign, GripHorizontal } from 'lucide-react';
import { Activity } from '@types';
import { DRAG_TYPES } from '../utils';
import { useAppDispatch } from '@state';
import { updateActivity, persistItinerary, removeActivity } from '@state/slices/dashboardSlice';
import { Check, X } from 'lucide-react';

interface SortableActivityItemProps {
    activity: Activity;
    dayId: string;
    onClick: () => void;
}

export const SortableActivityItem: React.FC<SortableActivityItemProps> = ({ activity, dayId, onClick }) => {
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

    const dispatch = useAppDispatch();
    const [draftTitle, setDraftTitle] = React.useState(activity.title);

    const handleSaveDraft = () => {
        if (!draftTitle.trim()) {
            // Logic to remove empty draft? For now just return.
            if (activity.title === '') {
                dispatch(removeActivity({ dayId, activityId: activity.id }));
            }
            return;
        }

        dispatch(updateActivity({
            dayId,
            activityId: activity.id,
            updates: {
                title: draftTitle,
                isDraft: false
            }
        }));
        dispatch(persistItinerary());
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    // -- Draft Mode View --
    if (activity.isDraft) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white p-3 rounded-xl border-2 border-dashed border-blue-300 shadow-sm mb-2"
            >
                <div className="flex items-center gap-2">
                    <input
                        autoFocus
                        type="text"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        placeholder="Enter activity name..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSaveDraft();
                            }
                        }}
                        onBlur={handleSaveDraft}
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="group relative bg-white dark:bg-surface-a10 p-3 rounded-xl border border-slate-100 dark:border-surface-a20 shadow-sm mb-2 hover:border-primary-a30 dark:hover:border-primary-a30 transition-all cursor-pointer"
        >
            <div
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1"
                {...attributes} {...listeners}
                onClick={(e) => e.stopPropagation()}
            >
                <GripHorizontal className="w-4 h-4 text-slate-300 hover:text-primary-a10 dark:text-slate-500 dark:hover:text-primary-a30" />
            </div>
            <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1 min-w-[3rem]">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{activity.time}</span>
                    <div className="h-full w-0.5 bg-slate-200 dark:bg-slate-600 my-1 relative">
                        {activity.travelTimeFromPrev ? (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-surface-a30 border border-slate-300 dark:border-slate-500 text-[9px] px-1 rounded-full whitespace-nowrap text-slate-500 dark:text-slate-200 font-medium z-10">
                                +{activity.travelTimeFromPrev}m
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="flex-1 pr-6">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white leading-tight mb-1">{activity.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-200 line-clamp-2 mb-2">{activity.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-300 uppercase font-bold tracking-wider">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.durationMinutes}m</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><DollarSign className="w-3 h-3" /> {activity.cost_estimate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
