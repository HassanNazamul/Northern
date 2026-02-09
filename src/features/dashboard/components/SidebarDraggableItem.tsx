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
                "bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing group",
                isDragging && "ring-2 ring-blue-500"
            )}
        >
            <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {type === 'activity' ? item.title : item.hotelName}
                </h4>
                <div className="bg-slate-50 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3 text-blue-500" />
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                {type === 'activity' ? (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>
                ) : (
                    <>
                        <span className="flex items-center gap-1 font-bold text-emerald-600">${item.pricePerNight}</span>
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-current" /> {item.rating}</span>
                    </>
                )}
            </div>
        </div>
    );
};
