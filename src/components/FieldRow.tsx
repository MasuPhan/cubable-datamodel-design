
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Trash2, 
  ChevronDown, 
  GripVertical, 
  Check, 
  Link, 
  ArrowRight, 
  Database, 
  ArrowLeftRight, 
  Flag,
  KeyRound,
  ArrowUp,
  ArrowDown,
  Info 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldTypes, getFieldIcon } from "@/lib/fieldTypes";
import { useModelContext } from "@/contexts/ModelContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const FieldRow = ({ field, tableId, isLast, fieldIndex, onMoveUp, onMoveDown }) => {
  const { tables, updateField, removeField } = useModelContext();
  const [isEditingName, setIsEditingName] = useState(false);
  const [fieldName, setFieldName] = useState(field.name);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [description, setDescription] = useState(field.description || "");
  const [defaultValue, setDefaultValue] = useState(field.defaultValue || "");
  
  const FieldIcon = getFieldIcon(field.type);
  const isReference = field.type === 'reference' || field.type === 'referenceTwo';
  const targetTable = isReference && field.reference?.tableId 
    ? tables.find(t => t.id === field.reference.tableId)
    : null;

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
    if (isReference && type !== 'reference' && type !== 'referenceTwo') {
      // If changing from reference type to non-reference type,
      // clear the reference data
      const updatedField = { 
        ...field, 
        type,
        reference: undefined
      };
      updateField(tableId, field.id, updatedField);
    } else {
      updateField(tableId, field.id, { ...field, type });
    }
  };

  const handleRequiredChange = (checked) => {
    updateField(tableId, field.id, { ...field, required: checked });
  };

  const handleUniqueChange = (checked) => {
    updateField(tableId, field.id, { ...field, unique: checked });
  };

  const handlePrimaryChange = (checked) => {
    updateField(tableId, field.id, { ...field, isPrimary: checked });
  };

  const handleDeleteField = () => {
    removeField(tableId, field.id);
  };

  const handleSaveDescription = () => {
    updateField(tableId, field.id, { ...field, description, defaultValue });
    setIsDescriptionOpen(false);
  };

  const handleRowKeyDown = (e) => {
    // Only handle arrow keys for non-input interactions
    if (isEditingName) return;
    
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onMoveUp(fieldIndex);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onMoveDown(fieldIndex);
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center p-2 hover:bg-slate-50 border-b border-slate-100 gap-1",
        isLast && "border-b-0",
        field.isPrimary && "bg-indigo-50"
      )}
      tabIndex={0}
      onKeyDown={handleRowKeyDown}
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
          {field.isPrimary && <KeyRound size={12} className="inline mr-1 text-indigo-600" />}
          {field.name}
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={12} className="inline ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{field.description}</p>
                  {field.defaultValue && (
                    <p className="text-xs text-gray-500 mt-1">Default: {field.defaultValue}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-7 text-xs px-2 flex items-center gap-1",
              isReference && "text-blue-600"  
            )}
          >
            <FieldIcon size={14} className={isReference ? "text-blue-500" : "text-gray-600"} />
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

      {isReference && targetTable && (
        <div className="flex items-center">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
            {field.type === 'referenceTwo' ? (
              <ArrowLeftRight size={10} />
            ) : (
              <ArrowRight size={10} />
            )}
            <span className="truncate max-w-[50px]" title={targetTable.name}>
              {targetTable.name}
            </span>
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-1 pl-1">
        <div className="flex items-center gap-1" title="Required">
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
        
        <div className="flex items-center gap-1" title="Unique">
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

        <div className="flex items-center gap-1" title="Primary Key">
          <Checkbox
            id={`primary-${field.id}`}
            checked={field.isPrimary}
            onCheckedChange={handlePrimaryChange}
            className="h-3 w-3"
          />
          <label htmlFor={`primary-${field.id}`} className="text-[10px] text-gray-500 cursor-pointer">
            P
          </label>
        </div>
      </div>

      <Popover open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
          >
            <Info size={12} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Field Properties</h4>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-8 text-xs"
                placeholder="Enter field description"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Default Value</label>
              <Input
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                className="h-8 text-xs"
                placeholder="Enter default value"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsDescriptionOpen(false)}
                className="text-xs h-7"
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveDescription}
                className="text-xs h-7"
              >
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMoveUp(fieldIndex)}
          disabled={fieldIndex === 0}
          className="h-6 w-6 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
          title="Move Up"
        >
          <ArrowUp size={12} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMoveDown(fieldIndex)}
          disabled={isLast}
          className="h-6 w-6 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
          title="Move Down"
        >
          <ArrowDown size={12} />
        </Button>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDeleteField}
        className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
        disabled={field.type === "id" && field.name === "ID" && field.isPrimary}
      >
        <Trash2 size={12} />
      </Button>
    </div>
  );
};
