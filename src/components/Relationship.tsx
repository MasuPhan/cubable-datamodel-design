
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export const Relationship = ({ relationship, tables }) => {
  const sourceTable = tables.find((t) => t.id === relationship.sourceTableId);
  const targetTable = tables.find((t) => t.id === relationship.targetTableId);

  const sourcePos = sourceTable?.position;
  const targetPos = targetTable?.position;

  // Don't render if we're missing source or target
  if (!sourceTable || !targetTable || !sourcePos || !targetPos) {
    return null;
  }

  // Calculate position of source and target table centers
  const sourceCenter = {
    x: sourcePos.x + 150, // Half of table width
    y: sourcePos.y + 40,  // Approximate half of table header height
  };
  
  const targetCenter = {
    x: targetPos.x + 150, // Half of table width
    y: targetPos.y + 40,  // Approximate half of table header height
  };

  // Calculate path
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return null;
  
  const midX = (sourceCenter.x + targetCenter.x) / 2;
  const midY = (sourceCenter.y + targetCenter.y) / 2;
  
  // Calculate arrow direction for marker
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  const sourceField = sourceTable.fields.find(f => f.id === relationship.sourceFieldId);
  const targetField = targetTable.fields.find(f => f.id === relationship.targetFieldId);
  
  const getRelationshipType = () => {
    if (relationship.type === "oneToOne") return "1:1";
    if (relationship.type === "oneToMany") return "1:N";
    if (relationship.type === "manyToOne") return "N:1";
    if (relationship.type === "manyToMany") return "N:N";
    return "";
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <marker
            id={`arrow-${relationship.id}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-indigo-500" />
          </marker>
        </defs>
        <path
          d={`M${sourceCenter.x},${sourceCenter.y} L${targetCenter.x},${targetCenter.y}`}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4"
          className="text-indigo-400"
          markerEnd={`url(#arrow-${relationship.id})`}
        />
        
        <foreignObject
          x={midX - 25}
          y={midY - 12}
          width="50" 
          height="24"
        >
          <div 
            className="bg-white border border-indigo-200 rounded-full px-2 py-0.5 text-xs flex items-center justify-center text-indigo-700 shadow-sm"
          >
            {getRelationshipType()}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
};
