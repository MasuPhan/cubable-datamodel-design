
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls = ({ scale, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) => {
  return (
    <div className="absolute top-4 left-4 z-30 flex flex-col space-y-2">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onZoomIn} 
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
          onClick={onZoomOut} 
          title="Zoom Out"
          className="rounded-none rounded-b-lg"
        >
          <MinusCircle size={18} />
        </Button>
      </div>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onReset} 
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
    </div>
  );
};
