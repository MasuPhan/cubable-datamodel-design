
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useModelContext } from "@/contexts/ModelContext";
import { Database } from "lucide-react";

export function AddReferenceDialog({
  open,
  onOpenChange,
  sourceTableId,
}) {
  const { tables, createReferenceField } = useModelContext();
  const [selectedTableId, setSelectedTableId] = useState("");
  const [fieldName, setFieldName] = useState("Reference");
  const [isTwoWay, setIsTwoWay] = useState(false);
  const [isMultiple, setIsMultiple] = useState(true);
  
  const sourceTable = tables.find(t => t.id === sourceTableId);
  const availableTables = tables.filter(t => t.id !== sourceTableId);
  
  useEffect(() => {
    if (open && availableTables.length > 0) {
      setSelectedTableId(availableTables[0].id);
    }
  }, [open, availableTables]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (sourceTableId && selectedTableId && fieldName.trim()) {
      createReferenceField(
        sourceTableId,
        selectedTableId,
        fieldName.trim(),
        isTwoWay,
        isMultiple
      );
      onOpenChange(false);
    }
  };
  
  if (!sourceTable) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database size={16} />
            Add Reference Field to {sourceTable.name}
          </DialogTitle>
          <DialogDescription>
            Create a reference field to connect this table to another table.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fieldName">Field Name</Label>
            <Input
              id="fieldName"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="Enter field name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Target Table</Label>
            {availableTables.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2">
                No other tables available. Create another table first.
              </div>
            ) : (
              <RadioGroup
                value={selectedTableId}
                onValueChange={setSelectedTableId}
                className="grid grid-cols-2 gap-2"
              >
                {availableTables.map((table) => (
                  <div key={table.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={table.id} id={table.id} />
                    <Label htmlFor={table.id} className="cursor-pointer">
                      {table.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Reference Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 border rounded-md p-3 relative">
                <RadioGroup
                  value={isTwoWay ? "twoWay" : "oneWay"}
                  onValueChange={(v) => setIsTwoWay(v === "twoWay")}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oneWay" id="oneWay" />
                    <Label htmlFor="oneWay" className="cursor-pointer">
                      One-way Reference
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="twoWay" id="twoWay" />
                    <Label htmlFor="twoWay" className="cursor-pointer">
                      Two-way Reference
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex flex-col gap-2 border rounded-md p-3 relative">
                <div className="flex items-center space-x-2 mb-1">
                  <Switch
                    id="multiple"
                    checked={isMultiple}
                    onCheckedChange={setIsMultiple}
                    disabled={isTwoWay} // Always multiple for 2-way references
                  />
                  <Label htmlFor="multiple" className="cursor-pointer">
                    Multiple Records
                  </Label>
                </div>
                
                <span className="text-xs text-slate-500">
                  {isMultiple 
                    ? "Allow selecting multiple records" 
                    : "Allow selecting only one record"}
                </span>
                
                {isTwoWay && isMultiple === false && (
                  <div className="text-xs text-amber-600 mt-1">
                    Note: Two-way references always use multiple records.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={availableTables.length === 0}>
              Create Reference Field
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
