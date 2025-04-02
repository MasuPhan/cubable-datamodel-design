import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ChevronDown, GripVertical, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldTypes, getFieldIcon } from "@/lib/fieldTypes";
import { useModelContext } from "@/contexts/ModelContext";

export const FieldRow = ({ field, tableId, isLast }) => {
  const { updateField, removeField } = useModelContext();
  const [isEditingName, setIsEditingName] = useState(false);
  const [fieldName, setFieldName] = useState(field.name);
  
  const FieldIcon = getFieldIcon(field.type);

  const handleFieldNameChange = (e) => {
    setFieldName(e.target.value);
  };

  const saveFieldName = () => {
    updateField(tableId, field.id, { ...field, name: fieldName });
    setIsEditingName(false);
  };

  const handleFieldNameKeyDown = (e) => {
    if (e.key === "Enter") {
      saveFieldName();
    }
  };

  const handleTypeChange = (type) => {
    updateField(tableId, field.id, { ...field, type });
  };

  const handleRequiredChange = (checked) => {
    updateField(tableId, field.id, { ...field, required: checked });
  };

  const handleUniqueChange = (checked) => {
    updateField(tableId, field.id, { ...field, unique: checked });
  };

  const handleDeleteField = () => {
    removeField(tableId, field.id);
  };

  return (
    <div 
      className={cn(
        "flex items-center p-2 hover:bg-slate-50 border-b border-slate-100 gap-1",
        isLast && "border-b-0"
      )}
    >
      <div className="cursor-move px-1">
        <GripVertical size={14} className="text-gray-400" />
      </div>
      
      {isEditingName ? (
        <Input
          value={fieldName}
          onChange={handleFieldNameChange}
          onBlur={saveFieldName}
          onKeyDown={handleFieldNameKeyDown}
          autoFocus
          className="h-7 text-xs flex-1 py-0"
        />
      ) : (
        <div 
          className="flex-1 text-xs px-1 cursor-text truncate"
          onClick={() => setIsEditingName(true)}
          title={field.name}
        >
          {field.name}
        </div>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs px-2 flex items-center gap-1"
          >
            <FieldIcon size={14} className="text-gray-600" />
            <span className="truncate max-w-[80px]">
              {fieldTypes.find(t => t.value === field.type)?.label || field.type}
            </span>
            <ChevronDown size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
          {fieldTypes.map((type) => {
            const TypeIcon = getFieldIcon(type.value);
            return (
              <DropdownMenuItem 
                key={type.value} 
                onSelect={() => handleTypeChange(type.value)}
                className="flex items-center gap-2"
              >
                <TypeIcon size={14} className="text-gray-600" />
                <span>{type.label}</span>
                {field.type === type.value && (
                  <Check size={14} className="ml-auto text-green-600" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1 pl-1">
        <div className="flex items-center gap-1" title="Bắt buộc">
          <Checkbox
            id={`required-${field.id}`}
            checked={field.required}
            onCheckedChange={handleRequiredChange}
            className="h-3 w-3"
          />
          <label htmlFor={`required-${field.id}`} className="text-[10px] text-gray-500 cursor-pointer">
            R
          </label>
        </div>
        
        <div className="flex items-center gap-1" title="Duy nhất">
          <Checkbox
            id={`unique-${field.id}`}
            checked={field.unique}
            onCheckedChange={handleUniqueChange}
            className="h-3 w-3"
          />
          <label htmlFor={`unique-${field.id}`} className="text-[10px] text-gray-500 cursor-pointer">
            U
          </label>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDeleteField}
        className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
        disabled={field.type === "id" && field.name === "ID"}
      >
        <Trash2 size={12} />
      </Button>
    </div>
  );
};
