
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, GripVertical, StickyNote, MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const CanvasNote = ({ note, onDragEnd, onUpdate, onDelete, scale, onMoveLayerUp, onMoveLayerDown }) => {
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
        height: note.height || "auto",
        zIndex: note.zIndex || 30,
      }}
      className="cursor-move select-none"
    >
      <Card 
        className={cn(
          "shadow-md rounded-md h-full flex flex-col",
          colorOptions[color]
        )}
      >
        <div className="p-1 flex items-center justify-between border-b border-yellow-200">
          <div className="cursor-move">
            <GripVertical size={14} className="opacity-60" />
          </div>
          
          <div className="text-xs opacity-70 font-medium">
            note_{note.id.split('-')[1] || '0'}
          </div>
          
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
                        backgroundColor: colorName === 'yellow' ? 'var(--yellow-200, #fef08a)' : 
                                       colorName === 'blue' ? 'var(--blue-200, #bfdbfe)' : 
                                       colorName === 'green' ? 'var(--green-200, #bbf7d0)' : 
                                       colorName === 'pink' ? 'var(--pink-200, #fbcfe8)' : 
                                       'var(--purple-200, #d8b4fe)'
                      }}
                    />
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onMoveLayerUp(note.id)}>
                <ArrowUp size={14} className="mr-2" />
                Move Up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMoveLayerDown(note.id)}>
                <ArrowDown size={14} className="mr-2" />
                Move Down
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-red-600">
                <Trash2 size={14} className="mr-2" />
                Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardContent className="p-3 pt-2 flex-grow overflow-auto">
          {isEditing ? (
            <div className="space-y-2 h-full flex flex-col">
              <Textarea
                value={content}
                onChange={handleContentChange}
                className="min-h-[100px] text-sm resize-y flex-grow"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-inherit">
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
              className="text-sm whitespace-pre-wrap break-words cursor-text h-full overflow-auto"
              onClick={() => setIsEditing(true)}
            >
              {content}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Resize handles */}
      {/* Bottom right corner */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          const startWidth = note.width;
          const startHeight = note.height || 100;
          const startX = e.clientX;
          const startY = e.clientY;
          
          const onMouseMove = (e) => {
            const dx = (e.clientX - startX) / scale;
            const dy = (e.clientY - startY) / scale;
            onUpdate({ 
              ...note, 
              width: Math.max(startWidth + dx, 200),
              height: Math.max(startHeight + dy, 100) 
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
      
      {/* Bottom edge */}
      <div 
        className="absolute bottom-0 left-2 right-2 h-2 cursor-ns-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          const startHeight = note.height || 100;
          const startY = e.clientY;
          
          const onMouseMove = (e) => {
            const dy = (e.clientY - startY) / scale;
            onUpdate({ 
              ...note, 
              height: Math.max(startHeight + dy, 100) 
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
        <div className="w-full h-1 bg-transparent" />
      </div>
      
      {/* Right edge */}
      <div 
        className="absolute top-2 bottom-2 right-0 w-2 cursor-ew-resize"
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
        <div className="h-full w-1 bg-transparent" />
      </div>
    </motion.div>
  );
};
