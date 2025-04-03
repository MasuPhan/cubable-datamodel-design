
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MoreVertical, Trash2, GripVertical, StickyNote } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const CanvasNote = ({ note, onDragEnd, onUpdate, onDelete, scale }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState(note.color || "yellow");

  const colorOptions = {
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    pink: "bg-pink-50 border-pink-200 text-pink-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSubmit = () => {
    onUpdate({ ...note, content, color });
    setIsEditing(false);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    onUpdate({ ...note, content, color: newColor });
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={onDragEnd}
      initial={{ x: note.position.x, y: note.position.y }}
      animate={{ x: note.position.x, y: note.position.y }}
      style={{
        position: "absolute",
        width: note.width,
        height: "auto",
      }}
      className="cursor-move select-none"
    >
      <Card 
        className={cn(
          "shadow-md border-l-4 rounded-tr-md rounded-br-md rounded-tl-none rounded-bl-none",
          colorOptions[color]
        )}
      >
        <div className="p-1 flex items-center justify-between">
          <div className="cursor-move">
            <GripVertical size={14} className="opacity-60" />
          </div>
          
          <StickyNote size={14} className="opacity-60" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-60">
                <MoreVertical size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                Edit Note
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2">Note Color</div>
                <div className="grid grid-cols-5 gap-1">
                  {Object.entries(colorOptions).map(([colorName, _]) => (
                    <button
                      key={colorName}
                      className={cn(
                        "w-5 h-5 rounded-full border",
                        `bg-${colorName}-200`,
                        colorName === color && "ring-2 ring-offset-1 ring-gray-400"
                      )}
                      onClick={() => handleColorChange(colorName)}
                      style={{
                        backgroundColor: `var(--${colorName}-200, #${colorName === 'yellow' ? 'fef08a' : 
                                             colorName === 'blue' ? 'bfdbfe' : 
                                             colorName === 'green' ? 'bbf7d0' : 
                                             colorName === 'pink' ? 'fbcfe8' : 
                                             colorName === 'purple' ? 'd8b4fe' : 'fef08a'})`
                      }}
                    />
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-red-600">
                <Trash2 size={14} className="mr-2" />
                Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardContent className="p-3 pt-0">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={content}
                onChange={handleContentChange}
                className="min-h-[100px] text-sm"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(false)} 
                  className="text-xs h-7"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSubmit} 
                  className="text-xs h-7"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="text-sm whitespace-pre-wrap break-words cursor-text"
              onClick={() => setIsEditing(true)}
            >
              {content}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Resize handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          const startWidth = note.width;
          const startX = e.clientX;
          
          const onMouseMove = (e) => {
            const dx = (e.clientX - startX) / scale;
            onUpdate({ 
              ...note, 
              width: Math.max(startWidth + dx, 200),
            });
          };
          
          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };
          
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        }}
      >
        <div className={cn(
          "w-2 h-2 border-b-2 border-r-2",
          color === "yellow" ? "border-yellow-400" :
          color === "blue" ? "border-blue-400" :
          color === "green" ? "border-green-400" :
          color === "pink" ? "border-pink-400" :
          "border-purple-400"
        )} />
      </div>
    </motion.div>
  );
};
