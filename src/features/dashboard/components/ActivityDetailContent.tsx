import React from 'react';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { Activity } from '@types';

interface ActivityDetailContentProps {
    activity: Activity;
    onRemove: () => void;
}

export const ActivityDetailContent: React.FC<ActivityDetailContentProps> = ({ activity, onRemove }) => {
    // Generate a Google Maps link for the location
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`;

    return (
        <div className="space-y-6">
            {activity.imageUrl && (
                <div className="aspect-video w-full rounded-2xl bg-slate-100 overflow-hidden relative">
                    <img
                        src={activity.imageUrl}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900 leading-tight">{activity.title}</h4>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <MapPin className="w-4 h-4" /> {activity.location}
                </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-lg">{activity.description}</p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Duration</span>
                        <span className="font-bold text-slate-700">{activity.durationMinutes}m</span>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Cost Estimate</span>
                        <span className="font-bold text-slate-700">${activity.cost_estimate} CAD</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all block text-center"
                >
                    <MapPin className="w-4 h-4" /> View on Map
                </a>

                <button
                    onClick={onRemove}
                    className="w-full border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                    Remove Activity
                </button>
            </div>
        </div>
    );
};
