
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Trash2, Pencil, GripVertical } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const CanvasArea = ({ area, onDragEnd, onUpdate, onDelete, scale }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(area.title);
  const [color, setColor] = useState(area.color || "indigo");

  const colorOptions = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSubmit = () => {
    onUpdate({ ...area, title, color });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    onUpdate({ ...area, title, color: newColor });
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={onDragEnd}
      initial={{ x: area.position.x, y: area.position.y }}
      animate={{ x: area.position.x, y: area.position.y }}
      style={{
        position: "absolute",
        width: area.width,
        height: area.height,
        zIndex: 10,
      }}
      className="cursor-move select-none"
    >
      <Card 
        className={cn(
          "shadow-sm border-2 border-dashed h-full",
          colorOptions[color]
        )}
      >
        <CardHeader className="p-2 flex flex-row items-center space-y-0">
          <div className="cursor-move pr-2">
            <GripVertical size={16} className="opacity-60" />
          </div>
          
          {isEditing ? (
            <div className="flex-1">
              <Input
                value={title}
                onChange={handleTitleChange}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                autoFocus
                className="h-7 text-sm py-0 bg-transparent border-none"
              />
            </div>
          ) : (
            <div
              className="text-sm flex-1 font-medium opacity-80 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              {title || `area_${area.id.split('-')[1] || '0'}`}
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil size={14} className="mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2">Area Color</div>
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(colorOptions).map(([colorName, _]) => (
                    <button
                      key={colorName}
                      className={cn(
                        "w-6 h-6 rounded-full border",
                        `bg-${colorName}-200`,
                        colorName === color && "ring-2 ring-offset-1 ring-gray-400"
                      )}
                      onClick={() => handleColorChange(colorName)}
                      style={{
                        backgroundColor: colorName === 'indigo' ? 'var(--indigo-200, #c7d2fe)' : 
                                        colorName === 'amber' ? 'var(--amber-200, #fde68a)' : 
                                        colorName === 'emerald' ? 'var(--emerald-200, #a7f3d0)' : 
                                        colorName === 'rose' ? 'var(--rose-200, #fecdd3)' : 
                                        colorName === 'blue' ? 'var(--blue-200, #bfdbfe)' : 
                                        'var(--purple-200, #d8b4fe)'
                      }}
                    />
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(area.id)} className="text-red-600">
                <Trash2 size={14} className="mr-2" />
                Delete Area
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </Card>
      
      {/* Resize handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          const startWidth = area.width;
          const startHeight = area.height;
          const startX = e.clientX;
          const startY = e.clientY;
          
          const onMouseMove = (e) => {
            const dx = (e.clientX - startX) / scale;
            const dy = (e.clientY - startY) / scale;
            onUpdate({ 
              ...area, 
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
          color === "indigo" ? "border-indigo-400" :
          color === "amber" ? "border-amber-400" :
          color === "emerald" ? "border-emerald-400" :
          color === "rose" ? "border-rose-400" :
          color === "blue" ? "border-blue-400" :
          "border-purple-400"
        )} />
      </div>
    </motion.div>
  );
};
