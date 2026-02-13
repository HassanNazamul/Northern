import React, { useState } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@state';
import { restoreFromTrash, emptyTrash, setTrashBinOpen } from '@state/slices/dashboardSlice';

export const TrashBin: React.FC = () => {
    const dispatch = useAppDispatch();
    const trashBin = useAppSelector(state => state.dashboard.trashBin);
    const isOpen = useAppSelector(state => state.dashboard.trashBinOpen);

    const handleRestore = (id: string) => {
        dispatch(restoreFromTrash(id));
    };

    const handleEmptyTrash = () => {
        if (window.confirm("Are you sure you want to permanently delete these items?")) {
            dispatch(emptyTrash());
        }
    };

    if (trashBin.length === 0 && !isOpen) return null;

    return (
        <div className="fixed bottom-6 right-24 z-50"> {/* Positioned next to ChatBot generally */}
            {isOpen ? (
                <div className="bg-white w-80 max-h-[500px] rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="bg-rose-500 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            <h3 className="font-semibold">Trash Bin ({trashBin.length})</h3>
                        </div>
                        <button onClick={() => dispatch(setTrashBinOpen(false))} className="text-white/80 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                        {trashBin.length === 0 ? (
                            <div className="text-center text-slate-400 py-8 flex flex-col items-center gap-2">
                                <Trash2 className="w-8 h-8 opacity-20" />
                                <p className="text-sm">Trash is empty</p>
                            </div>
                        ) : (
                            trashBin.map((item) => (
                                <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-start gap-3 group hover:border-blue-200 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${item.type === 'activity' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {item.type}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(item.deletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 mt-1 truncate" title={item.description}>
                                            {item.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRestore(item.id)}
                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
                                        title="Restore"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {trashBin.length > 0 && (
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={handleEmptyTrash}
                                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-dashed border-rose-200 transition-colors"
                            >
                                <AlertTriangle className="w-3 h-3" />
                                Empty Trash
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                trashBin.length > 0 && (
                    <button
                        onClick={() => dispatch(setTrashBinOpen(true))}
                        className="bg-white text-slate-600 p-4 rounded-full shadow-lg border border-slate-200 hover:scale-105 transition-transform flex items-center justify-center relative group"
                    >
                        <Trash2 className="w-6 h-6 group-hover:text-rose-500 transition-colors" />
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                            {trashBin.length}
                        </span>
                    </button>
                )
            )}
        </div>
    );
};
