
import { useState, useCallback, useEffect } from "react";

export const useCanvasControls = (initialScale = 1) => {
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prevScale => Math.min(Math.max(prevScale * delta, 0.5), 2));
    } else {
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2 || e.ctrlKey) {
      e.preventDefault();
      setIsPanning(true);
      setStartPanPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPosition({
        x: e.clientX - startPanPos.x,
        y: e.clientY - startPanPos.y
      });
    }
  }, [isPanning, startPanPos]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const zoomIn = useCallback(() => {
    setScale(prevScale => Math.min(prevScale * 1.1, 2));
  }, []);
  
  const zoomOut = useCallback(() => {
    setScale(prevScale => Math.max(prevScale * 0.9, 0.5));
  }, []);
  
  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Zoom in with Ctrl+Plus or Ctrl+Equals
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        zoomIn();
      }
      // Zoom out with Ctrl+Minus
      else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
      // Reset zoom with Ctrl+0
      else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        resetView();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomIn, zoomOut, resetView]);

  return {
    scale,
    position,
    setPosition, // Expose setPosition for external control
    isPanning,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetView
  };
};
