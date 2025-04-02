
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fieldTypeCategories } from "@/lib/fieldTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const FieldTypePalette = ({ setIsDraggingField }) => {
  const isMobile = useIsMobile();
  
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
    <Card className="absolute left-4 top-4 w-[250px] shadow-md z-10 bg-white/90 backdrop-blur-md">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm">Loại trường dữ liệu</CardTitle>
        <p className="text-xs text-gray-500">
          Kéo loại trường vào bảng để thêm
        </p>
      </CardHeader>
      
      <CardContent className="p-2">
        <Tabs defaultValue="basic">
          <TabsList className="w-full h-8 mb-2">
            {Object.keys(fieldTypeCategories).map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs h-7">
                {fieldTypeCategories[category].label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(fieldTypeCategories).map(([category, { types }]) => (
            <TabsContent key={category} value={category} className="m-0">
              <div className="grid grid-cols-2 gap-1">
                {types.map((fieldType) => {
                  const TypeIcon = fieldType.icon;
                  return (
                    <div
                      key={fieldType.value}
                      draggable
                      onDragStart={(e) => handleDragStart(e, fieldType.value)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "flex items-center gap-1 p-2 rounded-md cursor-move",
                        "text-xs hover:bg-indigo-50 transition-colors"
                      )}
                    >
                      <TypeIcon size={14} className="text-indigo-600" />
                      <span className="truncate">{fieldType.label}</span>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
