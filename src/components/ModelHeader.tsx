
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Download, Upload, FileJson, FileText, ChevronDown, Undo, Redo, Database } from "lucide-react";
import { templateModels } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";
import { useModelContext } from "@/contexts/ModelContext";

export const ModelHeader = () => {
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
    addTable({
      id: `table-${Date.now()}`,
      name: "New Table",
      fields: [
        {
          id: `field-${Date.now()}`,
          name: "ID",
          type: "id",
          required: true,
          unique: true,
        }
      ],
      position: { x: 50, y: 50 },
    });
  };
  
  const loadTemplate = (template) => {
    importModel(template);
    toast({
      title: "Template loaded",
      description: `Template "${template.name}" has been created successfully`
    });
  };

  return (
    <header className="border-b border-slate-200 bg-white p-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-indigo-600 mr-4">Cubable Model Designer</h1>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={undo}
            disabled={!canUndo}
            className="h-8"
          >
            <Undo size={16} className="mr-1" />
            Undo
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={redo} 
            disabled={!canRedo}
            className="h-8"
          >
            <Redo size={16} className="mr-1" />
            Redo
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          onClick={handleImport}
          className="flex items-center"
        >
          <Upload size={16} className="mr-2" />
          Import
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={handleExport}
          className="flex items-center"
        >
          <Download size={16} className="mr-2" />
          Export
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center">
              <FileText size={16} className="mr-2" />
              Template
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Data Templates</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {templateModels.map((template) => (
              <DropdownMenuItem 
                key={template.id} 
                onClick={() => loadTemplate(template)}
              >
                {template.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          onClick={handleAddTable}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Add Table
        </Button>
      </div>
    </header>
  );
};
