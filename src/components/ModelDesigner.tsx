
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { TableCard } from "@/components/TableCard";
import { Relationship } from "@/components/Relationship";
import { FieldTypePalette } from "@/components/FieldTypePalette";
import { cn } from "@/lib/utils";
import { useModelContext } from "@/contexts/ModelContext";

export const ModelDesigner = () => {
  const { tables, relationships, updateTablePosition, addFieldToTable } = useModelContext();
  const [isDraggingField, setIsDraggingField] = useState(false);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });

  const handleTableDragEnd = (id, newPosition) => {
    updateTablePosition(id, newPosition);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prevScale => Math.min(Math.max(prevScale * delta, 0.5), 2));
    } else {
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || e.button === 2 || e.ctrlKey) {
      e.preventDefault();
      setIsPanning(true);
      setStartPanPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPosition({
        x: e.clientX - startPanPos.x,
        y: e.clientY - startPanPos.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData("fieldType");
    if (!fieldType) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - position.x / scale;
    const y = (e.clientY - rect.top) / scale - position.y / scale;
    
    // Find the table (if any) under the drop position
    const droppedOnTable = tables.find(table => {
      const tableLeft = table.position.x;
      const tableRight = table.position.x + 300;
      const tableTop = table.position.y;
      const tableBottom = table.position.y + 40 + table.fields.length * 40; // Approximate height
      
      return x >= tableLeft && x <= tableRight && y >= tableTop && y <= tableBottom;
    });
    
    if (droppedOnTable) {
      // Add field to the table
      addFieldToTable(droppedOnTable.id, {
        id: `field-${Date.now()}`,
        name: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
        type: fieldType,
        required: false,
        unique: false,
      });
    }
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-slate-50"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <FieldTypePalette setIsDraggingField={setIsDraggingField} />
      
      <div
        className={cn(
          "absolute inset-0 transition-opacity", 
          isDraggingField && "bg-blue-100 bg-opacity-30"
        )}
      >
        <div 
          className="absolute w-full h-full"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: "0 0"
          }}
        >
          <div className="absolute inset-0 grid grid-cols-[repeat(50,20px)] grid-rows-[repeat(50,20px)] opacity-20">
            {Array.from({ length: 50 }).map((_, row) => (
              Array.from({ length: 50 }).map((_, col) => (
                <div 
                  key={`${row}-${col}`}
                  className="border-[0.5px] border-slate-300"
                />
              ))
            ))}
          </div>
          
          {relationships.map((rel) => (
            <Relationship key={rel.id} relationship={rel} tables={tables} />
          ))}
          
          {tables.map((table) => (
            <TableCard 
              key={table.id}
              table={table}
              onDragEnd={(_, info) => {
                handleTableDragEnd(
                  table.id, 
                  {
                    x: table.position.x + info.offset.x / scale,
                    y: table.position.y + info.offset.y / scale
                  }
                );
              }}
              scale={scale}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
