
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FieldTypePalette } from "@/components/FieldTypePalette";

interface PaletteSidebarProps {
  isPaletteCollapsed: boolean;
  setIsPaletteCollapsed: (collapsed: boolean) => void;
  setIsDraggingField: (dragging: boolean) => void;
}

export const PaletteSidebar = ({ 
  isPaletteCollapsed, 
  setIsPaletteCollapsed, 
  setIsDraggingField 
}: PaletteSidebarProps) => {
  return (
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
  );
};
