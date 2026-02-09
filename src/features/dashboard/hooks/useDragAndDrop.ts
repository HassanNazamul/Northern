import React, { useState } from 'react';
import {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    UniqueIdentifier,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { ItineraryResponse, Activity, DayPlan } from '@types';
import { DRAG_TYPES, recalculateDayTimeline } from '../utils';

export const useDragAndDrop = (
    itinerary: ItineraryResponse,
    setItinerary: React.Dispatch<React.SetStateAction<ItineraryResponse | null>>
) => {
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [activeDragType, setActiveDragType] = useState<string | null>(null);
    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const findDayId = (id: UniqueIdentifier): UniqueIdentifier | null => {
        if (itinerary.itinerary.find(d => d.id === id)) return id;
        const dayWithActivity = itinerary.itinerary.find(d => d.activities.some(a => a.id === id));
        if (dayWithActivity) return dayWithActivity.id;
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id);
        setActiveDragType(active.data.current?.type);
        setActiveDragItem(active.data.current?.item || active.data.current?.activity || active.data.current?.dayPlan);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        const overId = over?.id;
        if (!overId || !activeDragType) return;

        if (activeDragType === DRAG_TYPES.ACTIVITY) {
            const activeDayId = findDayId(active.id);
            let overDayId: UniqueIdentifier | null = null;

            if (over.data.current?.type === 'ACTIVITY_LIST') overDayId = over.data.current.dayId;
            else if (over.data.current?.type === DRAG_TYPES.DAY) overDayId = over.data.current.dayPlan.id;
            else overDayId = findDayId(overId);

            if (!activeDayId || !overDayId || activeDayId === overDayId) return;

            setItinerary(prev => {
                if (!prev) return null;
                const activeDayIdx = prev.itinerary.findIndex(d => d.id === activeDayId);
                const overDayIdx = prev.itinerary.findIndex(d => d.id === overDayId);

                const newItinerary = [...prev.itinerary];
                const activeItems = [...newItinerary[activeDayIdx].activities];
                const overItems = [...newItinerary[overDayIdx].activities];

                const activeIdx = activeItems.findIndex(a => a.id === active.id);
                const [movedItem] = activeItems.splice(activeIdx, 1);

                let newIndex = overItems.length;
                if (over.data.current?.type === DRAG_TYPES.ACTIVITY) {
                    const overIdx = overItems.findIndex(a => a.id === overId);
                    newIndex = overIdx >= 0 ? overIdx : overItems.length;
                }

                overItems.splice(newIndex, 0, movedItem);

                newItinerary[activeDayIdx] = { ...newItinerary[activeDayIdx], activities: recalculateDayTimeline(activeItems) };
                newItinerary[overDayIdx] = { ...newItinerary[overDayIdx], activities: recalculateDayTimeline(overItems) };

                return { ...prev, itinerary: newItinerary };
            });
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
        setActiveDragType(null);
        setActiveDragItem(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveDragType(null);
        setActiveDragItem(null);

        if (!over) return;

        if (activeDragType === DRAG_TYPES.SIDEBAR_ACTIVITY) {
            let targetDayId: UniqueIdentifier | null = null;
            if (over.data.current?.type === 'ACTIVITY_LIST') targetDayId = over.data.current.dayId;
            else if (over.data.current?.type === DRAG_TYPES.DAY) targetDayId = over.data.current.dayPlan.id;
            else if (over.data.current?.type === DRAG_TYPES.ACTIVITY) targetDayId = findDayId(over.id);

            if (targetDayId) {
                const item = active.data.current?.item;
                setItinerary(prev => {
                    if (!prev) return null;
                    const dayIndex = prev.itinerary.findIndex(d => d.id === targetDayId);
                    const newItinerary = [...prev.itinerary];
                    const targetDay = newItinerary[dayIndex];

                    const newActivity: Activity = {
                        id: crypto.randomUUID(),
                        title: item.title,
                        location: item.location,
                        description: item.description,
                        cost_estimate: item.cost_estimate,
                        category: item.category,
                        time: "Flexible",
                        durationMinutes: item.durationMinutes || 90
                    };

                    targetDay.activities = recalculateDayTimeline([...targetDay.activities, newActivity]);
                    return { ...prev, itinerary: newItinerary };
                });
            }
        }

        if (activeDragType === DRAG_TYPES.SIDEBAR_ACCOMMODATION) {
            let targetDayId: UniqueIdentifier | null = null;
            if (over.data.current?.type === 'HOTEL_ZONE') targetDayId = over.data.current.dayId;
            else if (over.data.current?.type === DRAG_TYPES.DAY) targetDayId = over.data.current.dayPlan.id;

            if (targetDayId) {
                const item = active.data.current?.item;
                setItinerary(prev => {
                    if (!prev) return null;
                    const dayIndex = prev.itinerary.findIndex(d => d.id === targetDayId);
                    const newItinerary = [...prev.itinerary];
                    newItinerary[dayIndex].accommodation = item;
                    return { ...prev, itinerary: newItinerary };
                });
            }
        }

        if (activeDragType === DRAG_TYPES.ACTIVITY) {
            const dayId = findDayId(active.id);
            if (dayId) {
                const dayIndex = itinerary.itinerary.findIndex(d => d.id === dayId);
                const activities = itinerary.itinerary[dayIndex].activities;
                const oldIdx = activities.findIndex(a => a.id === active.id);
                const newIdx = activities.findIndex(a => a.id === over.id);

                if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                    setItinerary(prev => {
                        if (!prev) return null;
                        const newItin = [...prev.itinerary];
                        newItin[dayIndex].activities = recalculateDayTimeline(arrayMove(activities, oldIdx, newIdx));
                        return { ...prev, itinerary: newItin };
                    });
                }
            }
        }

        if (activeDragType === DRAG_TYPES.DAY && over.data.current?.type === DRAG_TYPES.DAY) {
            const oldIdx = itinerary.itinerary.findIndex(d => d.id === active.id);
            const newIdx = itinerary.itinerary.findIndex(d => d.id === over.id);
            if (oldIdx !== newIdx) {
                setItinerary(prev => {
                    if (!prev) return null;
                    const reorderedDays = Array.from(arrayMove(prev.itinerary, oldIdx, newIdx));
                    const newDays: DayPlan[] = reorderedDays.map((d: DayPlan, i) => ({ ...d, day: i + 1 }));
                    return { ...prev, itinerary: newDays };
                });
            }
        }
    };

    return {
        sensors,
        activeId,
        activeDragType,
        activeDragItem,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragCancel,
    };
};
