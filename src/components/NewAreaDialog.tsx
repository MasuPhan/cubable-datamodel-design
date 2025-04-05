
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NewAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateArea: (title: string, color: string) => void;
}

export function NewAreaDialog({ open, onOpenChange, onCreateArea }: NewAreaDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("New Area");
  const [selectedColor, setSelectedColor] = useState("indigo");

  const colorOptions = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Please add a title for your area",
        variant: "destructive",
      });
      return;
    }

    onCreateArea(title, selectedColor);
    setTitle("New Area");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Area</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Area Title</div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter area title"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Area Color</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(colorOptions).map(([colorName, _]) => (
                <button
                  key={colorName}
                  className={cn(
                    "w-8 h-8 rounded-full border",
                    selectedColor === colorName && "ring-2 ring-offset-2 ring-gray-400"
                  )}
                  onClick={() => setSelectedColor(colorName)}
                  title={`${colorName.charAt(0).toUpperCase() + colorName.slice(1)} area`}
                  style={{
                    backgroundColor: colorName === 'indigo' ? 'var(--indigo-100, #e0e7ff)' : 
                                   colorName === 'amber' ? 'var(--amber-100, #fef3c7)' : 
                                   colorName === 'emerald' ? 'var(--emerald-100, #d1fae5)' : 
                                   colorName === 'rose' ? 'var(--rose-100, #ffe4e6)' : 
                                   colorName === 'blue' ? 'var(--blue-100, #dbeafe)' : 
                                   'var(--purple-100, #f3e8ff)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
          >
            Create Area
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
