import React, { useState, useRef } from 'react';

export const useZoomPan = () => {
    const [zoom, setZoom] = useState(0.85); // Default: slightly zoomed out
    const [pan, setPan] = useState({ x: 50, y: 50 });
    const [isPanning, setIsPanning] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const clampPan = (newPan: { x: number; y: number }, currentZoom: number) => {
        return newPan;
    };

    const handleZoom = (delta: number) => {
        const newZoom = Math.max(0.4, Math.min(1.5, zoom + delta));
        setZoom(newZoom);
        // Re-clamp pan with new zoom
        setPan(prev => clampPan(prev, newZoom));
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
        } else {
            setPan(prev => clampPan({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }, zoom));
        }
    };

    // New handler for drag panning
    const handlePan = (dx: number, dy: number) => {
        setPan(prev => clampPan({ x: prev.x + dx, y: prev.y + dy }, zoom));
    };

    const resetView = () => {
        setZoom(0.85);
        setPan({ x: 50, y: 50 });
    };

    return {
        zoom,
        pan,
        isPanning,
        canvasRef,
        contentRef,
        setIsPanning,
        setPan,
        handleZoom,
        handleWheel,
        handlePan,
        resetView,
    };
};
