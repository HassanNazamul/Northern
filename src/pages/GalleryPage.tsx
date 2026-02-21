import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../state';
import { fetchItinerary, fetchSavedTrips } from '../state/slices/dashboardSlice';
import { GallerySidebar } from '../features/dashboard/components/GallerySidebar';
import { GalleryHeader } from '../features/dashboard/components/GalleryHeader';
import { MapPin, Calendar, DollarSign, ArrowRight, Heart, Check, X } from 'lucide-react';
import { cn } from '@utils';
import { motion } from 'framer-motion';
import { getTripInvitations, respondToInvitation } from '../services/api';

const GalleryPage: React.FC = () => {
    const email = useSelector((state: RootState) => state.user.email);
    const { savedTrips, loading } = useSelector((state: RootState) => state.dashboard);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [invitationsLoading, setInvitationsLoading] = useState(false);
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

    useEffect(() => {
        if (email) {
            const fetchInvitations = async () => {
                setInvitationsLoading(true);
                const data = await getTripInvitations(email);
                setInvitations(data);
                setInvitationsLoading(false);
            };
            fetchInvitations();
        }
    }, [email]);

    const handleResponse = async (tripId: string, action: 'ACCEPT' | 'DECLINE') => {
        if (!email) return;

        const success = await respondToInvitation(tripId, email, action);
        if (success) {
            // Refresh invitations
            const data = await getTripInvitations(email);
            setInvitations(data);

            // If accepted, also refresh saved trips to show the new collaboration trip
            if (action === 'ACCEPT') {
                dispatch(fetchSavedTrips());
            }
        }
    };

    const handleTripClick = async (tripId: string) => {
        // Dispatch load action
        await dispatch(fetchItinerary(tripId));
        navigate('/dashboard');
    };

    // -- Filtering & Sorting --
    const { personalTrips, collaborationTrips } = useMemo(() => {
        let result = [...savedTrips];

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'alphabetical') {
                return a.trip_title.localeCompare(b.trip_title);
            } else if (sortBy === 'destination') {
                return (a.trip_title || '').localeCompare(b.trip_title || '');
            }
            return 0; // Recent
        });

        // Split into Personal and Collaboration
        const pTrips = result.filter(trip =>
            !trip.collaborators?.some(c => c.email === email && c.status === 'ACCEPTED')
        );
        const cTrips = result.filter(trip =>
            trip.collaborators?.some(c => c.email === email && c.status === 'ACCEPTED')
        );

        return { personalTrips: pTrips, collaborationTrips: cTrips };
    }, [savedTrips, sortBy, email]);

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
                        {/* Loading State */}
                        {(loading || invitationsLoading) && savedTrips.length === 0 && invitations.length === 0 && (
                            <div className="flex items-center justify-center p-12 text-slate-400">
                                Loading your adventures...
                            </div>
                        )}

                        {/* Pending Invitations Section */}
                        {invitations.length > 0 && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 fill-purple-600" />
                                    </div>
                                    Pending Invitations
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {invitations.map((invite) => (
                                        <div
                                            key={invite.id}
                                            className="group relative bg-white dark:bg-surface-a0 rounded-2xl border-2 border-purple-200 dark:border-purple-500/20 overflow-hidden hover:shadow-xl transition-all duration-300"
                                        >
                                            {/* -- transcluent blurry overlay -- */}
                                            <div className="absolute inset-0 bg-white/0 dark:bg-black/10 backdrop-blur-[6px] flex flex-col items-center justify-center z-20">
                                                <div className="flex gap-6">
                                                    <button
                                                        onClick={() => handleResponse(invite.id, 'ACCEPT')}
                                                        className="flex flex-col items-center gap-2"
                                                    >
                                                        <div className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transform hover:scale-110 transition-all">
                                                            <Check className="w-6 h-6" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Accept</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleResponse(invite.id, 'DECLINE')}
                                                        className="flex flex-col items-center gap-2"
                                                    >
                                                        <div className="p-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg transform hover:scale-110 transition-all">
                                                            <X className="w-6 h-6" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Decline</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Image / Cover */}
                                            <div className="h-48 bg-purple-50 dark:bg-surface-a20 relative overflow-hidden">
                                                <img
                                                    src={invite.image_url || "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9"}
                                                    alt={invite.trip_title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-3 right-3">
                                                    <div className="p-2 rounded-full bg-purple-600/80 backdrop-blur-md text-white">
                                                        <Heart className="w-4 h-4 fill-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 space-y-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-500 transition-colors">
                                                        {invite.trip_title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3" /> {invite.location || 'New York, NY'}
                                                    </p>
                                                </div>

                                                {/* Meta Stats */}
                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md text-purple-700 dark:text-purple-300">
                                                        <Calendar className="w-3 h-3" />
                                                        {invite.total_days} Days
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-a10 px-2 py-1 rounded-md">
                                                        <DollarSign className="w-3 h-3" />
                                                        {invite.currency || 'USD'}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-100 dark:border-surface-a10 flex items-center justify-between">
                                                    <span className="text-xs text-slate-400">Invite from {invite.last_edited ? '3d ago' : 'Recently'}</span>
                                                    <button className="flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-400 hover:translate-x-1 transition-transform">
                                                        Accept Invite <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Your Trips Section (Personal) */}
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            Your Voyages
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {/* Empty State */}
                            {!loading && personalTrips.length === 0 && (
                                <div className="col-span-full text-center p-12 text-slate-500 bg-white/50 dark:bg-surface-a5 rounded-2xl border border-dashed border-slate-300 dark:border-surface-a10">
                                    No personal voyages found. Why not create one?
                                </div>
                            )}

                            {/* Trip Cards */}
                            {personalTrips.map((trip) => (
                                <div
                                    key={trip.id}
                                    onClick={() => handleTripClick(trip.id)}
                                    className="group relative bg-white dark:bg-surface-a0 rounded-2xl border border-slate-200 dark:border-surface-a10 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                >
                                    {/* Image / Cover */}
                                    <div className="h-48 bg-slate-200 dark:bg-surface-a20 relative overflow-hidden">
                                        <img
                                            src={trip.image_url || (trip.id.includes('montreal')
                                                ? "https://images.unsplash.com/photo-1519178555425-500d4861cd75?q=80&w=800&auto=format&fit=crop"
                                                : "https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=800&auto=format&fit=crop"
                                            )}
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
                                                <MapPin className="w-3 h-3" /> {trip.location || (trip.id.includes('montreal') ? 'Montreal, Canada' : 'Toronto, Canada')}
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
                                            <span className="text-xs text-slate-400">{trip.last_edited || 'Last edited 2d ago'}</span>
                                            <span className="flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-500 group-hover:translate-x-1 transition-transform">
                                                Open <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Collaboration Section */}
                        {collaborationTrips.length > 0 && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-300 mb-6 flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    Collaboration Section
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {collaborationTrips.map((trip) => (
                                        <div
                                            key={trip.id}
                                            onClick={() => handleTripClick(trip.id)}
                                            className="group relative bg-white dark:bg-surface-a0 rounded-2xl border border-purple-200 dark:border-purple-500/20 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                        >
                                            {/* Image / Cover */}
                                            <div className="h-48 bg-purple-50 dark:bg-surface-a20 relative overflow-hidden">
                                                <img
                                                    src={trip.image_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"}
                                                    alt={trip.trip_title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-3 right-3">
                                                    <div className="px-2 py-1 rounded-md bg-purple-600/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                                                        Collaborator
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 space-y-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-500 transition-colors">
                                                        {trip.trip_title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3" /> {trip.location || 'Discovering...'}
                                                    </p>
                                                </div>

                                                {/* Meta Stats */}
                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md text-purple-700 dark:text-purple-300">
                                                        <Calendar className="w-3 h-3" />
                                                        {trip.total_days} Days
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-a10 px-2 py-1 rounded-md">
                                                        <DollarSign className="w-3 h-3" />
                                                        {trip.currency}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-100 dark:border-surface-a10 flex items-center justify-between">
                                                    <span className="text-xs text-slate-400">Shared with you</span>
                                                    <span className="flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-500 group-hover:translate-x-1 transition-transform">
                                                        Open <ArrowRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GalleryPage;
