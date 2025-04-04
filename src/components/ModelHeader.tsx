import { useState } from "react";
import { Button } from "@/components/ui/button";
import { templateModels } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";
import { useModelContext } from "@/contexts/ModelContext";
import { AppMenu } from "@/components/AppMenu";

export const ModelHeader = ({ 
  isPaletteVisible, 
  setIsPaletteVisible, 
  isGridVisible,
  setIsGridVisible,
  toggleFullscreen,
  isFullscreen,
  onAddArea,
  onAddNote,
  onAddTable
}) => {
  const { toast } = useToast();
  const { addTable, importModel, exportModel, canUndo, canRedo, undo, redo } = useModelContext();
  
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          importModel(json);
          toast({
            title: "Import successful",
            description: "Data model has been imported successfully"
          });
        } catch (error) {
          toast({
            title: "Import error",
            description: "Invalid file format",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExport = () => {
    const data = exportModel();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cubable-model.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Data model has been saved successfully"
    });
  };
  
  const handleAddTable = () => {
    onAddTable();
  };
  
  const loadTemplate = (template) => {
    importModel(template);
    toast({
      title: "Template loaded",
      description: `Template "${template.name}" has been created successfully`
    });
  };

  return (
    <header className="border-b border-slate-200 bg-white p-0">
      <AppMenu
        onImport={handleImport}
        onExport={handleExport}
        onAddTable={handleAddTable}
        onAddArea={onAddArea}
        onAddNote={onAddNote}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        isGridVisible={isGridVisible}
        setIsGridVisible={setIsGridVisible}
        isPaletteVisible={isPaletteVisible}
        setIsPaletteVisible={setIsPaletteVisible}
      />
    </header>
  );
};
