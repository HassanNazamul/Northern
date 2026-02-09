import React from 'react';
import { MapPin, Star, Link as LinkIcon } from 'lucide-react';
import { Accommodation } from '@types';

interface AccommodationDetailContentProps {
    accommodation: Accommodation;
}

export const AccommodationDetailContent: React.FC<AccommodationDetailContentProps> = ({ accommodation }) => {
    return (
        <div className="space-y-6">
            <div className="aspect-video w-full rounded-2xl bg-slate-100 overflow-hidden relative">
                <img
                    src={accommodation.imageGallery?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000'}
                    alt={accommodation.hotelName}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="font-bold text-slate-800 text-sm">{accommodation.rating}</span>
                </div>
            </div>
            <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900 leading-tight">{accommodation.hotelName}</h4>
                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                    <MapPin className="w-4 h-4" /> {accommodation.address}
                </div>
            </div>
            <p className="text-slate-600 leading-relaxed">{accommodation.description}</p>
            <div className="flex flex-wrap gap-2">
                {accommodation.amenities?.map((a: string) => (
                    <span key={a} className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500 uppercase tracking-tight">
                        {a}
                    </span>
                ))}
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <a
                    href={accommodation.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-center shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <LinkIcon className="w-4 h-4" /> Book Now
                </a>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center min-w-[120px]">
                    <span className="block text-[10px] font-bold text-emerald-500 uppercase">Per Night</span>
                    <span className="text-xl font-black text-emerald-700">${accommodation.pricePerNight}</span>
                </div>
            </div>
        </div>
    );
};
