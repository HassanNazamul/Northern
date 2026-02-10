import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ZoomControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut, onReset, className, style }) => {
    return (
        <div className={className || "absolute bottom-6 left-6 z-[100] flex flex-col gap-2"} style={style}>
            <div className="bg-white/90 backdrop-blur p-2 rounded-2xl shadow-xl border border-slate-200/50 flex flex-col gap-2 items-center">
                <button onClick={onZoomIn} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                    <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={onReset} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                    <Maximize className="w-4 h-4" />
                </button>
                <button onClick={onZoomOut} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                    <ZoomOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
