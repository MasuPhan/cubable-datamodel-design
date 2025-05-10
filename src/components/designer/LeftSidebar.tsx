
import { Button } from "@/components/ui/button";
import { Plus, Focus } from "lucide-react";
import { useModelContext } from "@/contexts/ModelContext";
import { useToast } from "@/hooks/use-toast";

interface LeftSidebarProps {
  onFocusElements: () => void;
}

export const LeftSidebar = ({ onFocusElements }: LeftSidebarProps) => {
  const { addTable } = useModelContext();
  const { toast } = useToast();

  const handleAddTable = () => {
    const centerX = window.innerWidth / 2 - 150;
    const centerY = window.innerHeight / 2 - 100;
    
    const newTable = {
      id: `table-${Date.now()}`,
      name: "New Table",
      fields: [
        {
          id: `field-${Date.now()}`,
          name: "id",
          type: "id",
          required: true,
          unique: true,
          isPrimary: true,
          description: "Primary key",
          defaultValue: "",
        }
      ],
      position: { x: centerX, y: centerY },
      width: 300,
      zIndex: 20 // Explicitly set zIndex for tables
    };
    
    addTable(newTable);
    
    toast({
      title: "Table added",
      description: "A new table has been added to the canvas."
    });
  };

  return (
    <div className="absolute left-4 top-16 z-30">
      <div className="space-y-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddTable}
          title="Add Table"
          className="flex items-center justify-center w-8 h-8"
        >
          <Plus size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onFocusElements}
          title="Focus Elements"
          className="flex items-center justify-center w-8 h-8"
        >
          <Focus size={16} />
        </Button>
      </div>
    </div>
  );
};
