
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fieldTypeCategories } from "@/lib/fieldTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const FieldTypePalette = ({ setIsDraggingField }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);
  
  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.setData("fieldType", fieldType);
    setIsDraggingField(true);
  };
  
  const handleDragEnd = () => {
    setIsDraggingField(false);
  };
  
  if (isMobile) {
    return null; // Hide on mobile for now
  }

  return (
    <Card className="absolute left-4 top-4 w-[300px] shadow-md z-10 bg-white/90 backdrop-blur-md">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <div className="flex items-center justify-between p-3 pb-0">
          <CardTitle className="text-sm">Field Types</CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <CardHeader className="p-3 pb-0 pt-1">
            <p className="text-xs text-gray-500">
              Drag field types to the table to add
            </p>
          </CardHeader>
          
          <CardContent className="p-2">
            <Tabs defaultValue="basic">
              <TabsList className="w-full h-8 mb-2">
                <TabsTrigger value="basic" className="text-xs h-7">
                  Basic
                </TabsTrigger>
                <TabsTrigger value="business" className="text-xs h-7">
                  Business
                </TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs h-7">
                  Advanced
                </TabsTrigger>
              </TabsList>
              
              {Object.entries(fieldTypeCategories).map(([category, { label, types }]) => (
                <TabsContent key={category} value={category} className="m-0">
                  <div className="grid grid-cols-1 gap-1">
                    {types.map((fieldType) => {
                      const TypeIcon = fieldType.icon;
                      return (
                        <div
                          key={fieldType.value}
                          draggable
                          onDragStart={(e) => handleDragStart(e, fieldType.value)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-move",
                            "text-xs hover:bg-slate-100 transition-colors"
                          )}
                        >
                          <div 
                            className="w-8 h-8 rounded flex items-center justify-center" 
                            style={{ backgroundColor: `${fieldType.color}20` }}
                          >
                            <TypeIcon size={18} style={{ color: fieldType.color }} />
                          </div>
                          <span className="truncate">{fieldType.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
