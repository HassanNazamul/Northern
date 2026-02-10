import React, { useState } from 'react';
import { MapPin, Calendar, Compass, Sparkles, TrendingUp } from 'lucide-react';
import { TripVibe, TripState } from '@types';

interface LandingPageProps {
    onGenerate: (trip: TripState) => void;
    loading: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGenerate, loading }) => {
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [vibe, setVibe] = useState<TripVibe>(TripVibe.ADVENTURE);
    const [budget, setBudget] = useState(2000);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination || !startDate || !endDate) return;
        onGenerate({ destination, startDate, endDate, vibe, budget });
    };

    return (
        <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
            {/* Decorative Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />

            <div className="z-10 text-center max-w-2xl mb-12">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 mb-6 backdrop-blur-sm animate-pulse">
                    <Sparkles className="w-4 h-4 text-blue-300" />
                    <span className="text-xs font-medium uppercase tracking-widest text-blue-100">AI Powered Architect</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                    Your <span className="text-blue-400">Northern Path</span> Awaits.
                </h1>
                <p className="text-lg text-slate-300 leading-relaxed">
                    The ultimate Canadian travel experience, architected by AI.
                    From the peak of the Rockies to the tides of the Maritimes.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="z-10 w-full max-w-4xl bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Row 1: Destination and Dates */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Destination
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Banff, Vancouver"
                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Dates
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                required
                                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <input
                                type="date"
                                required
                                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Row 2: Vibe and Budget */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Compass className="w-3 h-3" /> Vibe
                        </label>
                        <select
                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value as TripVibe)}
                        >
                            {Object.values(TripVibe).map((v) => (
                                <option key={v} value={v} className="bg-slate-900">{v}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Budget (CAD)
                        </label>
                        <input
                            type="number"
                            placeholder="Total budget"
                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Building Your Journey...
                        </>
                    ) : (
                        <>
                            Generate Itinerary
                            <Sparkles className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-12 text-slate-400 text-sm animate-bounce opacity-50">
                Scroll down to explore featured Canadian paths
            </div>
        </div>
    );
};

export default LandingPage;
