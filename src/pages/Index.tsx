
import { useState } from "react";
import { ModelDesigner } from "@/components/ModelDesigner";
import { ModelHeader } from "@/components/ModelHeader";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <ModelHeader />
      <div className="flex-1 overflow-hidden">
        <ModelDesigner />
      </div>
    </div>
  );
};

export default Index;
