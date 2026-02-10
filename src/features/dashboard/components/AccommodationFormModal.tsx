import React, { useState } from 'react';
import { X, Save, MapPin, DollarSign, Star, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Accommodation } from '@types';

interface AccommodationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (accommodation: Accommodation) => void;
}

export const AccommodationFormModal: React.FC<AccommodationFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Accommodation>>({
        hotelName: '',
        address: '',
        pricePerNight: 0,
        rating: 0,
        description: '',
        bookingUrl: '',
        mapLink: '',
        imageGallery: [''],
        amenities: []
    });

    if (!isOpen) return null;

    // -- Submission Handler --
    // Validates and saves the accommodation data.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation could go here
        onSave(formData as Accommodation);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'pricePerNight' || name === 'rating' ? Number(value) : value
        }));
    };

    const handleImageChange = (value: string) => {
        setFormData(prev => ({ ...prev, imageGallery: [value] }));
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        Fill Accommodation Details
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hotel Name</label>
                        <input
                            required
                            name="hotelName"
                            value={formData.hotelName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            placeholder="e.g. The Grand Hotel"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Price / Night</label>
                            <input
                                type="number"
                                name="pricePerNight"
                                value={formData.pricePerNight || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Star className="w-3 h-3" /> Rating (0-5)</label>
                            <input
                                type="number"
                                step="0.1"
                                max="5"
                                name="rating"
                                value={formData.rating || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="4.5"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</label>
                        <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="123 Example St, City"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image URL</label>
                        <input
                            name="imageGallery"
                            value={formData.imageGallery?.[0] || ''}
                            onChange={(e) => handleImageChange(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="Brief description about the stay..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Booking URL</label>
                            <input
                                name="bookingUrl"
                                value={formData.bookingUrl || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="https://booking.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Map Link</label>
                            <input
                                name="mapLink"
                                value={formData.mapLink || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Save Accommodation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
