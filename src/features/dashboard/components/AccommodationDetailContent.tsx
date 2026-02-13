import React from 'react';
import { MapPin, Star, Link as LinkIcon } from 'lucide-react';
import { Accommodation } from '@types';

interface AccommodationDetailContentProps {
    accommodation: Accommodation;
    onRemove: () => void;
}

export const AccommodationDetailContent: React.FC<AccommodationDetailContentProps> = ({ accommodation, onRemove }) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [isHovering, setIsHovering] = React.useState(false);

    // Use provided gallery or fallback to a default image
    const images = accommodation.imageGallery?.length ? accommodation.imageGallery : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000'];

    console.log('AccommodationDetailContent:', {
        name: accommodation.hotelName,
        galleryLength: accommodation.imageGallery?.length,
        images
    });

    // -- Auto-Play Carousel --
    React.useEffect(() => {
        if (images.length <= 1 || isHovering) return;

        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000); // 3 seconds per slide

        return () => clearInterval(timer);
    }, [images.length, isHovering]);

    // -- Carousel Navigation --
    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="space-y-6">
            <div
                className="aspect-video w-full rounded-2xl bg-slate-100 overflow-hidden relative group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`${accommodation.hotelName} ${idx + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    />
                ))}

                {/* Carousel Controls */}
                {images.length > 1 && (
                    <div className="absolute inset-0 pointer-events-none">
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur hover:bg-white/50 p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20 pointer-events-auto"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur hover:bg-white/50 p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-20 pointer-events-auto"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-auto">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(idx);
                                    }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="font-bold text-slate-800 text-sm">{accommodation.rating}</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-start">
                    <h4 className="text-2xl font-black text-slate-900 leading-tight">{accommodation.hotelName}</h4>
                    <div className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl text-center">
                        <span className="text-sm font-black text-emerald-700">${accommodation.pricePerNight}</span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase ml-1">/ Night</span>
                    </div>
                </div>
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

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <div className="flex gap-3">
                    <a
                        href={accommodation.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-center shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <LinkIcon className="w-4 h-4" /> Book Now
                    </a>
                    {accommodation.mapLink && (
                        <a
                            href={accommodation.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 rounded-xl flex items-center justify-center transition-all"
                            title="View on Map"
                        >
                            <MapPin className="w-5 h-5" />
                        </a>
                    )}
                </div>

                <button
                    onClick={onRemove}
                    className="w-full border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                    Remove Accommodation
                </button>
            </div>
        </div>
    );
};
