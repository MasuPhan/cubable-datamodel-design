
import React, { useState } from "react";
import { fieldTypes } from "@/lib/fieldTypes";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const FieldTypePalette = ({ setIsDraggingField, onFieldTypeSelect, selectedTableId }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Group field types by category
  const fieldTypeCategories = {
    all: fieldTypes,
    basic: fieldTypes.filter(f => ["text", "longText", "email", "number", "checkbox", "date", "select"].includes(f.value)),
    advanced: fieldTypes.filter(f => ["image", "file", "json", "formula", "richText", "url", "phone", "currency"].includes(f.value))
  };
  
  // Filter field types by search query
  const filteredFieldTypes = fieldTypeCategories[activeTab].filter(fieldType => 
    fieldType.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fieldType.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.setData("fieldType", fieldType);
    e.dataTransfer.effectAllowed = "copy";
    setIsDraggingField(true);
  };

  const handleDragEnd = () => {
    setIsDraggingField(false);
  };

  const handleFieldTypeClick = (fieldType) => {
    onFieldTypeSelect(fieldType);
    const action = selectedTableId ? "added to existing table" : "created with new table";
    toast({
      title: `Field type ${fieldType} selected`,
      description: `${fieldType} field ${action}`
    });
  };

  return (
    <div className="bg-white w-[280px] h-auto rounded-l-lg border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Field Types</h3>
        <div className="relative mb-2">
          <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search field types..." 
            className="pl-8 h-8 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 h-8">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <ScrollArea className="h-[400px] p-3 pb-6">
        <div className="grid grid-cols-2 gap-2">
          {filteredFieldTypes.length > 0 ? (
            filteredFieldTypes.map((field) => (
              <div
                key={field.value}
                draggable
                onDragStart={(e) => handleDragStart(e, field.value)}
                onDragEnd={handleDragEnd}
                onClick={() => handleFieldTypeClick(field.value)}
                className="flex flex-col items-center bg-slate-50 hover:bg-slate-100 
                           rounded-md p-3 cursor-pointer border border-slate-200 
                           transition-colors duration-200"
              >
                <div className="text-indigo-600 mb-2">
                  <field.icon size={20} />
                </div>
                <span className="text-xs font-medium text-center text-slate-700 truncate max-w-full">
                  {field.label}
                </span>
                <Badge 
                  variant="outline" 
                  className="mt-1 text-[10px] h-4 px-1 border-indigo-200 text-indigo-700 bg-indigo-50"
                >
                  {field.value}
                </Badge>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
              No field types match your search
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
