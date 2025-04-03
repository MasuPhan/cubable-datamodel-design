
// I'll create this file with the updated field row component
import { useState, useEffect } from "react";
import { useModelContext } from "@/contexts/ModelContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronUp, ChevronDown, MoreVertical, Trash2, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldInfo } from "@/components/FieldInfo";

export const FieldRow = ({ field, tableId, isLast, fieldIndex, onMoveUp, onMoveDown }) => {
  const { updateField, removeField } = useModelContext();
  const [isEditing, setIsEditing] = useState(false);
  const [fieldName, setFieldName] = useState(field.name);
  const [isRequired, setIsRequired] = useState(field.required || false);

  useEffect(() => {
    // Handle keyboard events for moving field up/down
    const handleKeyDown = (e) => {
      // Only act if we're editing this field
      if (!isEditing) return;
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onMoveUp(fieldIndex);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onMoveDown(fieldIndex);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing, fieldIndex, onMoveUp, onMoveDown]);

  const handleNameChange = (e) => {
    setFieldName(e.target.value);
  };

  const handleNameSave = () => {
    updateField(tableId, field.id, { ...field, name: fieldName });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNameSave();
    }
  };

  const handleRequiredChange = (e) => {
    const newValue = e.target.checked;
    setIsRequired(newValue);
    updateField(tableId, field.id, { ...field, required: newValue });
  };

  const getFieldTypeIconColor = () => {
    switch (field.type) {
      case 'text':
        return 'text-blue-500';
      case 'number':
        return 'text-green-500';
      case 'id':
        return 'text-purple-500';
      case 'boolean':
        return 'text-yellow-500';
      case 'date':
        return 'text-pink-500';
      case 'reference':
      case 'referenceTwo':
        return 'text-indigo-500';
      default:
        return 'text-gray-500';
    }
  };

  const getFieldTypeIcon = () => {
    switch (field.type) {
      case 'text':
        return 'Aa';
      case 'number':
        return '123';
      case 'id':
        return '#';
      case 'boolean':
        return '0|1';
      case 'date':
        return '📅';
      case 'reference':
      case 'referenceTwo':
        return '🔗';
      default:
        return '?';
    }
  };

  return (
    <div
      className={cn(
        "flex items-center p-2 border-b border-slate-100 hover:bg-slate-50 transition-colors",
        isLast ? "border-b-0" : ""
      )}
    >
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
        <div 
          className={cn(
            "text-xs font-bold w-6 h-6 flex items-center justify-center rounded",
            getFieldTypeIconColor()
          )}
        >
          {field.isPrimary ? <Key size={14} /> : getFieldTypeIcon()}
        </div>
      </div>
      
      <div className="flex-1 px-2">
        {isEditing ? (
          <Input
            value={fieldName}
            onChange={handleNameChange}
            onBlur={handleNameSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-7 text-sm py-0"
          />
        ) : (
          <div 
            className="text-sm truncate cursor-pointer"
            onClick={() => setIsEditing(true)}
            title={field.name}
          >
            {field.name}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`required-${field.id}`}
            checked={isRequired}
            onChange={handleRequiredChange}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <label htmlFor={`required-${field.id}`} className="text-xs ml-1">Req.</label>
        </div>
        
        <FieldInfo field={field} tableId={tableId} />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => onMoveUp(fieldIndex)} disabled={fieldIndex === 0} className="text-xs">
              <ChevronUp size={14} className="mr-2" />
              Move Up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMoveDown(fieldIndex)} disabled={isLast} className="text-xs">
              <ChevronDown size={14} className="mr-2" />
              Move Down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => removeField(tableId, field.id)} 
              className="text-red-600 text-xs"
            >
              <Trash2 size={14} className="mr-2" />
              Delete Field
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
