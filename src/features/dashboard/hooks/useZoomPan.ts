import React, { useState, useRef } from 'react';

export const useZoomPan = () => {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleZoom = (delta: number) => setZoom(prev => Math.max(0.4, Math.min(1.5, prev + delta)));

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
        } else {
            setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
        }
    };

    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    return {
        zoom,
        pan,
        isPanning,
        canvasRef,
        setIsPanning,
        setPan,
        handleZoom,
        handleWheel,
        resetView,
    };
};
