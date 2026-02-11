import React from 'react';
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
import { Activity } from '@types';
import { useAppDispatch, useAppSelector, selectItinerary, selectDragState } from '@state';
import {
    dragStart,
    dragCancel,
    addActivity,
    reorderActivitiesWithinDay,
    moveActivityBetweenDays,
    reorderDays,
    swapDays,
    setAccommodation,
    persistItinerary,
} from '@state/slices/dashboardSlice';
import { DRAG_TYPES } from '../utils';

export const useDragAndDrop = () => {
    const dispatch = useAppDispatch();
    const itinerary = useAppSelector(selectItinerary);
    const { activeId, activeDragType, activeDragItem } = useAppSelector(selectDragState);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const findDayId = (id: UniqueIdentifier): UniqueIdentifier | null => {
        if (!itinerary) return null;
        if (itinerary.itinerary.find(d => d.id === id)) return id;
        const dayWithActivity = itinerary.itinerary.find(d => d.activities.some(a => a.id === id));
        if (dayWithActivity) return dayWithActivity.id;
        return null;
    };

    // -- Drag Context Handlers --

    // Called when a drag operation starts
    // Captures the item being dragged and stores it in Redux state
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const type = active.data.current?.type;
        const item = active.data.current?.item || active.data.current?.activity || active.data.current?.dayPlan;

        dispatch(dragStart({
            id: active.id as string,
            type: type || '',
            item,
        }));
    };

    // Called continuously while dragging over other items
    // Only used for visual updates by DndKit, no state changes here
    const handleDragOver = (event: DragOverEvent) => {
        // handleDragOver is for visual feedback only
        // Actual moves happen in handleDragEnd for smooth experience
    };

    // Called when the user drops the item
    // Calculates the new position and dispatches the appropriate Redux action
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        // If not dropped on a valid target, cancel the operation
        if (!over || !activeDragType || !itinerary) {
            dispatch(dragCancel());
            return;
        }

        // -- Activity Reordering Logic --
        if (activeDragType === DRAG_TYPES.ACTIVITY) {
            const sourceDayId = findDayId(active.id);
            if (!sourceDayId) {
                dispatch(dragCancel());
                return;
            }

            // Determine target day and insertion index
            let targetDayId: UniqueIdentifier | null = null;
            let insertionIndex: number | undefined = undefined;

            // Check if dropped on another activity
            const droppedOnActivity = itinerary.itinerary.find(d =>
                d.activities.some(a => a.id === over.id)
            );

            if (droppedOnActivity) {
                targetDayId = droppedOnActivity.id;
                insertionIndex = droppedOnActivity.activities.findIndex(a => a.id === over.id);
            }
            // Check if dropped on activity list zone
            else if (over.data.current?.type === 'ACTIVITY_LIST') {
                targetDayId = over.data.current.dayId;
                insertionIndex = undefined; // Add to end
            }
            // Check if dropped on a day card itself
            else if (itinerary.itinerary.find(d => d.id === over.id)) {
                targetDayId = over.id;
                insertionIndex = undefined; // Add to end
            }

            if (!targetDayId) {
                dispatch(dragCancel());
                return;
            }

            // Same day reordering
            if (sourceDayId === targetDayId) {
                const day = itinerary.itinerary.find(d => d.id === sourceDayId);
                if (!day) {
                    dispatch(dragCancel());
                    return;
                }

                const oldIndex = day.activities.findIndex(a => a.id === active.id);

                // If dropped on another activity in same day
                if (insertionIndex !== undefined && oldIndex !== insertionIndex) {
                    dispatch(reorderActivitiesWithinDay({
                        dayId: sourceDayId as string,
                        oldIndex,
                        newIndex: insertionIndex,
                    }));
                    dispatch(persistItinerary());
                } else {
                    dispatch(dragCancel());
                }
            }
            // Cross-day move
            else {
                dispatch(moveActivityBetweenDays({
                    sourceDayId: sourceDayId as string,
                    targetDayId: targetDayId as string,
                    activityId: active.id as string,
                    targetIndex: insertionIndex,
                }));
                dispatch(persistItinerary());
            }
        }

        // Handle day reordering - using SWAP logic instead of shift
        else if (activeDragType === DRAG_TYPES.DAY) {
            const oldIdx = itinerary.itinerary.findIndex(d => d.id === active.id);
            const newIdx = itinerary.itinerary.findIndex(d => d.id === over.id);

            if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                // Use swap instead of reorder to directly exchange positions
                dispatch(swapDays({ index1: oldIdx, index2: newIdx }));
                dispatch(persistItinerary());
            } else {
                dispatch(dragCancel());
            }
        }

        // Handle sidebar activity drop
        else if (activeDragType === DRAG_TYPES.SIDEBAR_ACTIVITY) {
            let targetDayId: string | null = null;
            let insertionIndex: number | undefined = undefined;

            // Check if dropped on a specific activity - insert before it
            const droppedOnActivity = itinerary.itinerary.find(d =>
                d.activities.some(a => a.id === over.id)
            );

            if (droppedOnActivity) {
                targetDayId = droppedOnActivity.id;
                insertionIndex = droppedOnActivity.activities.findIndex(a => a.id === over.id);
            }
            // Check if dropped on activity list zone - insert at end
            else if (over.data.current?.type === 'ACTIVITY_LIST') {
                targetDayId = over.data.current.dayId;
                insertionIndex = undefined; // Will add to end
            }

            if (targetDayId && activeDragItem) {
                const day = itinerary.itinerary.find(d => d.id === targetDayId);
                if (day) {
                    const newActivity: Activity = {
                        id: `${activeDragItem.id || activeDragItem.title}-${Date.now()}`,
                        title: activeDragItem.title,
                        description: activeDragItem.description || '',
                        location: activeDragItem.location || '',
                        time: day.activities.length > 0
                            ? day.activities[day.activities.length - 1].time
                            : '09:00',
                        cost_estimate: activeDragItem.cost_estimate || 0,
                        category: activeDragItem.category || 'Sightseeing',
                        durationMinutes: activeDragItem.durationMinutes || 120,
                    };

                    dispatch(addActivity({
                        dayId: targetDayId,
                        activity: newActivity,
                        insertionIndex,
                    }));
                    dispatch(persistItinerary());
                }
            } else {
                dispatch(dragCancel());
            }
        }

        // Handle sidebar accommodation drop
        else if (activeDragType === DRAG_TYPES.SIDEBAR_ACCOMMODATION) {
            let targetDayId: string | null = null;

            // Check if dropped on hotel zone
            if (over.data.current?.type === 'HOTEL_ZONE') {
                targetDayId = over.data.current.dayId;
            }

            if (targetDayId && activeDragItem) {
                dispatch(setAccommodation({
                    dayId: targetDayId,
                    accommodation: activeDragItem,
                }));
                dispatch(persistItinerary());
            } else {
                dispatch(dragCancel());
            }
        } else {
            dispatch(dragCancel());
        }
    };

    const handleDragCancel = () => {
        dispatch(dragCancel());
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

