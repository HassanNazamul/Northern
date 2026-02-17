import React from 'react';
import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { Sparkles } from 'lucide-react';
import { DRAG_TYPES } from '../utils';
import { DayCard } from './DayCard';

interface DragOverlayContentProps {
    activeId: any;
    activeDragType: string | null;
    activeDragItem: any;
    zoom: number;
}

export const DragOverlayContent: React.FC<DragOverlayContentProps> = ({
    activeId,
    activeDragType,
    activeDragItem,
    zoom
}) => {
    // -- Drop Animation --
    // Configures the visual effect when an item is dropped (e.g., fading out).
    const dropAnimationConfig = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DragOverlay
            dropAnimation={dropAnimationConfig}
            className="z-[400]"
        >
            {activeId ? (
                <div style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    width: 'fit-content',
                    pointerEvents: 'none'
                }}>
                    {(activeDragType === DRAG_TYPES.SIDEBAR_ACTIVITY || activeDragType === DRAG_TYPES.SIDEBAR_ACCOMMODATION) && (
                        <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-blue-500 w-72 rotate-3 opacity-95">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-black text-slate-900">{activeDragItem.title || activeDragItem.hotelName}</h4>
                                <Sparkles className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Drop into Day</span>
                            </div>
                        </div>
                    )}
                    {activeDragType === DRAG_TYPES.ACTIVITY && (
                        <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-slate-100 w-[280px] -rotate-1">
                            <h4 className="text-sm font-bold text-slate-800">{activeDragItem.title}</h4>
                            <div className="mt-2 h-1 w-12 bg-blue-500 rounded-full" />
                        </div>
                    )}
                    {activeDragType === DRAG_TYPES.DAY && (
                        <div className="w-[320px] h-[700px] opacity-90 rotate-2 cursor-grabbing">
                            <DayCard
                                dayPlan={activeDragItem}
                                dayIndex={activeDragItem.dayNumber - 1} // Fix: Pass derived index
                                onSelectActivity={() => { }}
                                onSelectAccommodation={() => { }}
                                onAutoSuggestAccommodation={() => { }}
                                activeDragType={null}
                            />
                        </div>
                    )}
                </div>
            ) : null}
        </DragOverlay>
    );
};
