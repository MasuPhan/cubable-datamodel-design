
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TableCard } from "@/components/TableCard";
import { Relationship } from "@/components/Relationship";
import { FieldTypePalette } from "@/components/FieldTypePalette";
import { cn } from "@/lib/utils";
import { useModelContext } from "@/contexts/ModelContext";
import { ChevronRight, ChevronLeft, MinusCircle, PlusCircle, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ModelDesigner = () => {
  const { tables, relationships, updateTablePosition, addFieldToTable } = useModelContext();
  const [isDraggingField, setIsDraggingField] = useState(false);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Zoom in with Ctrl+Plus or Ctrl+Equals
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setScale(prevScale => Math.min(prevScale * 1.1, 2));
      }
      // Zoom out with Ctrl+Minus
      else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setScale(prevScale => Math.max(prevScale * 0.9, 0.5));
      }
      // Reset zoom with Ctrl+0
      else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleTableDragEnd = (id, newPosition) => {
    updateTablePosition(id, newPosition);
  };

  const handleWheel = (e) => {
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
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || e.button === 2 || e.ctrlKey) {
      e.preventDefault();
      setIsPanning(true);
      setStartPanPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPosition({
        x: e.clientX - startPanPos.x,
        y: e.clientY - startPanPos.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData("fieldType");
    if (!fieldType) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - position.x / scale;
    const y = (e.clientY - rect.top) / scale - position.y / scale;
    
    // Find the table (if any) under the drop position
    const droppedOnTable = tables.find(table => {
      const tableLeft = table.position.x;
      const tableRight = table.position.x + 300;
      const tableTop = table.position.y;
      const tableBottom = table.position.y + 40 + table.fields.length * 40; // Approximate height
      
      return x >= tableLeft && x <= tableRight && y >= tableTop && y <= tableBottom;
    });
    
    if (droppedOnTable) {
      // Add field to the table
      addFieldToTable(droppedOnTable.id, {
        id: `field-${Date.now()}`,
        name: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
        type: fieldType,
        required: false,
        unique: false,
      });
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale * 1.1, 2));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale * 0.9, 0.5));
  };
  
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50">
      <div className="absolute top-4 left-4 z-30 flex flex-col space-y-2">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={zoomIn} 
            title="Zoom In"
            className="rounded-none rounded-t-lg"
          >
            <PlusCircle size={18} />
          </Button>
          <div className="px-2 py-1 text-xs text-center border-t border-b border-gray-200">
            {Math.round(scale * 100)}%
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={zoomOut} 
            title="Zoom Out"
            className="rounded-none rounded-b-lg"
          >
            <MinusCircle size={18} />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={resetView} 
          title="Reset View"
          className="bg-white"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7.5 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M7.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleFullscreen} 
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className="bg-white"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </Button>
      </div>
      
      <div className="absolute top-4 right-4 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
          className="bg-white border border-gray-200 shadow-sm"
        >
          {isPaletteCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          {isPaletteCollapsed ? "" : " Hide Fields"}
        </Button>
      </div>
      
      <div
        className={cn(
          "absolute right-0 top-16 z-20 transition-transform duration-300 ease-in-out",
          isPaletteCollapsed ? "translate-x-[calc(100%-2rem)]" : "translate-x-0"
        )}
      >
        <div className="flex items-start">
          <button 
            className="bg-indigo-600 text-white p-2 rounded-l-lg -ml-8 mt-8"
            onClick={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
          >
            {isPaletteCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <FieldTypePalette setIsDraggingField={setIsDraggingField} />
        </div>
      </div>
      
      <div 
        className="w-full h-full relative overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div
          className={cn(
            "absolute inset-0 transition-opacity", 
            isDraggingField && "bg-blue-100 bg-opacity-30"
          )}
        >
          <div 
            className="absolute w-full h-full"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: "0 0"
            }}
          >
            <div className="absolute inset-0 grid grid-cols-[repeat(50,20px)] grid-rows-[repeat(50,20px)] opacity-20">
              {Array.from({ length: 50 }).map((_, row) => (
                Array.from({ length: 50 }).map((_, col) => (
                  <div 
                    key={`${row}-${col}`}
                    className="border-[0.5px] border-slate-300"
                  />
                ))
              ))}
            </div>
            
            {relationships.map((rel) => (
              <Relationship key={rel.id} relationship={rel} tables={tables} />
            ))}
            
            {tables.map((table) => (
              <TableCard 
                key={table.id}
                table={table}
                onDragEnd={(_, info) => {
                  handleTableDragEnd(
                    table.id, 
                    {
                      x: table.position.x + info.offset.x / scale,
                      y: table.position.y + info.offset.y / scale
                    }
                  );
                }}
                scale={scale}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        Tip: Hold mouse wheel or Ctrl+drag to pan. Scroll to zoom.
      </div>
    </div>
  );
};
