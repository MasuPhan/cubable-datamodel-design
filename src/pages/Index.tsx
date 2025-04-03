
import { useState } from "react";
import { ModelDesigner } from "@/components/ModelDesigner";
import { ModelHeader } from "@/components/ModelHeader";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isPaletteVisible, setIsPaletteVisible] = useState(true);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Reference to the ModelDesigner to call its methods
  const [designerRef, setDesignerRef] = useState(null);
  
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
    if (designerRef && designerRef.addArea) {
      designerRef.addArea();
    }
  };
  
  const handleAddNote = () => {
    if (designerRef && designerRef.addNote) {
      designerRef.addNote();
    }
  };
  
  // Create a ref callback to get the ModelDesigner's methods
  const setDesignerRefCallback = (ref) => {
    if (ref) {
      setDesignerRef({
        addArea: ref.addArea,
        addNote: ref.addNote
      });
    }
  };

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
      />
      <div className="flex-1 overflow-hidden">
        <ModelDesigner 
          ref={setDesignerRefCallback}
          isPaletteVisible={isPaletteVisible}
          isGridVisible={isGridVisible}
          isFullscreen={isFullscreen}
        />
      </div>
    </div>
  );
};

export default Index;
