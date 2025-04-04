
import { useState, useEffect } from "react";
import { ModelDesigner } from "@/components/ModelDesigner";
import { ModelHeader } from "@/components/ModelHeader";
import { useToast } from "@/hooks/use-toast";
import { useModelContext } from "@/contexts/ModelContext";

const Index = () => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isPaletteVisible, setIsPaletteVisible] = useState(true);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { addTable, addArea, addNote } = useModelContext();
  
  // Get the current viewport dimensions to calculate better initial positions
  const getRandomPosition = () => {
    const viewportWidth = window.innerWidth * 0.6; // 60% of viewport width
    const viewportHeight = window.innerHeight * 0.6; // 60% of viewport height
    
    return {
      x: Math.random() * viewportWidth + 100,
      y: Math.random() * viewportHeight + 100
    };
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
  
  const handleAddArea = () => {
    console.log("Adding new area");
    
    const position = getRandomPosition();
    console.log("Creating area at position:", position);
    
    addArea({
      id: `area-${Date.now()}`,
      title: "New Area",
      color: "indigo",
      position: position,
      width: 300,
      height: 200
    });
    
    toast({
      title: "Area added",
      description: "New area has been added to the canvas"
    });
  };
  
  const handleAddNote = () => {
    console.log("Adding new note");
    
    const position = getRandomPosition();
    console.log("Creating note at position:", position);
    
    addNote({
      id: `note-${Date.now()}`,
      content: "Add your note here...",
      color: "yellow",
      position: position,
      width: 200
    });
    
    toast({
      title: "Note added",
      description: "New note has been added to the canvas"
    });
  };

  const handleAddTable = () => {
    console.log("Adding new table");
    
    const position = getRandomPosition();
    console.log("Creating table at position:", position);
    
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
      position: position,
      width: 300,
    });
    
    toast({
      title: "Table added",
      description: "A new table has been added to the canvas"
    });
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
