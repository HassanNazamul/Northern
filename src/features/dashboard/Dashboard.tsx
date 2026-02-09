import React, { useState } from 'react';
import { DndContext, rectIntersection, MeasuringStrategy } from '@dnd-kit/core';
import { ChevronLeft, PanelLeftOpen } from 'lucide-react';
import { ItineraryResponse, TripState, Activity, Accommodation } from '@types';
import { ChatBot } from '@features/chat';
import { getAccommodationSuggestion } from '@services';
import { useDragAndDrop, useZoomPan, useDiscovery } from './hooks';
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
  itinerary: ItineraryResponse;
  tripState: TripState;
  onReset: () => void;
  setItinerary: React.Dispatch<React.SetStateAction<ItineraryResponse | null>>;
}

const Dashboard: React.FC<DashboardProps> = ({ itinerary, tripState, onReset, setItinerary }) => {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);

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
  } = useDragAndDrop(itinerary, setItinerary);

  const {
    zoom,
    pan,
    isPanning,
    canvasRef,
    setIsPanning,
    setPan,
    handleZoom,
    handleWheel,
    resetView,
  } = useZoomPan();

  const {
    activeTab,
    setActiveTab,
    discoveryItems,
    isLoading: isLoadingDiscovery,
  } = useDiscovery(tripState.destination, tripState.vibe, tripState.budget);

  // Helper Functions
  const handleAutoSuggestAccommodation = async (dayId: string) => {
    const day = itinerary.itinerary.find(d => d.id === dayId);
    if (!day) return;

    const hotel = await getAccommodationSuggestion(day.theme, tripState.budget);
    setItinerary(prev =>
      prev ? { ...prev, itinerary: prev.itinerary.map(d => d.id === dayId ? { ...d, accommodation: hotel } : d) } : null
    );
  };

  const totalCost = itinerary.itinerary.reduce(
    (acc, d) => acc + (d.accommodation?.pricePerNight || 0) + d.activities.reduce((s, a) => s + a.cost_estimate, 0),
    0
  );

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
      <div className="flex h-screen w-screen bg-slate-50 overflow-hidden select-none">
        {/* Discovery Sidebar */}
        <DiscoverySidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          discoveryItems={discoveryItems}
          isLoading={isLoadingDiscovery}
        />

        {/* Main Canvas Area */}
        <div className="relative flex-1 h-full flex flex-col overflow-hidden">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 z-50 flex gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 text-slate-600 hover:text-blue-600"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onReset}
              className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-500 flex items-center gap-2 transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" /> Exit
            </button>
          </div>

          {/* Budget Auditor */}
          <BudgetAuditor totalCost={totalCost} budget={tripState.budget} />

          {/* Canvas */}
          <DashboardCanvas
            itinerary={itinerary.itinerary}
            budget={tripState.budget}
            zoom={zoom}
            pan={pan}
            isPanning={isPanning}
            canvasRef={canvasRef}
            onWheel={handleWheel}
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).classList.contains('canvas-bg') || e.target === canvasRef.current) {
                setIsPanning(true);
              }
            }}
            onMouseMove={(e) => {
              if (isPanning) setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
            }}
            onMouseUp={() => setIsPanning(false)}
            onSelectActivity={setSelectedActivity}
            onSelectAccommodation={setSelectedAccommodation}
            onAutoSuggestAccommodation={handleAutoSuggestAccommodation}
            activeDragType={activeDragType}
          />

          {/* Zoom Controls */}
          <ZoomControls
            onZoomIn={() => handleZoom(0.1)}
            onZoomOut={() => handleZoom(-0.1)}
            onReset={resetView}
          />
        </div>

        {/* Chatbot */}
        <ChatBot itineraryContext={JSON.stringify(itinerary)} />
      </div>

      {/* Detail Modals */}
      <DetailModal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        title="Activity Details"
      >
        {selectedActivity && <ActivityDetailContent activity={selectedActivity} />}
      </DetailModal>

      <DetailModal
        isOpen={!!selectedAccommodation}
        onClose={() => setSelectedAccommodation(null)}
        title="Stay Details"
      >
        {selectedAccommodation && <AccommodationDetailContent accommodation={selectedAccommodation} />}
      </DetailModal>

      {/* Drag Overlay */}
      <DragOverlayContent
        activeId={activeId}
        activeDragType={activeDragType}
        activeDragItem={activeDragItem}
        zoom={zoom}
      />
    </DndContext>
  );
};

export default Dashboard;
