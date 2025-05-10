
import { Button } from "@/components/ui/button";
import { StickyNote, LayoutGrid } from "lucide-react";

interface AddItemControlsProps {
  onAddNote: () => void;
  onAddArea: () => void;
}

export const AddItemControls = ({ onAddNote, onAddArea }: AddItemControlsProps) => {
  return (
    <div className="space-y-2 mt-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddNote}
        title="Add Note"
        className="flex items-center justify-center w-8 h-8"
      >
        <StickyNote size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddArea}
        title="Add Area"
        className="flex items-center justify-center w-8 h-8"
      >
        <LayoutGrid size={16} />
      </Button>
    </div>
  );
};
