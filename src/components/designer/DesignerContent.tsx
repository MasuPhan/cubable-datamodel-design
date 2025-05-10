
import { Relationship } from "@/components/Relationship";
import { TableCard } from "@/components/TableCard";
import { CanvasArea } from "@/components/CanvasArea";
import { CanvasNote } from "@/components/CanvasNote";
import { Table, Relationship as RelationshipType, Area, Note } from "@/lib/types";

interface DesignerContentProps {
  areas: Area[];
  relationships: RelationshipType[];
  tables: Table[];
  notes: Note[];
  scale: number;
  onAreaDragEnd: (id: string, dragInfo: any) => void;
  onAreaUpdate: (area: Area) => void;
  onAreaDelete: (id: string) => void;
  onTableDragEnd: (id: string, position: { x: number; y: number }) => void;
  onNoteDragEnd: (id: string, dragInfo: any) => void;
  onNoteUpdate: (note: Note) => void;
  onNoteDelete: (id: string) => void;
  onMoveLayerUp: (id: string) => void;
  onMoveLayerDown: (id: string) => void;
}

export const DesignerContent = ({
  areas,
  relationships,
  tables,
  notes,
  scale,
  onAreaDragEnd,
  onAreaUpdate,
  onAreaDelete,
  onTableDragEnd,
  onNoteDragEnd,
  onNoteUpdate,
  onNoteDelete,
  onMoveLayerUp,
  onMoveLayerDown
}: DesignerContentProps) => {
  return (
    <>
      {/* Layer 1: Areas go at the bottom layer */}
      {areas && areas.length > 0 && areas.map((area) => (
        <CanvasArea
          key={area.id}
          area={area}
          onDragEnd={(_, info) => onAreaDragEnd(area.id, info)}
          onUpdate={(updatedArea) => onAreaUpdate(updatedArea)}
          onDelete={(areaId) => onAreaDelete(areaId)}
          onMoveLayerUp={onMoveLayerUp}
          onMoveLayerDown={onMoveLayerDown}
          scale={scale}
        />
      ))}
      
      {/* Layer 2: Relationships */}
      {relationships && relationships.length > 0 && relationships.map((rel) => (
        <Relationship key={rel.id} relationship={rel} tables={tables} />
      ))}
      
      {/* Layer 3: Tables */}
      {tables && tables.length > 0 && tables.map((table) => (
        <TableCard 
          key={table.id}
          table={table}
          onDragEnd={(_, info) => {
            onTableDragEnd(
              table.id, 
              {
                x: table.position.x + info.offset.x / scale,
                y: table.position.y + info.offset.y / scale
              }
            );
          }}
          scale={scale}
          onMoveLayerUp={(tableId) => onMoveLayerUp(tableId)}
          onMoveLayerDown={(tableId) => onMoveLayerDown(tableId)}
        />
      ))}
      
      {/* Layer 4: Notes go on the top layer */}
      {notes && notes.length > 0 && notes.map((note) => (
        <CanvasNote
          key={note.id}
          note={note}
          onDragEnd={(_, info) => onNoteDragEnd(note.id, info)}
          onUpdate={(updatedNote) => onNoteUpdate(updatedNote)}
          onDelete={(noteId) => onNoteDelete(noteId)}
          onMoveLayerUp={onMoveLayerUp}
          onMoveLayerDown={onMoveLayerDown}
          scale={scale}
        />
      ))}
    </>
  );
};
