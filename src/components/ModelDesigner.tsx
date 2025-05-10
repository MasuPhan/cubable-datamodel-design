
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useModelContext } from "@/contexts/ModelContext";
import { useToast } from "@/hooks/use-toast";
import { useCanvasControls } from "@/hooks/useCanvasControls";
import { ZoomControls } from "@/components/designer/ZoomControls";
import { AddItemControls } from "@/components/designer/AddItemControls";
import { PaletteSidebar } from "@/components/designer/PaletteSidebar";
import { DesignerCanvas } from "@/components/designer/DesignerCanvas";
import { DesignerContent } from "@/components/designer/DesignerContent";

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
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(!isPaletteVisible);
  
  // Canvas controls
  const {
    scale,
    position,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetView
  } = useCanvasControls();
  
  // Enlarged canvas size (doubled from the original 600vh to 1200vh)
  const canvasSize = {
    width: "1200vw",
    height: "1200vh"
  };
  
  // Handle field drop on table
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

  // Table position handlers
  const handleTableDragEnd = (id, newPosition) => {
    updateTablePosition(id, newPosition);
  };

  // Area handlers
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

  // Note handlers
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
      {/* Zoom controls */}
      <ZoomControls 
        scale={scale} 
        onZoomIn={zoomIn} 
        onZoomOut={zoomOut} 
        onReset={resetView} 
      />
      
      {/* Add note/area buttons */}
      <div className="absolute top-28 left-4 z-30">
        <AddItemControls 
          onAddNote={handleAddNote} 
          onAddArea={handleAddArea} 
        />
      </div>
      
      {/* Palette sidebar */}
      <PaletteSidebar 
        isPaletteCollapsed={isPaletteCollapsed}
        setIsPaletteCollapsed={setIsPaletteCollapsed}
        setIsDraggingField={setIsDraggingField}
      />
      
      {/* Main canvas container */}
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
        <DesignerCanvas 
          isDraggingField={isDraggingField}
          scale={scale}
          position={position}
          canvasSize={canvasSize}
          isGridVisible={isGridVisible}
        >
          <DesignerContent 
            areas={areas}
            relationships={relationships}
            tables={tables}
            notes={notes}
            scale={scale}
            onAreaDragEnd={handleAreaDragEnd}
            onAreaUpdate={handleAreaUpdate}
            onAreaDelete={handleAreaDelete}
            onTableDragEnd={handleTableDragEnd}
            onNoteDragEnd={handleNoteDragEnd}
            onNoteUpdate={handleNoteUpdate}
            onNoteDelete={handleNoteDelete}
            onMoveLayerUp={handleMoveLayerUp}
            onMoveLayerDown={handleMoveLayerDown}
          />
        </DesignerCanvas>
      </div>
      
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        Tip: Hold mouse wheel or Ctrl+drag to pan. Scroll to zoom.
      </div>
    </div>
  );
};
