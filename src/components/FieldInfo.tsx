
import { useState } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useModelContext } from "@/contexts/ModelContext";

export const FieldInfo = ({ field, tableId }) => {
  const { updateField } = useModelContext();
  const [description, setDescription] = useState(field.description || "");
  const [defaultValue, setDefaultValue] = useState(field.defaultValue || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isPrimary, setIsPrimary] = useState(field.isPrimary || false);
  const [isUnique, setIsUnique] = useState(field.unique || false);

  const handleSave = () => {
    updateField(tableId, field.id, {
      ...field,
      description,
      defaultValue,
      isPrimary,
      unique: isUnique
    });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className="ml-1 text-gray-500 hover:text-indigo-600 focus:outline-none"
          title="Field properties"
        >
          <Info size={14} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Field Properties</h4>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this field..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultValue">Default Value</Label>
            <Input 
              id="defaultValue"
              value={defaultValue} 
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Default value (optional)"
            />
          </div>
          
          <div className="flex space-x-6 pt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 mr-2"
              />
              <label htmlFor="isPrimary" className="text-sm font-medium">Primary Key</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isUnique"
                checked={isUnique}
                onChange={(e) => setIsUnique(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 mr-2"
              />
              <label htmlFor="isUnique" className="text-sm font-medium">Unique</label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
