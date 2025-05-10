
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TableCard } from "@/components/TableCard";
import { Relationship } from "@/components/Relationship";
import { FieldTypePalette } from "@/components/FieldTypePalette";
import { CanvasArea } from "@/components/CanvasArea";
import { CanvasNote } from "@/components/CanvasNote";
import { cn } from "@/lib/utils";
import { useModelContext } from "@/contexts/ModelContext";
import { ChevronRight, ChevronLeft, MinusCircle, PlusCircle, StickyNote, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const ModelDesigner = ({ isPaletteVisible, isGridVisible, isFullscreen }) => {
  const { toast } = useToast();
  const { 
    tables, 
    relationships, 
    updateTablePosition, 
    addFieldToTable, 
    areas, 
    notes,
    updateArea,
    removeArea,
    updateAreaPosition,
    updateNote,
    removeNote,
    updateNotePosition,
    addNote,
    addArea,
    moveLayerUp,
    moveLayerDown
  } = useModelContext();
  
  const [isDraggingField, setIsDraggingField] = useState(false);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  
  // Enlarged canvas size (doubled from the original 600vh to 1200vh)
  const canvasSize = {
    width: "1200vw",
    height: "1200vh"
  };
  
  useEffect(() => {
    setIsPaletteCollapsed(!isPaletteVisible);
  }, [isPaletteVisible]);

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
      // Add keyboard shortcuts for palette toggle
      else if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setIsPaletteCollapsed(prev => !prev);
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
      const tableRight = table.position.x + (table.width || 300);
      const tableTop = table.position.y;
      const tableBottom = table.position.y + 40 + (table.fields?.length || 0) * 40; // Approximate height
      
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
        isPrimary: false,
        description: "",
        defaultValue: "",
      });
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

  const handleAreaDragEnd = (id, dragInfo) => {
    const area = areas.find(a => a.id === id);
    if (area) {
      updateAreaPosition(id, {
        x: area.position.x + dragInfo.offset.x / scale,
        y: area.position.y + dragInfo.offset.y / scale
      });
    }
  };

  const handleAreaUpdate = (updatedArea) => {
    updateArea(updatedArea);
  };

  const handleAreaDelete = (areaId) => {
    removeArea(areaId);
  };

  const handleNoteDragEnd = (id, dragInfo) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNotePosition(id, {
        x: note.position.x + dragInfo.offset.x / scale,
        y: note.position.y + dragInfo.offset.y / scale
      });
    }
  };

  const handleNoteUpdate = (updatedNote) => {
    updateNote(updatedNote);
  };

  const handleNoteDelete = (noteId) => {
    removeNote(noteId);
  };

  const handleAddNote = () => {
    const centerX = window.innerWidth / 2 - 100;
    const centerY = window.innerHeight / 2 - 100;
    
    const newNote = {
      id: `note-${Date.now()}`,
      content: "New note - click to edit",
      color: "yellow", // Default color
      position: { x: centerX, y: centerY },
      width: 200,
      height: 150, // Add default height
      zIndex: 30 // Explicitly set zIndex for notes
    };
    
    addNote(newNote);
    
    toast({
      title: "Note added",
      description: "A new note has been added to the canvas. Click to edit."
    });
  };
  
  const handleAddArea = () => {
    const centerX = window.innerWidth / 2 - 150;
    const centerY = window.innerHeight / 2 - 100;
    
    const newArea = {
      id: `area-${Date.now()}`,
      title: "New Area",
      color: "indigo", // Default color
      position: { x: centerX, y: centerY },
      width: 300,
      height: 200,
      zIndex: 10 // Explicitly set zIndex for areas
    };
    
    addArea(newArea);
    
    toast({
      title: "Area added",
      description: "A new area has been added to the canvas. Click to edit."
    });
  };
  
  // Handle layer ordering
  const handleMoveLayerUp = (itemId) => {
    moveLayerUp(itemId, itemId.startsWith('note-') ? 'note' : 
                        itemId.startsWith('area-') ? 'area' : 'table');
  };
  
  const handleMoveLayerDown = (itemId) => {
    moveLayerDown(itemId, itemId.startsWith('note-') ? 'note' : 
                          itemId.startsWith('area-') ? 'area' : 'table');
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

        <div className="space-y-2 mt-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddNote}
            title="Add Note"
            className="flex items-center justify-center w-8 h-8"
          >
            <StickyNote size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddArea}
            title="Add Area"
            className="flex items-center justify-center w-8 h-8"
          >
            <LayoutGrid size={16} />
          </Button>
        </div>
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
          style={{ minHeight: canvasSize.height, minWidth: canvasSize.width }}
        >
          <div 
            className="absolute w-full h-full"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: "0 0",
              minHeight: canvasSize.height,
              minWidth: canvasSize.width
            }}
          >
            {isGridVisible && (
              <div className="absolute inset-0 grid grid-cols-[repeat(600,20px)] grid-rows-[repeat(600,20px)] opacity-20" style={{ width: canvasSize.width, height: canvasSize.height }}>
                {/* Grid is now larger: 600x600 grid cells instead of 300x300 */}
                {Array.from({ length: 600 }).map((_, row) => (
                  Array.from({ length: 600 }).map((_, col) => (
                    <div 
                      key={`${row}-${col}`}
                      className="border-[0.5px] border-slate-300"
                    />
                  ))
                ))}
              </div>
            )}
            
            {/* Layer 1: Areas go at the bottom layer */}
            {areas && areas.length > 0 && areas.map((area) => (
              <CanvasArea
                key={area.id}
                area={area}
                onDragEnd={(_, info) => handleAreaDragEnd(area.id, info)}
                onUpdate={(updatedArea) => handleAreaUpdate(updatedArea)}
                onDelete={(areaId) => handleAreaDelete(areaId)}
                onMoveLayerUp={handleMoveLayerUp}
                onMoveLayerDown={handleMoveLayerDown}
                scale={scale}
              />
            ))}
            
            {/* Layer 2: Relationships */}
            {relationships && relationships.length > 0 && relationships.map((rel) => (
              <Relationship key={rel.id} relationship={rel} tables={tables} />
            ))}
            
            {/* Layer 3: Tables */}
            {tables && tables.length > 0 && tables.map((table) => (
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
                onMoveLayerUp={(tableId) => handleMoveLayerUp(tableId)}
                onMoveLayerDown={(tableId) => handleMoveLayerDown(tableId)}
              />
            ))}
            
            {/* Layer 4: Notes go on the top layer */}
            {notes && notes.length > 0 && notes.map((note) => (
              <CanvasNote
                key={note.id}
                note={note}
                onDragEnd={(_, info) => handleNoteDragEnd(note.id, info)}
                onUpdate={(updatedNote) => handleNoteUpdate(updatedNote)}
                onDelete={(noteId) => handleNoteDelete(noteId)}
                onMoveLayerUp={handleMoveLayerUp}
                onMoveLayerDown={handleMoveLayerDown}
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
