
import React from "react";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "@/components/ui/menubar";
import { useModelContext } from "@/contexts/ModelContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Files, 
  Save, 
  FolderOpen, 
  Share2, 
  Download, 
  Upload, 
  FileText,
  Undo,
  Redo,
  Copy,
  Scissors,
  Clipboard,
  PanelLeft,
  Settings,
  Maximize,
  Minimize,
  Grid,
  Cuboid,
  LayoutGrid,
  StickyNote,
} from "lucide-react";

import { ShareDialog } from "@/components/ShareDialog";

export const AppMenu = ({ 
  onImport, 
  onExport, 
  onAddTable,
  onAddArea,
  onAddNote,
  toggleFullscreen,
  isFullscreen,
  isGridVisible,
  setIsGridVisible,
  isPaletteVisible,
  setIsPaletteVisible,
}) => {
  const { undo, redo, canUndo, canRedo } = useModelContext();
  const { toast } = useToast();
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);

  const handleAddTable = () => {
    console.log("AppMenu: Calling onAddTable");
    onAddTable();
  };

  const handleAddArea = () => {
    console.log("AppMenu: Calling onAddArea");
    onAddArea();
  };

  const handleAddNote = () => {
    console.log("AppMenu: Calling onAddNote");
    onAddNote();
  };

  return (
    <>
      <Menubar className="rounded-none border-b border-none px-2 lg:px-4">
        <div className="flex items-center mr-4 text-indigo-700 font-bold">
          <Cuboid className="h-5 w-5 mr-2 text-indigo-600" />
          Cubable DataModel Design
        </div>
        
        <MenubarMenu>
          <MenubarTrigger className="font-bold">File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={handleAddTable}>
              New Table
              <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleAddArea}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              New Area
              <MenubarShortcut>⌘A</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleAddNote}>
              <StickyNote className="mr-2 h-4 w-4" />
              New Note
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={onImport}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </MenubarItem>
            <MenubarItem onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
              <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>
                <FileText className="mr-2 h-4 w-4" />
                Templates
              </MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>User Management</MenubarItem>
                <MenubarItem>Blog Platform</MenubarItem>
                <MenubarItem>E-commerce</MenubarItem>
                <MenubarItem>Task Management</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-bold">Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled={!canUndo} onClick={undo}>
              Undo
              <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!canRedo} onClick={redo}>
              Redo
              <MenubarShortcut>⌘⇧Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled>
              Cut
              <MenubarShortcut>⌘X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>
              Copy
              <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>
              Paste
              <MenubarShortcut>⌘V</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-bold">View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem 
              checked={isPaletteVisible}
              onCheckedChange={setIsPaletteVisible}
            >
              <PanelLeft className="mr-2 h-4 w-4" />
              Field Palette
              <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={isGridVisible}
              onCheckedChange={setIsGridVisible}
            >
              <Grid className="mr-2 h-4 w-4" />
              Show Grid
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarItem onClick={toggleFullscreen}>
              {isFullscreen ? (
                <>
                  <Minimize className="mr-2 h-4 w-4" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize className="mr-2 h-4 w-4" />
                  Enter Fullscreen
                </>
              )}
              <MenubarShortcut>F11</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-bold">Settings</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-bold">Share</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Project
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      
      <ShareDialog 
        open={isShareDialogOpen} 
        onOpenChange={setIsShareDialogOpen} 
      />
    </>
  );
};
