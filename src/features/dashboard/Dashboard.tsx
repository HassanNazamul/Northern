import React from 'react';
import { DndContext, rectIntersection, MeasuringStrategy } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { ChevronLeft, PanelLeftOpen } from 'lucide-react';
import { Activity, Accommodation } from '@types';
import { ChatBot } from '@features/chat';
import { getAccommodationSuggestion } from '@services';
import { useDragAndDrop, useZoomPan, useDiscovery } from './hooks';
import { useAppSelector, useAppDispatch, selectItinerary, selectTripState, selectSidebarOpen, selectSelectedActivity, selectSelectedAccommodation } from '@state';
import { setSidebarOpen, selectActivity, selectAccommodation, removeAccommodation, removeActivity, addActivity, setAccommodation as setAccommodationAction, persistItinerary, deleteDay } from '@state/slices/dashboardSlice';
import {
  DiscoverySidebar,
  DashboardCanvas,
  BudgetAuditor,
  ZoomControls,
  DetailModal,
  ActivityDetailContent,
  AccommodationDetailContent,
  DragOverlayContent,
  AccommodationFormModal,
  ActivityFormModal,
  DashboardHeader,
} from './components';

interface DashboardProps {
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onReset }) => {
  // -- Redux State Selectors --
  // Access global state for itinerary data and UI settings
  const dispatch = useAppDispatch();
  const itinerary = useAppSelector(selectItinerary);
  const tripState = useAppSelector(selectTripState);
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const selectedActivity = useAppSelector(selectSelectedActivity);
  const selectedAccommodation = useAppSelector(selectSelectedAccommodation);

  // Early return if no data
  if (!itinerary || !tripState) {
    return null;
  }

  // Custom Hooks
  const {
    sensors,
    activeId,
    activeDragType,
    activeDragItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop();


  const {
    zoom,
    pan,
    isPanning,
    canvasRef,
    contentRef,
    setIsPanning,
    setPan,
    handleZoom,
    handlePan,
    resetView,
  } = useZoomPan();


  const {
    activeTab,
    discoveryItems,
    discoveryLoading,
    handleTabChange,
  } = useDiscovery(tripState);

  const [manualAccommodationDayId, setManualAccommodationDayId] = React.useState<string | null>(null);
  const [manualActivityDayId, setManualActivityDayId] = React.useState<string | null>(null);

  // Handlers
  const handleRemoveAccommodation = (dayId: string) => {
    dispatch(removeAccommodation({ dayId }));
    dispatch(selectAccommodation(null)); // Close modal if open
  };

  const handleRemoveActivity = (dayId: string, activityId: string) => {
    dispatch(removeActivity({ dayId, activityId }));
    dispatch(selectActivity(null));
  };

  const handleSaveManualAccommodation = (accommodation: Accommodation) => {
    if (manualAccommodationDayId) {
      dispatch(setAccommodationAction({ dayId: manualAccommodationDayId, accommodation }));
      setManualAccommodationDayId(null);
    }
  };

  const handleSaveManualActivity = (activity: Activity) => {
    if (manualActivityDayId) {
      dispatch(addActivity({ dayId: manualActivityDayId, activity }));
      setManualActivityDayId(null);
    }
  };

  const handleGetAccommodation = async (dayId: string) => {
    try {
      const day = itinerary.itinerary.find(d => d.id === dayId);
      if (!day) return;

      const location = day.activities[0]?.location || tripState.destination;
      const accom = await getAccommodationSuggestion(location, tripState.budget);
      dispatch(setAccommodationAction({ dayId, accommodation: accom }));
    } catch (err) {
      console.error('Failed to get accommodation', err);
    }
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      {/* -- Architectural Grid Layout -- */}
      {/* Uses CSS Grid to toggle sidebar visibility with smooth transition */}
      <div className="grid h-screen overflow-hidden" style={{ transition: 'grid-template-columns 0.5s ease-in-out', gridTemplateColumns: sidebarOpen ? '340px 1fr' : '0px 1fr' }}>

        {/* -- Discovery Sidebar (Left Column) -- */}
        <div className="relative z-20 overflow-hidden">
          <DiscoverySidebar
            isOpen={sidebarOpen}
            activeTab={activeTab}
            discoveryItems={discoveryItems}
            isLoading={discoveryLoading}
            setActiveTab={handleTabChange}
            onClose={() => dispatch(setSidebarOpen(false))}
          />
        </div>

        {/* Main Content Area - Flexible Column */}
        <div className="flex flex-col bg-[#FCFCFC] relative z-10 min-w-0 overflow-hidden">

          {/* -- Live Mesh Background -- */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Pale Blue Blob - Top Left */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-blue-500 rounded-full blur-[120px] mix-blend-multiply"
            />

            {/* Soft Orange Blob - Bottom Right */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                x: [0, -30, 0],
                y: [0, -50, 0],
                opacity: [0.1, 0.12, 0.1]
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-orange-400 rounded-full blur-[100px] mix-blend-multiply"
            />
          </div>
          {/* Top Bar */}
          {/* Top Bar - Refactored into DashboardHeader */}
          <DashboardHeader
            destination={tripState.destination}
            onReset={onReset}
            sidebarOpen={sidebarOpen}
            onSidebarToggle={() => dispatch(setSidebarOpen(!sidebarOpen))}
          />

          {/* Canvas Area - Flexible & Contained */}
          <div className="flex-1 relative overflow-hidden">
            <DashboardCanvas
              canvasRef={canvasRef}
              zoom={zoom}
              pan={pan}
              isPanning={isPanning}
              itinerary={itinerary.itinerary}
              activeId={activeId}
              onSelectActivity={(activity) => dispatch(selectActivity(activity))}
              onSelectAccommodation={(accommodation) => dispatch(selectAccommodation(accommodation))}
              onAutoSuggestAccommodation={handleGetAccommodation}
              onPanStart={() => setIsPanning(true)}
              onPan={handlePan}
              onPanEnd={() => setIsPanning(false)}
              onManualAccommodation={(dayId) => setManualAccommodationDayId(dayId)}
              onAddActivity={(dayId) => {
                const newActivity: Activity = {
                  id: `activity-${Date.now()}`,
                  title: '',
                  description: 'New Activity',
                  time: 'TBD',
                  durationMinutes: 60,
                  category: 'Sightseeing',
                  cost_estimate: 0,
                  location: 'TBD',
                  isDraft: true
                };
                dispatch(addActivity({ dayId, activity: newActivity }));
                dispatch(persistItinerary());
              }}
              onDeleteDay={(dayId) => {
                dispatch(deleteDay({ dayId }));
                dispatch(persistItinerary());
              }}
            />

            {/* Drag Overlay */}
            <DragOverlayContent
              activeId={activeId}
              activeDragType={activeDragType}
              activeDragItem={activeDragItem}
              zoom={zoom}
            />
          </div>

          {/* Zoom Controls - Overlay on Main Content */}
          <ZoomControls
            zoom={zoom}
            onZoomIn={() => handleZoom(0.1)}
            onZoomOut={() => handleZoom(-0.1)}
            onReset={resetView}
            className="fixed bottom-6 z-[100] flex flex-col gap-2 transition-[left] duration-500 ease-in-out"
            style={{ left: sidebarOpen ? '364px' : '24px' }}
          />

          {/* Budget Auditor - Overlay Top Right */}
          <BudgetAuditor totalCost={itinerary.itinerary.reduce((total, day) => { const activitiesCost = day.activities.reduce((sum, act) => sum + (act.cost_estimate || 0), 0); const hotelCost = day.accommodation?.pricePerNight || 0; return total + activitiesCost + hotelCost; }, 0)} budget={tripState.budget} />
        </div>

        {/* ChatBot - Fixed Position */}
        <ChatBot />

        {/* Activity Detail Modal */}
        <DetailModal
          isOpen={selectedActivity !== null}
          onClose={() => dispatch(selectActivity(null))}
          title="Activity Details"
        >
          {selectedActivity && (
            <ActivityDetailContent
              activity={selectedActivity}
              onRemove={() => {
                const day = itinerary.itinerary.find(d => d.activities.some(a => a.id === selectedActivity.id));
                if (day) handleRemoveActivity(day.id, selectedActivity.id);
              }}
            />
          )}
        </DetailModal>

        {/* Accommodation Detail Modal */}
        <DetailModal
          isOpen={selectedAccommodation !== null}
          onClose={() => dispatch(selectAccommodation(null))}
          title="Accommodation Details"
        >
          {selectedAccommodation && (
            <AccommodationDetailContent
              accommodation={selectedAccommodation}
              onRemove={() => {
                // Find the day ID for this accommodation? 
                // We need to pass the dayID specifically or find it in the state.
                // A simple lookup in itinerary works.
                const day = itinerary.itinerary.find(d => d.accommodation?.hotelName === selectedAccommodation.hotelName); // Simple match
                if (day) handleRemoveAccommodation(day.id);
              }}
            />
          )}
        </DetailModal>

        {/* Manual Accommodation Form Modal */}
        <AccommodationFormModal
          isOpen={manualAccommodationDayId !== null}
          onClose={() => setManualAccommodationDayId(null)}
          onSave={handleSaveManualAccommodation}
        />

        {/* Manual Activity Form Modal */}
        <ActivityFormModal
          isOpen={manualActivityDayId !== null}
          onClose={() => setManualActivityDayId(null)}
          onSave={handleSaveManualActivity}
        />
      </div>
    </DndContext>
  );
};

export default Dashboard;
