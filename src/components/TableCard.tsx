
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

export const TableCard = ({ table, onDragEnd, scale }) => {
  const { toast } = useToast();
  const { updateTableName, removeTable, addFieldToTable, addTable, updateField } = useModelContext();
  const [isEditing, setIsEditing] = useState(false);
  const [tableName, setTableName] = useState(table.name);
  const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false);
  
  // For resizing
  const resizeRef = useRef(null);
  const width = useMotionValue(table.width || 300);
  const isResizing = useRef(false);
  const resizeStartPos = useRef({ x: 0 });
  const resizeStartWidth = useRef(0);
  
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
    e.preventDefault();
    isResizing.current = true;
    resizeStartPos.current = { x: e.clientX };
    resizeStartWidth.current = width.get();
    
    // Add transparent overlay to prevent dragging issues during resize
    const overlay = document.createElement('div');
    overlay.id = 'resize-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.cursor = 'nwse-resize';
    overlay.style.zIndex = '10000';
    document.body.appendChild(overlay);
  };

  const handleResize = (e) => {
    if (!isResizing.current) return;
    
    // Calculate the dx in the screen coordinates
    const dx = (e.clientX - resizeStartPos.current.x) / scale;
    
    // Update the width based on the start width + dx
    const newWidth = Math.max(resizeStartWidth.current + dx, 300);
    width.set(newWidth);
    
    // Update table width in the table object
    table.width = newWidth;
  };

  const handleResizeEnd = () => {
    if (isResizing.current) {
      isResizing.current = false;
      
      // Remove the overlay
      const overlay = document.getElementById('resize-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    }
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
    >
      <Card className="shadow-md border-2 border-indigo-100 overflow-hidden">
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
              onClick={() => setIsEditing(true)}
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
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil size={14} className="mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy size={14} className="mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
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
                onMoveUp={handleMoveFieldUp}
                onMoveDown={handleMoveFieldDown}
              />
            ))}
          </div>
          
          <div className="p-2 flex bg-slate-50 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs h-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={() => {
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
              onClick={() => setIsAddReferenceOpen(true)}
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
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"
        onMouseDown={handleResizeStart}
      >
        <div className="w-3 h-3 border-b-2 border-r-2 border-indigo-400 absolute bottom-1 right-1" />
      </div>

      <AddReferenceDialog
        open={isAddReferenceOpen}
        onOpenChange={setIsAddReferenceOpen}
        sourceTableId={table.id}
      />
    </motion.div>
  );
};
