import React from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { DayPlan, Activity, Accommodation } from '@types';
import { SortableDayCard } from './SortableDayCard';
import { AddDayButton } from './AddDayButton';

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
    onManualAccommodation: (dayId: string) => void;

    onAddActivity: (dayId: string) => void;
    onDeleteDay: (dayId: string) => void;
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
    onManualAccommodation,
    onAddActivity,
    onDeleteDay,
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
            {/* -- Canvas Transformer -- */}
            {/* Applies Zoom (scale) and Pan (translate) to the inner content container */}
            <div
                className="w-full h-full transition-transform duration-75 ease-out origin-top-left"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    cursor: isPanning ? 'grabbing' : 'default'
                }}
            >
                <SortableContext
                    items={itinerary.map(d => d.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-5 gap-8 p-12 w-max">
                        {itinerary.map((day) => (
                            <SortableDayCard
                                key={day.id}
                                dayPlan={day}
                                onSelectActivity={onSelectActivity}
                                onSelectAccommodation={onSelectAccommodation}
                                onAutoSuggestAccommodation={onAutoSuggestAccommodation}
                                onManualAccommodation={onManualAccommodation}
                                onAddActivity={onAddActivity}
                                onDeleteDay={onDeleteDay}
                                activeDragType={activeDragType}
                            />
                        ))}

                        {/* -- Add New Day Button -- */}
                        <div className="w-[350px] shrink-0 h-[700px]">
                            <AddDayButton />
                        </div>
                    </div>
                </SortableContext>
            </div>
        </div>
    );
};
