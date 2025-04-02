
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, MoreVertical, Trash2, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldRow } from "@/components/FieldRow";
import { useModelContext } from "@/contexts/ModelContext";

export const TableCard = ({ table, onDragEnd, scale }) => {
  const { updateTableName, removeTable, addFieldToTable } = useModelContext();
  const [isEditing, setIsEditing] = useState(false);
  const [tableName, setTableName] = useState(table.name);

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
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={onDragEnd}
      initial={{ x: table.position.x, y: table.position.y }}
      animate={{ x: table.position.x, y: table.position.y }}
      style={{ position: "absolute", width: "300px" }}
      className="cursor-move"
    >
      <Card className="shadow-md border-2 border-indigo-100">
        <CardHeader className="p-3 bg-indigo-50 flex flex-row items-center space-y-0 gap-2">
          <div className="cursor-move pr-2">
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
              className="text-sm flex-1 font-medium"
              onClick={() => setIsEditing(true)}
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil size={14} className="mr-2" />
                Rename
              </DropdownMenuItem>
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
              />
            ))}
          </div>
          
          <div className="p-2 bg-slate-50 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={() => {
                addFieldToTable(table.id, {
                  id: `field-${Date.now()}`,
                  name: "New Field",
                  type: "text",
                  required: false,
                  unique: false,
                });
              }}
            >
              <Plus size={14} className="mr-1" />
              Add Field
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
