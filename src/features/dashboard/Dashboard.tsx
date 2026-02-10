import React from 'react';
import { DndContext, rectIntersection, MeasuringStrategy } from '@dnd-kit/core';
import { ChevronLeft, PanelLeftOpen } from 'lucide-react';
import { Activity, Accommodation } from '@types';
import { ChatBot } from '@features/chat';
import { getAccommodationSuggestion } from '@services';
import { useDragAndDrop, useZoomPan, useDiscovery } from './hooks';
import { useAppSelector, useAppDispatch, selectItinerary, selectTripState, selectSidebarOpen, selectSelectedActivity, selectSelectedAccommodation } from '@state';
import { setSidebarOpen, selectActivity, selectAccommodation, setAccommodation as setAccommodationAction } from '@state/slices/dashboardSlice';
import {
  DiscoverySidebar,
  DashboardCanvas,
  BudgetAuditor,
  ZoomControls,
  DetailModal,
  ActivityDetailContent,
  AccommodationDetailContent,
  DragOverlayContent,
} from './components';

interface DashboardProps {
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onReset }) => {
  // Redux State
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
    handleWheel,
    handlePan,
    resetView,
  } = useZoomPan();


  const {
    activeTab,
    discoveryItems,
    discoveryLoading,
    handleTabChange,
  } = useDiscovery(tripState);

  // Handlers
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
      {/* Architectural Grid Layout */}
      <div className="grid h-screen overflow-hidden" style={{ transition: 'grid-template-columns 0.5s ease-in-out', gridTemplateColumns: sidebarOpen ? '340px 1fr' : '0px 1fr' }}>
        {/* Discovery Sidebar - Structural Column */}
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
        <div className="flex flex-col bg-gray-50 relative z-10 min-w-0">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm z-30">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => dispatch(setSidebarOpen(true))}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <PanelLeftOpen className="h-5 w-5" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-800">
                {tripState.destination} Itinerary
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onReset}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                New Trip
              </button>
            </div>
          </div>

          {/* Canvas Area - Flexible & Contained */}
          <div className="flex-1 relative overflow-hidden">
            <DashboardCanvas
              canvasRef={canvasRef}
              zoom={zoom}
              pan={pan}
              isPanning={isPanning}
              itinerary={itinerary.itinerary}
              activeId={activeId}
              onActivityClick={(activity) => dispatch(selectActivity(activity))}
              onAccommodationClick={(accommodation) => dispatch(selectAccommodation(accommodation))}
              onPanStart={() => setIsPanning(true)}
              onPan={handlePan}
              onPanEnd={() => setIsPanning(false)}
              onWheel={handleWheel}
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
          {selectedActivity && <ActivityDetailContent activity={selectedActivity} />}
        </DetailModal>

        {/* Accommodation Detail Modal */}
        <DetailModal
          isOpen={selectedAccommodation !== null}
          onClose={() => dispatch(selectAccommodation(null))}
          title="Accommodation Details"
        >
          {selectedAccommodation && (
            <AccommodationDetailContent accommodation={selectedAccommodation} />
          )}
        </DetailModal>
      </div>
    </DndContext>
  );
};

export default Dashboard;
