
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeftRight, CornerDownRight, CornerUpRight } from "lucide-react";
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
  
  // Get the collapsed state of tables if it exists
  const sourceCollapsed = sourceTable.isCollapsed || false;
  const targetCollapsed = targetTable.isCollapsed || false;
  
  // Calculate table heights based on fields and collapsed state
  const sourceHeight = sourceCollapsed ? 50 : (sourceTable.fields.length * 40 + 80);
  const targetHeight = targetCollapsed ? 50 : (targetTable.fields.length * 40 + 80);
  
  // Calculate source and target center positions
  const sourceCenter = {
    x: sourcePos.x + sourceWidth / 2,
    y: sourcePos.y + sourceHeight / 2,
  };
  
  const targetCenter = {
    x: targetPos.x + targetWidth / 2,
    y: targetPos.y + targetHeight / 2,
  };

  // Calculate midpoints for orthogonal path
  const midX = (sourceCenter.x + targetCenter.x) / 2;
  
  // Create orthogonal path
  const path = useMemo(() => {
    // Determine which sides of the tables to connect
    const sourceLeft = sourcePos.x;
    const sourceRight = sourcePos.x + sourceWidth;
    const sourceTop = sourcePos.y;
    const sourceBottom = sourcePos.y + sourceHeight;

    const targetLeft = targetPos.x;
    const targetRight = targetPos.x + targetWidth;
    const targetTop = targetPos.y;
    const targetBottom = targetPos.y + targetHeight;
    
    // Determine if horizontal or vertical connection makes more sense
    const horizontalDistance = Math.abs(sourceCenter.x - targetCenter.x);
    const verticalDistance = Math.abs(sourceCenter.y - targetCenter.y);
    
    // Points for the path
    let points = [];
    
    // Choose horizontal or vertical as the main direction based on distance
    if (horizontalDistance > verticalDistance) {
      // Horizontal arrangement - connect sides
      if (sourceCenter.x < targetCenter.x) {
        // Source is to the left of target
        points = [
          { x: sourceRight, y: sourceCenter.y },
          { x: midX, y: sourceCenter.y },
          { x: midX, y: targetCenter.y },
          { x: targetLeft, y: targetCenter.y }
        ];
      } else {
        // Source is to the right of target
        points = [
          { x: sourceLeft, y: sourceCenter.y },
          { x: midX, y: sourceCenter.y },
          { x: midX, y: targetCenter.y },
          { x: targetRight, y: targetCenter.y }
        ];
      }
    } else {
      // Vertical arrangement - connect top/bottom
      if (sourceCenter.y < targetCenter.y) {
        // Source is above target
        points = [
          { x: sourceCenter.x, y: sourceBottom },
          { x: sourceCenter.x, y: (sourceBottom + targetTop) / 2 },
          { x: targetCenter.x, y: (sourceBottom + targetTop) / 2 },
          { x: targetCenter.x, y: targetTop }
        ];
      } else {
        // Source is below target
        points = [
          { x: sourceCenter.x, y: sourceTop },
          { x: sourceCenter.x, y: (targetBottom + sourceTop) / 2 },
          { x: targetCenter.x, y: (targetBottom + sourceTop) / 2 },
          { x: targetCenter.x, y: targetBottom }
        ];
      }
    }
    
    return points;
  }, [sourcePos, targetPos, sourceWidth, targetWidth, sourceHeight, targetHeight]);
  
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

  // Generate SVG path string from points
  const pathString = path.length > 0 ? 
    `M${path[0].x},${path[0].y} L${path[1].x},${path[1].y} L${path[2].x},${path[2].y} L${path[3].x},${path[3].y}` : '';

  // Find appropriate position for the relationship label
  const labelPosition = path.length > 1 ? {
    x: (path[1].x + path[2].x) / 2 - 60,
    y: (path[1].y + path[2].y) / 2 - 15
  } : { x: 0, y: 0 };

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
        
        {/* Orthogonal relationship line */}
        <path
          id={pathId}
          d={pathString}
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
            x={labelPosition.x}
            y={labelPosition.y}
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
                        : <CornerDownRight className="inline-block w-3 h-3 mr-1" />}
                    </span>
                    {relationship.isReference 
                      ? (relationship.isTwoWay ? "Two-way Ref" : "One-way Ref") 
                      : getRelationshipType()}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-xs p-2 max-w-[300px]">
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
