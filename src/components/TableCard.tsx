
import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Pencil, MoreVertical, Trash2, Plus, GripVertical, Database, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/FieldRow";
import { useModelContext } from "@/contexts/ModelContext";
import { AddReferenceDialog } from "@/components/AddReferenceDialog";
import { useToast } from "@/hooks/use-toast";

export const TableCard = ({ table, onDragEnd, scale, isSelected = false, onClick }) => {
  const { toast } = useToast();
  const { updateTableName, removeTable, addFieldToTable, addTable, updateField } = useModelContext();
  const [isEditing, setIsEditing] = useState(false);
  const [tableName, setTableName] = useState(table.name);
  const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false);
  
  // For resizing
  const resizeRef = useRef(null);
  const width = useMotionValue(table.width || 300);
  const height = useMotionValue(table.height || (table.fields.length * 40 + 120));
  const isResizing = useRef(false);
  
  // Listen for reference dialog open events
  useEffect(() => {
    const handleOpenReferenceDialog = (e) => {
      if (e.detail.sourceTableId === table.id) {
        setIsAddReferenceOpen(true);
      }
    };
    
    window.addEventListener('openReferenceDialog', handleOpenReferenceDialog);
    return () => window.removeEventListener('openReferenceDialog', handleOpenReferenceDialog);
  }, [table.id]);

  const handleNameChange = (e) => {
    setTableName(e.target.value);
  };

  const handleNameSave = () => {
    updateTableName(table.id, tableName);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNameSave();
    }
  };

  const handleDelete = () => {
    removeTable(table.id);
    toast({
      title: "Table deleted",
      description: `Table "${table.name}" has been removed`
    });
  };
  
  const handleDuplicate = () => {
    const newTableId = `table-${Date.now()}`;
    const newFields = table.fields.map(field => ({
      ...field,
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    
    addTable({
      id: newTableId,
      name: `${table.name} Copy`,
      fields: newFields,
      position: { x: table.position.x + 30, y: table.position.y + 30 },
      width: width.get(),
    });
    
    toast({
      title: "Table duplicated",
      description: `Table "${table.name}" has been duplicated`
    });
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    isResizing.current = true;
  };

  const handleResize = (e) => {
    if (!isResizing.current) return;
    
    const dx = e.movementX / scale;
    const dy = e.movementY / scale;
    
    width.set(Math.max(width.get() + dx, 300));
    height.set(Math.max(height.get() + dy, 150));
    
    // Update table dimensions in the context
    updateTableDimensions();
    
    e.preventDefault();
  };

  const handleResizeEnd = () => {
    if (isResizing.current) {
      isResizing.current = false;
      // Update final dimensions in context
      updateTableDimensions();
    }
  };
  
  const updateTableDimensions = () => {
    const dimensions = {
      width: width.get(),
      height: height.get()
    };
    
    // Update the table dimensions in the context
    // This function should be defined in your ModelContext
    table.width = dimensions.width;
    table.height = dimensions.height;
  };

  const handleMoveFieldUp = (index) => {
    if (index > 0) {
      const fields = [...table.fields];
      const temp = fields[index - 1];
      fields[index - 1] = fields[index];
      fields[index] = temp;
      updateField(table.id, fields[index - 1].id, { ...fields[index - 1], index: index - 1 });
      updateField(table.id, fields[index].id, { ...fields[index], index: index });
    }
  };

  const handleMoveFieldDown = (index) => {
    if (index < table.fields.length - 1) {
      const fields = [...table.fields];
      const temp = fields[index + 1];
      fields[index + 1] = fields[index];
      fields[index] = temp;
      updateField(table.id, fields[index + 1].id, { ...fields[index + 1], index: index + 1 });
      updateField(table.id, fields[index].id, { ...fields[index], index: index });
    }
  };

  // Set up event listeners for mousemove and mouseup on the document
  useEffect(() => {
    const handleDocumentMouseMove = (e) => {
      if (isResizing.current) {
        handleResize(e);
      }
    };

    const handleDocumentMouseUp = () => {
      handleResizeEnd();
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [scale]); // Add scale as a dependency

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(table.id);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={onDragEnd}
      initial={{ x: table.position.x, y: table.position.y }}
      animate={{ x: table.position.x, y: table.position.y }}
      style={{ 
        position: "absolute",
        width: width,
        height: "auto"
      }}
      className="cursor-move select-none"
      onClick={handleCardClick}
    >
      <Card className={cn(
        "shadow-md border-2 border-indigo-100 overflow-hidden",
        isSelected && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white"
      )}>
        <CardHeader className="p-3 bg-indigo-50 flex flex-row items-center space-y-0 gap-2">
          <div className="cursor-move pr-2 hover:text-indigo-700">
            <GripVertical size={16} className="text-gray-400" />
          </div>
          
          {isEditing ? (
            <div className="flex-1">
              <Input
                value={tableName}
                onChange={handleNameChange}
                onBlur={handleNameSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="h-7 text-sm py-0 font-medium"
              />
            </div>
          ) : (
            <CardTitle
              className="text-sm flex-1 font-medium hover:text-indigo-700 cursor-pointer truncate"
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              title={table.name}
            >
              {table.name}
            </CardTitle>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                <Pencil size={14} className="mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}>
                <Copy size={14} className="mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="text-red-600">
                <Trash2 size={14} className="mr-2" />
                Delete Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
            {table.fields.map((field, index) => (
              <FieldRow
                key={field.id}
                field={field}
                tableId={table.id}
                isLast={index === table.fields.length - 1}
                fieldIndex={index}
                onMoveUp={(e) => { e.stopPropagation(); handleMoveFieldUp(index); }}
                onMoveDown={(e) => { e.stopPropagation(); handleMoveFieldDown(index); }}
              />
            ))}
          </div>
          
          <div className="p-2 flex bg-slate-50 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs h-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={(e) => {
                e.stopPropagation();
                addFieldToTable(table.id, {
                  id: `field-${Date.now()}`,
                  name: "New Field",
                  type: "text",
                  required: false,
                  unique: false,
                  isPrimary: false,
                  description: "",
                  defaultValue: "",
                });
              }}
            >
              <Plus size={14} className="mr-1" />
              Add Field
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs h-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-l border-slate-200"
              onClick={(e) => { e.stopPropagation(); setIsAddReferenceOpen(true); }}
            >
              <Database size={14} className="mr-1" />
              Add Reference
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Resize handle */}
      <div
        ref={resizeRef}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e); }}
      >
        <div className="w-2 h-2 border-b-2 border-r-2 border-indigo-400" />
      </div>

      <AddReferenceDialog
        open={isAddReferenceOpen}
        onOpenChange={(open) => { setIsAddReferenceOpen(open); }}
        sourceTableId={table.id}
      />
    </motion.div>
  );
};
