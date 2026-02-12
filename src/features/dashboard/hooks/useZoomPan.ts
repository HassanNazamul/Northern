import React, { useState, useRef, useEffect } from 'react';

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

    // Keep track of latest state for event listener
    const stateRef = useRef({ zoom, pan });
    // Update ref on every render
    stateRef.current = { zoom, pan };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const onWheel = (e: WheelEvent) => {
            const target = e.target as HTMLElement;
            const scrollableParent = target.closest('.cancel-pan-zoom') as HTMLElement;

            if (scrollableParent) {
                // Horizontal Scroll Passthrough
                // If the user is scrolling horizontally (Shift+Wheel or gesture), let it pass to canvas pan
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    // Prevent default to stop browser back/forward, but execute PAN logic below
                    e.preventDefault();
                }
                // Vertical Scroll Logic
                else {
                    const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
                    const isScrollingDown = e.deltaY > 0;
                    const isScrollingUp = e.deltaY < 0;

                    // Check if scrollable
                    const canScrollUp = scrollTop > 0;
                    const canScrollDown = scrollTop + clientHeight < scrollHeight - 1; // -1 for rounding tolerance

                    // If we can scroll in the requested direction, let native scroll happen
                    if ((isScrollingDown && canScrollDown) || (isScrollingUp && canScrollUp)) {
                        return;
                    }

                    // Boundary reached: blocked -> Chain to canvas zoom/pan
                    // Fallthrough to preventDefault + ZoomPan logic
                }
            }

            // Prevent default browser zoom/scroll behavior
            e.preventDefault();

            if (e.ctrlKey) {
                // Zoom logic
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                // Use functional update to ensure we rely on latest state if needed, 
                // but here we used stateRef for reads. 
                // Let's use the ref values to calculate next state.
                const currentZoom = stateRef.current.zoom;
                const newZoom = Math.max(0.4, Math.min(1.5, currentZoom + delta));

                setZoom(newZoom);
                setPan(prev => clampPan(prev, newZoom));
            } else {
                // Pan logic
                const currentZoom = stateRef.current.zoom;
                setPan(prev => {
                    const newPan = { x: prev.x - e.deltaX, y: prev.y - e.deltaY };
                    return clampPan(newPan, currentZoom);
                });
            }
        };

        // Add non-passive listener to allow preventDefault
        canvas.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', onWheel);
        };
    }, []);

    // Original handleWheel removed as we use native listener now
    const handleWheel = (e: React.WheelEvent) => {
        // No-op or log warning if used
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
