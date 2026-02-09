import React from 'react';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { Activity } from '@types';

interface ActivityDetailContentProps {
    activity: Activity;
}

export const ActivityDetailContent: React.FC<ActivityDetailContentProps> = ({ activity }) => {
    return (
        <div className="space-y-6">
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
        </div>
    );
};
