
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DndContext,
  closestCorners,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
  useDraggable,
  useDroppable,
  MeasuringStrategy,
  pointerWithin
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  Map as MapIcon,
  ChevronLeft,
  Clock,
  DollarSign,
  MapPin,
  RefreshCcw,
  GripVertical,
  GripHorizontal,
  ZoomIn,
  ZoomOut,
  Maximize,
  Bed,
  Star,
  ExternalLink,
  Sparkles,
  Utensils,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Search,
  Music,
  Plus,
  X,
  Phone,
  Link as LinkIcon,
  Info
} from 'lucide-react';
import { ItineraryResponse, TripState, DayPlan, Activity, Accommodation } from '../types';
import ChatBot from './ChatBot';
import { getAccommodationSuggestion, getDiscoverySuggestions } from '../services/geminiService';

// --- Types & Constants ---

const DRAG_TYPES = {
  SIDEBAR_ACTIVITY: 'SIDEBAR_ACTIVITY',
  SIDEBAR_ACCOMMODATION: 'SIDEBAR_ACCOMMODATION',
  ACTIVITY: 'ACTIVITY',
  DAY: 'DAY'
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Utilities ---

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const recalculateDayTimeline = (activities: Activity[]) => {
  const START_HOUR = 9;
  const DEFAULT_DURATION = 120;
  const DEFAULT_BUFFER = 30;
  
  let currentMs = new Date().setHours(START_HOUR, 0, 0, 0);
  
  return activities.map((activity, index) => {
    let travelMinutes = 0;
    if (index > 0) {
      const prev = activities[index-1];
      if (prev.coordinates && activity.coordinates) {
        const dist = calculateDistance(prev.coordinates.lat, prev.coordinates.lng, activity.coordinates.lat, activity.coordinates.lng);
        travelMinutes = Math.ceil(dist / 0.5) + 15;
      } else {
        travelMinutes = DEFAULT_BUFFER;
      }
    }
    
    currentMs += travelMinutes * 60000;
    const startTimeDate = new Date(currentMs);
    const timeString = startTimeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    const duration = activity.durationMinutes || DEFAULT_DURATION;
    currentMs += duration * 60000;
    
    return {
      ...activity,
      time: timeString,
      travelTimeFromPrev: travelMinutes
    };
  });
};

// --- Sub-Components ---

const DetailModal = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
        >
           <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" /> {title}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
           </div>
           <div className="p-6 max-h-[70vh] overflow-y-auto">
              {children}
           </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const SidebarDraggableItem: React.FC<{ item: any; type: 'activity' | 'accommodation' }> = ({ item, type }) => {
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
      className={cn(
        "bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing group",
        isDragging && "opacity-50 ring-2 ring-blue-500"
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

const SortableActivityItem: React.FC<{ activity: Activity; onClick: () => void }> = ({ activity, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: activity.id, data: { type: DRAG_TYPES.ACTIVITY, activity } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="group relative bg-white p-3 rounded-xl border border-slate-100 shadow-sm mb-2 hover:border-blue-400 transition-all cursor-pointer"
    >
      <div 
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1" 
        {...attributes} {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripHorizontal className="w-4 h-4 text-slate-300 hover:text-blue-500" />
      </div>
      <div className="flex gap-3">
         <div className="flex flex-col items-center pt-1 min-w-[3rem]">
             <span className="text-xs font-bold text-slate-700">{activity.time}</span>
             <div className="h-full w-0.5 bg-slate-100 my-1 relative">
                {activity.travelTimeFromPrev ? (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 text-[9px] px-1 rounded-full whitespace-nowrap text-slate-400">
                         +{activity.travelTimeFromPrev}m
                    </div>
                ) : null}
             </div>
         </div>
         <div className="flex-1 pr-6">
             <h4 className="text-sm font-semibold text-slate-800 leading-tight mb-1">{activity.title}</h4>
             <p className="text-xs text-slate-500 line-clamp-2 mb-2">{activity.description}</p>
             <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                 <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.durationMinutes}m</span>
                 <span className="flex items-center gap-1 text-emerald-600"><DollarSign className="w-3 h-3" /> {activity.cost_estimate}</span>
             </div>
         </div>
      </div>
    </div>
  );
};

const DayCard = ({ 
  dayPlan, 
  onSelectActivity,
  onSelectAccommodation, 
  onAutoSuggestAccommodation,
  activeDragType
}: any) => {
  const { setNodeRef: setHotelRef, isOver: isHotelOver } = useDroppable({
    id: `hotel-zone-${dayPlan.id}`,
    data: { type: 'HOTEL_ZONE', dayId: dayPlan.id }
  });

  const { setNodeRef: setListRef, isOver: isListOver } = useDroppable({
      id: `activity-list-${dayPlan.id}`,
      data: { type: 'ACTIVITY_LIST', dayId: dayPlan.id }
  });

  return (
    <div className={cn(
        "w-[320px] bg-white rounded-2xl shadow-xl border-2 flex flex-col h-[700px] transition-all overflow-hidden relative",
        (isListOver && activeDragType === DRAG_TYPES.SIDEBAR_ACTIVITY) ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-100"
    )}>
         <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0">
             <div className="flex justify-between items-start">
                 <div>
                     <h2 className="text-lg font-bold">Day {dayPlan.day}</h2>
                     <p className="text-xs text-slate-400 font-medium opacity-80">{dayPlan.theme}</p>
                 </div>
             </div>
         </div>

         <div 
            ref={setHotelRef}
            className={cn(
                "p-3 bg-slate-50 border-b border-slate-100 shrink-0 transition-colors",
                (isHotelOver && activeDragType === DRAG_TYPES.SIDEBAR_ACCOMMODATION) && "bg-blue-100 border-blue-400 ring-4 ring-blue-500/10"
            )}
         >
             {dayPlan.accommodation ? (
                 <div 
                    onClick={() => onSelectAccommodation(dayPlan.accommodation)}
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 transition-all group relative"
                 >
                     <div className="flex items-start gap-3">
                         <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                             <Bed className="w-4 h-4" />
                         </div>
                         <div>
                             <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{dayPlan.accommodation.hotelName}</h4>
                             <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                                 <Star className="w-3 h-3 text-amber-400 fill-current" />
                                 <span>{dayPlan.accommodation.rating}</span>
                                 <span className="text-emerald-600 font-bold ml-1">${dayPlan.accommodation.pricePerNight}</span>
                             </div>
                         </div>
                     </div>
                 </div>
             ) : (
                 <div className="flex gap-2">
                    <button 
                        onClick={() => onAutoSuggestAccommodation(dayPlan.id)}
                        className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-white transition-all gap-1"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Auto-Find Stay</span>
                    </button>
                 </div>
             )}
         </div>

         <div 
            ref={setListRef}
            className="flex-1 overflow-y-auto p-3 custom-scrollbar relative bg-slate-50/20"
         >
             <SortableContext 
                items={dayPlan.activities.map((a: any) => a.id)} 
                strategy={verticalListSortingStrategy}
             >
                 {dayPlan.activities.map((activity: any) => (
                     <SortableActivityItem 
                        key={activity.id} 
                        activity={activity} 
                        onClick={() => onSelectActivity(activity)}
                      />
                 ))}
             </SortableContext>
             
             {dayPlan.activities.length === 0 && (
                 <div className="absolute inset-0 m-3 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl pointer-events-none">
                     <span className="text-xs font-medium">No activities planned</span>
                 </div>
             )}
         </div>
         
         <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0 text-[10px] font-bold text-slate-400 flex justify-between uppercase tracking-wider">
             <span>{dayPlan.activities.length} Stops</span>
             <span>Est: ${dayPlan.activities.reduce((s: number, a: any) => s + a.cost_estimate, 0) + (dayPlan.accommodation?.pricePerNight || 0)}</span>
         </div>
    </div>
  );
};

const SortableDayCard = (props: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.dayPlan.id, data: { type: DRAG_TYPES.DAY, dayPlan: props.dayPlan } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group h-full">
             <div 
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur p-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                {...attributes} 
                {...listeners}
             >
                 <GripVertical className="w-4 h-4 text-slate-500" />
             </div>
             <DayCard {...props} />
        </div>
    );
};

// --- Main Dashboard ---

const Dashboard: React.FC<{
  itinerary: ItineraryResponse;
  tripState: TripState;
  onReset: () => void;
  setItinerary: React.Dispatch<React.SetStateAction<ItineraryResponse | null>>;
}> = ({ itinerary, tripState, onReset, setItinerary }) => {
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);

  const [activeTab, setActiveTab] = useState<'culinary' | 'exploration' | 'stay' | 'events'>('exploration');
  const [discoveryItems, setDiscoveryItems] = useState<any[]>([]);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchDiscovery = useCallback(async () => {
      setIsLoadingDiscovery(true);
      try {
          const items = await getDiscoverySuggestions(activeTab, tripState.destination, tripState.vibe, tripState.budget);
          setDiscoveryItems(items);
      } catch (e) { console.error(e); } 
      finally { setIsLoadingDiscovery(false); }
  }, [activeTab, tripState.destination, tripState.vibe, tripState.budget]);

  useEffect(() => { fetchDiscovery(); }, [activeTab]);

  const handleZoom = (delta: number) => setZoom(prev => Math.max(0.4, Math.min(1.5, prev + delta)));
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
    } else {
      setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  // --- DND Handlers ---
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveDragType(active.data.current?.type);
    setActiveDragItem(active.data.current?.item || active.data.current?.activity || active.data.current?.dayPlan);
  };

  const findDayId = (id: UniqueIdentifier) => {
      if (itinerary.itinerary.find(d => d.id === id)) return id;
      const dayWithActivity = itinerary.itinerary.find(d => d.activities.some(a => a.id === id));
      if (dayWithActivity) return dayWithActivity.id;
      return null;
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
                     if(!prev) return null;
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
                   const newDays = arrayMove(prev.itinerary, oldIdx, newIdx).map((d, i) => ({ ...d, day: i + 1 }));
                   return { ...prev, itinerary: newDays };
              });
         }
    }
  };

  const totalCost = itinerary.itinerary.reduce((acc, d) => 
      acc + (d.accommodation?.pricePerNight || 0) + d.activities.reduce((s, a) => s + a.cost_estimate, 0), 0);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <div className="flex h-screen w-screen bg-slate-50 overflow-hidden select-none">
        
        {/* SIDEBAR */}
        <div className={cn("h-full bg-white border-r border-slate-200 z-[100] flex flex-col relative shadow-2xl transition-all duration-300", sidebarOpen ? "w-[340px]" : "w-0 overflow-hidden")}>
             <div className="w-[340px] h-full flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-slate-900">
                             <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white">
                                <Sparkles className="w-4 h-4" />
                             </div>
                             <span className="font-bold tracking-tight">Discovery</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                            <PanelLeftClose className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex p-2 bg-slate-50 gap-1 border-b border-slate-100">
                    {[{ id: 'exploration', label: 'Activities', icon: Compass }, { id: 'culinary', label: 'Food', icon: Utensils }, { id: 'stay', label: 'Stays', icon: Bed }, { id: 'events', label: 'Events', icon: Music }].map((tab: any) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex-1 flex flex-col items-center gap-1 py-3 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wide", activeTab === tab.id ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:bg-white/50 hover:text-slate-600")}>
                            <tab.icon className="w-4 h-4" />{tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                    {isLoadingDiscovery ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <RefreshCcw className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-bold">Curating Suggestions...</span>
                      </div>
                    ) : discoveryItems.map((item: any, idx: number) => (
                        <SidebarDraggableItem key={idx} item={item} type={activeTab === 'stay' ? 'accommodation' : 'activity'} />
                    ))}
                </div>
             </div>
        </div>

        {/* MAIN AREA */}
        <div className="relative flex-1 h-full flex flex-col overflow-hidden">
            <div className="absolute top-4 left-4 z-50 flex gap-2">
                {!sidebarOpen && (
                    <button onClick={() => setSidebarOpen(true)} className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 text-slate-600 hover:text-blue-600">
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>
                )}
                <button onClick={onReset} className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-500 flex items-center gap-2 transition-all active:scale-95"><ChevronLeft className="w-4 h-4" /> Exit</button>
            </div>

            <div className="fixed top-8 right-8 z-[100] w-72 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-5 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Budget Auditor</h3>
                        <span className={cn("text-xs font-bold", totalCost > tripState.budget ? "text-red-500" : "text-slate-500")}>{Math.round((totalCost/tripState.budget)*100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div className={cn("h-full transition-all duration-700", totalCost > tripState.budget ? "bg-red-500" : "bg-emerald-500")} style={{ width: `${Math.min(100, (totalCost/tripState.budget)*100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Spent: ${totalCost.toLocaleString()}</span>
                        <span>Goal: ${tripState.budget.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div 
                className="w-full h-full bg-[#F8FAFC] canvas-bg"
                ref={canvasRef}
                onWheel={handleWheel}
                onMouseDown={(e) => { if((e.target as HTMLElement).classList.contains('canvas-bg') || e.target === canvasRef.current) setIsPanning(true); }}
                onMouseMove={(e) => { if(isPanning) setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY })); }}
                onMouseUp={() => setIsPanning(false)}
            >
                <div 
                    className="w-full h-full transition-transform duration-75 ease-out origin-center flex items-center justify-center"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        cursor: isPanning ? 'grabbing' : 'default'
                    }}
                >
                    <SortableContext 
                        items={itinerary.itinerary.map(d => d.id)} 
                        strategy={horizontalListSortingStrategy}
                    >
                        <div className="flex gap-12 p-24 w-max h-max">
                            {itinerary.itinerary.map((day) => (
                                <SortableDayCard
                                    key={day.id}
                                    dayPlan={day}
                                    onSelectActivity={setSelectedActivity}
                                    onSelectAccommodation={setSelectedAccommodation}
                                    onAutoSuggestAccommodation={(id: string) => getAccommodationSuggestion(day.theme, tripState.budget).then(h => setItinerary(p => p ? {...p, itinerary: p.itinerary.map(d => d.id===id ? {...d, accommodation:h} : d)} : null))}
                                    activeDragType={activeDragType}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </div>
            </div>
            
            <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-2">
                 <div className="bg-white/90 backdrop-blur p-2 rounded-2xl shadow-xl border border-slate-200/50 flex flex-col gap-2 items-center">
                    <button onClick={() => handleZoom(0.1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><ZoomIn className="w-5 h-5" /></button>
                    <button onClick={() => { setZoom(1); setPan({x:0, y:0}); }} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><Maximize className="w-4 h-4" /></button>
                    <button onClick={() => handleZoom(-0.1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><ZoomOut className="w-5 h-5" /></button>
                 </div>
            </div>
        </div>

        <ChatBot itineraryContext={JSON.stringify(itinerary)} />
      </div>

      {/* DETAIL MODALS */}
      <DetailModal isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)} title="Activity Details">
          {selectedActivity && (
            <div className="space-y-6">
               <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">{selectedActivity.title}</h4>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <MapPin className="w-4 h-4" /> {selectedActivity.location}
                  </div>
               </div>
               <p className="text-slate-600 leading-relaxed text-lg">{selectedActivity.description}</p>
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <div><span className="block text-[10px] font-bold text-slate-400 uppercase">Duration</span><span className="font-bold text-slate-700">{selectedActivity.durationMinutes}m</span></div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                    <div><span className="block text-[10px] font-bold text-slate-400 uppercase">Cost Estimate</span><span className="font-bold text-slate-700">${selectedActivity.cost_estimate} CAD</span></div>
                  </div>
               </div>
            </div>
          )}
      </DetailModal>

      <DetailModal isOpen={!!selectedAccommodation} onClose={() => setSelectedAccommodation(null)} title="Stay Details">
          {selectedAccommodation && (
            <div className="space-y-6">
                <div className="aspect-video w-full rounded-2xl bg-slate-100 overflow-hidden relative">
                   <img src={selectedAccommodation.imageGallery?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000'} alt={selectedAccommodation.hotelName} className="w-full h-full object-cover" />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="font-bold text-slate-800 text-sm">{selectedAccommodation.rating}</span>
                   </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">{selectedAccommodation.hotelName}</h4>
                  <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                    <MapPin className="w-4 h-4" /> {selectedAccommodation.address}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed">{selectedAccommodation.description}</p>
                <div className="flex flex-wrap gap-2">
                   {selectedAccommodation.amenities?.map((a: string) => (
                     <span key={a} className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500 uppercase tracking-tight">{a}</span>
                   ))}
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                   <a href={selectedAccommodation.bookingUrl} target="_blank" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-center shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                      <LinkIcon className="w-4 h-4" /> Book Now 
                   </a>
                   <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center min-w-[120px]">
                      <span className="block text-[10px] font-bold text-emerald-500 uppercase">Per Night</span>
                      <span className="text-xl font-black text-emerald-700">${selectedAccommodation.pricePerNight}</span>
                   </div>
                </div>
            </div>
          )}
      </DetailModal>

      <DragOverlay 
        dropAnimation={defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } })}
        className="z-[400]"
      >
        {activeId ? (
            <div style={{ 
                transform: (activeDragType === DRAG_TYPES.DAY || activeDragType === DRAG_TYPES.ACTIVITY) ? `scale(${zoom})` : 'scale(1)', 
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
                     <div className="w-[320px] bg-white rounded-3xl shadow-2xl border-4 border-blue-400/50 h-[300px] flex items-center justify-center">
                        <span className="font-black text-slate-200 text-6xl">D{activeDragItem.day}</span>
                     </div>
                )}
            </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Dashboard;
