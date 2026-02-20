import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Trip',
    message = 'Are you sure you want to delete this trip? This action cannot be undone and all itinerary data will be permanently removed.',
    isDeleting = false
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-surface-a10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    <div className="p-6 border-b border-slate-100 dark:border-surface-a20 flex justify-between items-center bg-slate-50/50 dark:bg-surface-a0/50">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-surface-a20 rounded-full text-slate-400 transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="p-6 bg-slate-50/50 dark:bg-surface-a0/50 border-t border-slate-100 dark:border-surface-a20 flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-surface-a20 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Trip
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
