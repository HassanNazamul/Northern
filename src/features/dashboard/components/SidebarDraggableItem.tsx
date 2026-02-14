import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { MapPin, Star, Plus } from 'lucide-react';
import { cn } from '@utils';
import { DRAG_TYPES } from '../utils';

interface SidebarDraggableItemProps {
    item: any;
    type: 'activity' | 'accommodation';
}

export const SidebarDraggableItem: React.FC<SidebarDraggableItemProps> = ({ item, type }) => {
    // -- Draggable Logic --
    // Makes this item draggable within the DndContext. 
    // Data payload includes the item details for the drop handler.
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${type}-${item.id || item.hotelName}`,
        data: {
            type: type === 'activity' ? DRAG_TYPES.SIDEBAR_ACTIVITY : DRAG_TYPES.SIDEBAR_ACCOMMODATION,
            item
        }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                opacity: isDragging ? 0.5 : 1,
            }}
            className={cn(
                "bg-white dark:bg-surface-a10 p-3 rounded-xl border border-slate-100 dark:border-surface-a20 shadow-sm hover:shadow-md hover:border-primary-a30 dark:hover:border-primary-a30 transition-all cursor-grab active:cursor-grabbing group",
                isDragging && "ring-2 ring-primary-a30 dark:ring-primary-a30"
            )}
        >
            <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-primary-a30 dark:group-hover:text-primary-a30 transition-colors">
                    {type === 'activity' ? item.title : item.hotelName}
                </h4>
                <div className="bg-slate-50 dark:bg-surface-a20 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3 text-primary-a30 dark:text-primary-a30" />
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                {type === 'activity' ? (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>
                ) : (
                    <>
                        <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">${item.pricePerNight}</span>
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-current" /> {item.rating}</span>
                    </>
                )}
            </div>
        </div>
    );
};
