import React, { useState } from 'react';
import { X, Save, MapPin, DollarSign, Clock, AlignLeft, Image as ImageIcon } from 'lucide-react';
import { Activity } from '@types';

interface ActivityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (activity: Activity) => void;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({ isOpen, onClose, onSave }) => {
    // -- Form State --
    // Tracks temporary user input before saving to the global state.
    const [formData, setFormData] = useState<Partial<Activity>>({
        title: '',
        location: '',
        cost_estimate: 0,
        durationMinutes: 60,
        description: '',
        category: 'Sightseeing',
        imageUrl: '',
        time: '09:00 AM' // Default time, will be recalculated anyway
    });

    if (!isOpen) return null;

    // -- Submission Handler --
    // Creates values and passes them back to the parent component.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newActivity: Activity = {
            id: crypto.randomUUID(),
            title: formData.title || 'New Activity',
            location: formData.location || '',
            cost_estimate: Number(formData.cost_estimate) || 0,
            durationMinutes: Number(formData.durationMinutes) || 60,
            description: formData.description || '',
            category: formData.category as any || 'Sightseeing',
            imageUrl: formData.imageUrl,
            time: formData.time || '09:00 AM',
            // Default coordinates if not provided/geocoded
            coordinates: { lat: 0, lng: 0 }
        };

        onSave(newActivity);
        onClose();
        // Reset form? Maybe keep for next time or reset. 
        setFormData({
            title: '', location: '', cost_estimate: 0, durationMinutes: 60, description: '', category: 'Sightseeing', imageUrl: '', time: '09:00 AM'
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'cost_estimate' || name === 'durationMinutes' ? Number(value) : value
        }));
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        Add Custom Activity
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Activity Title</label>
                        <input
                            required
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            placeholder="e.g. Visit CN Tower"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Cost Estimate</label>
                            <input
                                type="number"
                                name="cost_estimate"
                                value={formData.cost_estimate || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration (min)</label>
                            <input
                                type="number"
                                step="15"
                                name="durationMinutes"
                                value={formData.durationMinutes || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="60"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                        >
                            <option value="Sightseeing">Sightseeing</option>
                            <option value="Food">Food</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Relaxation">Relaxation</option>
                            <option value="Transport">Transport</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Address or Place Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image URL (Optional)</label>
                        <input
                            name="imageUrl"
                            value={formData.imageUrl || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><AlignLeft className="w-3 h-3" /> Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="Details about the activity..."
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Add Activity
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
