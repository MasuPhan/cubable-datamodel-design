
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface NewNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNote: (content: string, color: string) => void;
}

export function NewNoteDialog({ open, onOpenChange, onCreateNote }: NewNoteDialogProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("Add your note here...");
  const [selectedColor, setSelectedColor] = useState("yellow");

  const colorOptions = {
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    pink: "bg-pink-50 border-pink-200 text-pink-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Please add content to your note",
        variant: "destructive",
      });
      return;
    }

    onCreateNote(content, selectedColor);
    setContent("Add your note here...");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
            autoFocus
          />
          <div className="space-y-2">
            <div className="text-sm font-medium">Note Color</div>
            <div className="flex space-x-2">
              {Object.entries(colorOptions).map(([colorName, _]) => (
                <button
                  key={colorName}
                  className={cn(
                    "w-8 h-8 rounded-full border",
                    selectedColor === colorName && "ring-2 ring-offset-2 ring-gray-400"
                  )}
                  onClick={() => setSelectedColor(colorName)}
                  title={`${colorName.charAt(0).toUpperCase() + colorName.slice(1)} note`}
                  style={{
                    backgroundColor: colorName === 'yellow' ? 'var(--yellow-100, #fef9c3)' : 
                                   colorName === 'blue' ? 'var(--blue-100, #dbeafe)' : 
                                   colorName === 'green' ? 'var(--green-100, #dcfce7)' : 
                                   colorName === 'pink' ? 'var(--pink-100, #fce7f3)' : 
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
            Create Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
