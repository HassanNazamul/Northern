import React from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DayPlan, Activity, Accommodation } from '@types';
import { SortableDayCard } from './SortableDayCard';

interface DashboardCanvasProps {
    itinerary: DayPlan[];
    budget: number;
    zoom: number;
    pan: { x: number; y: number };
    isPanning: boolean;
    canvasRef: React.RefObject<HTMLDivElement>;
    onWheel: (e: React.WheelEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onSelectActivity: (activity: Activity) => void;
    onSelectAccommodation: (accommodation: Accommodation) => void;
    onAutoSuggestAccommodation: (dayId: string) => void;
    activeDragType: string | null;
}

export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
    itinerary,
    zoom,
    pan,
    isPanning,
    canvasRef,
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onSelectActivity,
    onSelectAccommodation,
    onAutoSuggestAccommodation,
    activeDragType,
}) => {
    return (
        <div
            className="w-full h-full bg-[#F8FAFC] canvas-bg"
            ref={canvasRef}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        >
            <div
                className="w-full h-full transition-transform duration-75 ease-out origin-center flex items-center justify-center"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    cursor: isPanning ? 'grabbing' : 'default'
                }}
            >
                <SortableContext
                    items={itinerary.map(d => d.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="flex gap-12 p-24 w-max h-max">
                        {itinerary.map((day) => (
                            <SortableDayCard
                                key={day.id}
                                dayPlan={day}
                                onSelectActivity={onSelectActivity}
                                onSelectAccommodation={onSelectAccommodation}
                                onAutoSuggestAccommodation={onAutoSuggestAccommodation}
                                activeDragType={activeDragType}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
};
