
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CanvasGrid } from "./CanvasGrid";

interface DesignerCanvasProps {
  children: ReactNode;
  isDraggingField: boolean;
  scale: number;
  position: { x: number; y: number };
  canvasSize: { width: string; height: string };
  isGridVisible: boolean;
}

export const DesignerCanvas = ({
  children,
  isDraggingField,
  scale,
  position,
  canvasSize,
  isGridVisible
}: DesignerCanvasProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity", 
        isDraggingField && "bg-blue-100 bg-opacity-30"
      )}
      style={{ minHeight: canvasSize.height, minWidth: canvasSize.width }}
    >
      <div 
        className="absolute w-full h-full"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transformOrigin: "0 0",
          minHeight: canvasSize.height,
          minWidth: canvasSize.width
        }}
      >
        <CanvasGrid isGridVisible={isGridVisible} canvasSize={canvasSize} />
        {children}
      </div>
    </div>
  );
};
