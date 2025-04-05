
import { useState, useEffect } from "react";
import { ModelDesigner } from "@/components/ModelDesigner";
import { ModelHeader } from "@/components/ModelHeader";
import { useToast } from "@/hooks/use-toast";
import { useModelContext } from "@/contexts/ModelContext";

const Index = () => {
  const { toast } = useToast();
  const [isPaletteVisible, setIsPaletteVisible] = useState(true);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { 
    addTable, 
    addArea, 
    addNote, 
    tables, 
    areas, 
    notes,
  } = useModelContext();
  
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
  
  const handleAddArea = () => {
    const centerX = window.innerWidth / 2 - 150;
    const centerY = window.innerHeight / 2 - 100;
    
    const newArea = {
      id: `area-${Date.now()}`,
      title: "New Area",
      color: "indigo", // Default color
      position: { x: centerX, y: centerY },
      width: 300,
      height: 200
    };
    
    console.log("Adding area:", newArea);
    addArea(newArea);
    
    toast({
      title: "Area added",
      description: "A new area has been added to the canvas. Click to edit."
    });
    
    console.log("Areas after adding:", areas);
  };
  
  const handleAddNote = () => {
    const centerX = window.innerWidth / 2 - 100;
    const centerY = window.innerHeight / 2 - 100;
    
    const newNote = {
      id: `note-${Date.now()}`,
      content: "New note - click to edit",
      color: "yellow", // Default color
      position: { x: centerX, y: centerY },
      width: 200
    };
    
    console.log("Adding note:", newNote);
    addNote(newNote);
    
    toast({
      title: "Note added",
      description: "A new note has been added to the canvas. Click to edit."
    });
    
    console.log("Notes after adding:", notes);
  };

  const handleAddTable = () => {
    const centerX = window.innerWidth / 2 - 150;
    const centerY = window.innerHeight / 2 - 100;
    
    addTable({
      id: `table-${Date.now()}`,
      name: "New Table",
      fields: [
        {
          id: `field-${Date.now()}-1`,
          name: "ID",
          type: "id",
          required: true,
          isPrimary: true,
          unique: true
        }
      ],
      position: { x: centerX, y: centerY },
      width: 300,
    });
    
    toast({
      title: "Table added",
      description: "A new table has been added to the canvas"
    });
    
    console.log("Tables after adding:", tables);
  };

  // Set up event listeners for area and note updates from ModelDesigner
  useEffect(() => {
    const handleUpdateArea = (e) => {
      const { area } = e.detail;
      // Update area in context
      const event = new CustomEvent('contextUpdateArea', {
        detail: { area }
      });
      window.dispatchEvent(event);
    };
    
    const handleDeleteArea = (e) => {
      const { areaId } = e.detail;
      // Delete area in context
      const event = new CustomEvent('contextDeleteArea', {
        detail: { areaId }
      });
      window.dispatchEvent(event);
    };
    
    const handleUpdateNote = (e) => {
      const { note } = e.detail;
      // Update note in context
      const event = new CustomEvent('contextUpdateNote', {
        detail: { note }
      });
      window.dispatchEvent(event);
    };
    
    const handleDeleteNote = (e) => {
      const { noteId } = e.detail;
      // Delete note in context
      const event = new CustomEvent('contextDeleteNote', {
        detail: { noteId }
      });
      window.dispatchEvent(event);
    };
    
    window.addEventListener('updateArea', handleUpdateArea);
    window.addEventListener('deleteArea', handleDeleteArea);
    window.addEventListener('updateNote', handleUpdateNote);
    window.addEventListener('deleteNote', handleDeleteNote);
    
    return () => {
      window.removeEventListener('updateArea', handleUpdateArea);
      window.removeEventListener('deleteArea', handleDeleteArea);
      window.removeEventListener('updateNote', handleUpdateNote);
      window.removeEventListener('deleteNote', handleDeleteNote);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <ModelHeader 
        isPaletteVisible={isPaletteVisible}
        setIsPaletteVisible={setIsPaletteVisible}
        isGridVisible={isGridVisible}
        setIsGridVisible={setIsGridVisible}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onAddArea={handleAddArea}
        onAddNote={handleAddNote}
        onAddTable={handleAddTable}
      />
      <div className="flex-1 overflow-hidden">
        <ModelDesigner 
          isPaletteVisible={isPaletteVisible}
          isGridVisible={isGridVisible}
          isFullscreen={isFullscreen}
        />
      </div>
    </div>
  );
};

export default Index;
