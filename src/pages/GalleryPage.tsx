import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../state';
import { fetchItinerary, fetchSavedTrips } from '../state/slices/dashboardSlice';
import { GallerySidebar } from '../features/dashboard/components/GallerySidebar';
import { GalleryHeader } from '../features/dashboard/components/GalleryHeader';
import { MapPin, Calendar, DollarSign, ArrowRight, Heart } from 'lucide-react';
import { cn } from '@utils';
import { motion } from 'framer-motion';

const GalleryPage: React.FC = () => {
    const email = useSelector((state: RootState) => state.user.email);
    const { savedTrips, loading } = useSelector((state: RootState) => state.dashboard);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // -- UI State --
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'destination'>('recent');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/login');
        } else {
            dispatch(fetchSavedTrips());
        }
    }, [email, navigate, dispatch]);

    const handleTripClick = async (tripId: string) => {
        // Dispatch load action
        await dispatch(fetchItinerary(tripId));
        navigate('/dashboard');
    };

    // -- Filtering & Sorting --
    const filteredTrips = useMemo(() => {
        let result = [...savedTrips];

        // 1. Filter by Category (Mock logic since trips might not have category field on root)
        if (activeCategory !== 'All') {
            // For now, no actual category field on Trip, so we skip or infer
        }

        // 2. Filter Favorites
        if (showFavoritesOnly) {
            // Mock favorite logic
        }

        // 3. Sort
        result.sort((a, b) => {
            if (sortBy === 'alphabetical') {
                return a.trip_title.localeCompare(b.trip_title);
            } else if (sortBy === 'destination') {
                return (a.trip_title || '').localeCompare(b.trip_title || '');
            }
            return 0; // Recent (default order from JSON)
        });

        return result;
    }, [savedTrips, activeCategory, sortBy, showFavoritesOnly]);

    if (!email) return null;

    return (
        <div className="flex h-screen w-full bg-[#FCFCFC] dark:bg-surface-a0 overflow-hidden font-sans text-slate-900 dark:text-slate-200">
            {/* -- Sidebar -- */}
            <div className={cn(
                "flex-shrink-0 h-full transition-all duration-500 ease-in-out z-40",
                sidebarOpen ? "w-[340px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 overflow-hidden"
            )}>
                <GallerySidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    showFavoritesOnly={showFavoritesOnly}
                    onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    totalTrips={savedTrips.length}
                />
            </div>

            {/* -- Main Content -- */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FCFCFC] dark:bg-surface-a0">

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
                        className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-blue-600 rounded-full blur-[120px] mix-blend-multiply"
                    />

                    {/* Soft Purple Blob - Bottom Right */}
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
                        className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-purple-600 rounded-full blur-[100px] mix-blend-multiply"
                    />
                </div>

                <GalleryHeader
                    sidebarOpen={sidebarOpen}
                    onSidebarToggle={() => setSidebarOpen(true)}
                    onCreateTrip={() => navigate('/')}
                />

                <main className="flex-1 overflow-y-auto p-8 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Loading State */}
                            {loading && (
                                <div className="col-span-full flex items-center justify-center p-12 text-slate-400">
                                    Loading your adventures...
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && filteredTrips.length === 0 && (
                                <div className="col-span-full text-center p-12 text-slate-500">
                                    No trips found. Create a new one!
                                </div>
                            )}

                            {/* Trip Cards */}
                            {filteredTrips.map((trip) => (
                                <div
                                    key={trip.id}
                                    onClick={() => handleTripClick(trip.id)}
                                    className="group relative bg-white dark:bg-surface-a0 rounded-2xl border border-slate-200 dark:border-surface-a10 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                >
                                    {/* Image / Cover */}
                                    <div className="h-48 bg-slate-200 dark:bg-surface-a20 relative overflow-hidden">
                                        {/* Placeholder Pattern or mock image based on ID */}
                                        <img
                                            src={trip.id.includes('montreal')
                                                ? "https://images.unsplash.com/photo-1519178555425-500d4861cd75?q=80&w=800&auto=format&fit=crop"
                                                : "https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=800&auto=format&fit=crop"
                                            }
                                            alt={trip.trip_title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <button className="p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-colors">
                                                <Heart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-500 transition-colors">
                                                {trip.trip_title}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" /> {trip.id.includes('montreal') ? 'Montreal, Canada' : 'Toronto, Canada'}
                                            </p>
                                        </div>

                                        {/* Meta Stats */}
                                        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-a10 px-2 py-1 rounded-md">
                                                <Calendar className="w-3 h-3" />
                                                {trip.total_days} Days
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-a10 px-2 py-1 rounded-md">
                                                <DollarSign className="w-3 h-3" />
                                                {trip.currency}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-surface-a10 flex items-center justify-between">
                                            <span className="text-xs text-slate-400">Last edited 2d ago</span>
                                            <span className="flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-500 group-hover:translate-x-1 transition-transform">
                                                Open <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GalleryPage;
