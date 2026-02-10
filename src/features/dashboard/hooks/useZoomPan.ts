import React, { useState, useRef } from 'react';

export const useZoomPan = () => {
    const [zoom, setZoom] = useState(0.85); // Default: slightly zoomed out
    const [pan, setPan] = useState({ x: 50, y: 50 });
    const [isPanning, setIsPanning] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const clampPan = (newPan: { x: number; y: number }, currentZoom: number) => {
        if (!canvasRef.current || !contentRef.current) return newPan;

        const viewport = canvasRef.current.getBoundingClientRect();
        const content = contentRef.current.getBoundingClientRect();

        // We use the unscaled content dimensions for calculation relative to zoom
        // But getBoundingClientRect returns scaled dimensions if transform applied? 
        // No, contentRef is inside the transform, so its clientWidth/Height is unscaled.
        // Wait, contentRef is inside, so it's NOT scaled by the parent's transform?
        // Actually, logic is safer using offsetWidth/Height.

        const contentWidth = contentRef.current.offsetWidth * currentZoom;
        const contentHeight = contentRef.current.offsetHeight * currentZoom;
        const padding = 100; // Keep at least 100px visible

        // Max X: Don't pull content too far right (content left edge <= padding)
        const maxX = padding;

        // Min X: Don't pull content too far left (content right edge >= viewport width - padding)
        // pan.x + contentWidth >= viewport.width - padding
        // pan.x >= viewport.width - padding - contentWidth
        let minX = viewport.width - padding - contentWidth;

        // If content is smaller than viewport, keep it pinned left or ensure visibility
        if (contentWidth < viewport.width) {
            minX = padding; // Or 50
        }

        // Same for Y
        const maxY = padding;
        let minY = viewport.height - padding - contentHeight;

        if (contentHeight < viewport.height) {
            minY = padding;
        }

        return {
            x: Math.min(maxX, Math.max(minX, newPan.x)),
            y: Math.min(maxY, Math.max(minY, newPan.y))
        };
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
