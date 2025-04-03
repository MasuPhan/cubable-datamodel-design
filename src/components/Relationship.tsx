
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const sourceWidth = sourceTable.width || 300;
  const targetWidth = targetTable.width || 300;
  
  const sourceCenter = {
    x: sourcePos.x + sourceWidth / 2,
    y: sourcePos.y + 40,  // Approximate half of table header height
  };
  
  const targetCenter = {
    x: targetPos.x + targetWidth / 2,
    y: targetPos.y + 40,  // Approximate half of table header height
  };

  // Calculate path
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return null;
  
  const midX = (sourceCenter.x + targetCenter.x) / 2;
  const midY = (sourceCenter.y + targetCenter.y) / 2;
  
  // Add some curvature to the path
  const curvature = 0.2;
  const controlPoint = {
    x: midX + curvature * dy,
    y: midY - curvature * dx
  };
  
  const sourceField = sourceTable.fields.find(f => f.id === relationship.sourceFieldId);
  const targetField = relationship.targetFieldId 
    ? targetTable.fields.find(f => f.id === relationship.targetFieldId) 
    : null;
  
  const getRelationshipType = () => {
    if (relationship.type === "oneToOne") return "1:1";
    if (relationship.type === "oneToMany") return "1:N";
    if (relationship.type === "manyToOne") return "N:1";
    if (relationship.type === "manyToMany") return "N:N";
    return "";
  };

  const getRelationshipDetails = () => {
    const sourceFieldName = sourceField?.name || "Unknown";
    const targetFieldName = targetField?.name || "Unknown";
    
    if (relationship.isReference) {
      return relationship.isTwoWay 
        ? `Two-way Reference: ${sourceTable.name}.${sourceFieldName} ↔ ${targetTable.name}.${targetFieldName}`
        : `One-way Reference: ${sourceTable.name}.${sourceFieldName} → ${targetTable.name}`;
    }
    
    return `${sourceTable.name}.${sourceFieldName} → ${targetTable.name}.${targetFieldName}`;
  };

  const pathId = `path-${relationship.id}`;

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
          
          {relationship.isTwoWay && (
            <marker
              id={`arrow-back-${relationship.id}`}
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-purple-500" />
            </marker>
          )}
        </defs>
        
        {/* Main relationship line */}
        <path
          id={pathId}
          d={`M${sourceCenter.x},${sourceCenter.y} Q${controlPoint.x},${controlPoint.y} ${targetCenter.x},${targetCenter.y}`}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={relationship.isReference ? "0" : "4"} 
          className={relationship.isReference 
            ? (relationship.isTwoWay ? "text-purple-600" : "text-indigo-600") 
            : "text-indigo-400"}
          markerEnd={`url(#arrow-${relationship.id})`}
          markerStart={relationship.isTwoWay ? `url(#arrow-back-${relationship.id})` : ""}
        />
        
        <TooltipProvider>
          <foreignObject
            x={midX - 60}
            y={midY - 15}
            width="120" 
            height="30"
          >
            <div className="flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "bg-white border rounded-full px-3 py-0.5 text-xs flex items-center justify-center shadow-sm",
                      relationship.isTwoWay 
                        ? "border-purple-200 text-purple-700" 
                        : "border-indigo-200 text-indigo-700"
                    )}
                  >
                    <span className="mr-1">
                      {relationship.isTwoWay 
                        ? <ArrowLeftRight className="inline-block w-3 h-3 mr-1" /> 
                        : <ArrowRight className="inline-block w-3 h-3 mr-1" />}
                    </span>
                    {relationship.isReference 
                      ? (relationship.isTwoWay ? "Two-way Ref" : "One-way Ref") 
                      : getRelationshipType()}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-xs p-2 max-w-[300px] bg-white border shadow-sm">
                  {getRelationshipDetails()}
                </TooltipContent>
              </Tooltip>
            </div>
          </foreignObject>
        </TooltipProvider>
      </svg>
    </div>
  );
};
