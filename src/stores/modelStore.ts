
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

export interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  options?: Record<string, any>;
  reference?: {
    tableId: string;
    isTwoWay: boolean;
    isMultiple: boolean;
    linkedFieldId?: string;
  };
}

export interface Table {
  id: string;
  name: string;
  fields: Field[];
  position: { x: number; y: number };
}

export interface Relationship {
  id: string;
  sourceTableId: string;
  sourceFieldId: string;
  targetTableId: string;
  targetFieldId?: string;
  type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  isReference: boolean;
  isTwoWay: boolean;
}

export interface ModelState {
  tables: Table[];
  relationships: Relationship[];
  history: { tables: Table[]; relationships: Relationship[] }[];
  historyIndex: number;
  
  // Table actions
  addTable: (table: Table) => void;
  removeTable: (tableId: string) => void;
  updateTableName: (tableId: string, name: string) => void;
  updateTablePosition: (tableId: string, position: { x: number; y: number }) => void;
  
  // Field actions
  addFieldToTable: (tableId: string, field: Field) => void;
  updateField: (tableId: string, fieldId: string, updatedField: Field) => void;
  removeField: (tableId: string, fieldId: string) => void;
  
  // Reference field specific actions
  createReferenceField: (sourceTableId: string, targetTableId: string, fieldName: string, isTwoWay: boolean, isMultiple: boolean) => void;
  
  // Relationship actions
  addRelationship: (relationship: Relationship) => void;
  updateRelationship: (relationshipId: string, updatedRelationship: Relationship) => void;
  removeRelationship: (relationshipId: string) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Import/Export
  importModel: (model: { tables: Table[]; relationships: Relationship[] }) => void;
  exportModel: () => { tables: Table[]; relationships: Relationship[] };
}

const saveHistory = (state: ModelState) => {
  const historyCopy = [...state.history.slice(0, state.historyIndex + 1)];
  historyCopy.push({
    tables: JSON.parse(JSON.stringify(state.tables)),
    relationships: JSON.parse(JSON.stringify(state.relationships)),
  });
  
  // Limit history to 50 entries
  if (historyCopy.length > 50) {
    historyCopy.shift();
  }
  
  state.history = historyCopy;
  state.historyIndex = historyCopy.length - 1;
  state.canUndo = state.historyIndex > 0;
  state.canRedo = state.historyIndex < state.history.length - 1;
};

export const useModelStore = create<ModelState>()(
  devtools(
    immer((set, get) => ({
      tables: [],
      relationships: [],
      history: [{ tables: [], relationships: [] }],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
      
      // Table actions
      addTable: (table) => set((state) => {
        state.tables.push(table);
        saveHistory(state);
      }),
      
      removeTable: (tableId) => set((state) => {
        // Remove relationships connected to this table
        state.relationships = state.relationships.filter(
          (rel) => rel.sourceTableId !== tableId && rel.targetTableId !== tableId
        );
        
        // Remove the table
        state.tables = state.tables.filter((t) => t.id !== tableId);
        saveHistory(state);
      }),
      
      updateTableName: (tableId, name) => set((state) => {
        const table = state.tables.find((t) => t.id === tableId);
        if (table) {
          table.name = name;
          saveHistory(state);
        }
      }),
      
      updateTablePosition: (tableId, position) => set((state) => {
        const table = state.tables.find((t) => t.id === tableId);
        if (table) {
          table.position = position;
          // Don't save history for position changes to avoid too many history entries
        }
      }),
      
      // Field actions
      addFieldToTable: (tableId, field) => set((state) => {
        const table = state.tables.find((t) => t.id === tableId);
        if (table) {
          table.fields.push(field);
          saveHistory(state);
        }
      }),
      
      updateField: (tableId, fieldId, updatedField) => set((state) => {
        const table = state.tables.find((t) => t.id === tableId);
        if (table) {
          const fieldIndex = table.fields.findIndex((f) => f.id === fieldId);
          if (fieldIndex !== -1) {
            table.fields[fieldIndex] = updatedField;
            saveHistory(state);
          }
        }
      }),
      
      removeField: (tableId, fieldId) => set((state) => {
        const table = state.tables.find((t) => t.id === tableId);
        if (table) {
          const fieldToRemove = table.fields.find(f => f.id === fieldId);
          
          // If this is a reference field that's part of a two-way relationship,
          // we need to remove the linked field in the other table too
          if (fieldToRemove && (fieldToRemove.type === 'reference' || fieldToRemove.type === 'referenceTwo') &&
              fieldToRemove.reference && fieldToRemove.reference.linkedFieldId) {
            const targetTableId = fieldToRemove.reference.tableId;
            const linkedFieldId = fieldToRemove.reference.linkedFieldId;
            
            const targetTable = state.tables.find(t => t.id === targetTableId);
            if (targetTable) {
              targetTable.fields = targetTable.fields.filter(f => f.id !== linkedFieldId);
            }
          }
          
          // Remove the field
          table.fields = table.fields.filter((f) => f.id !== fieldId);
          
          // Remove relationships connected to this field
          state.relationships = state.relationships.filter(
            (rel) => 
              !(rel.sourceTableId === tableId && rel.sourceFieldId === fieldId) &&
              !(rel.targetTableId === tableId && rel.targetFieldId === fieldId)
          );
          
          saveHistory(state);
        }
      }),
      
      // Reference field specific action
      createReferenceField: (sourceTableId, targetTableId, fieldName, isTwoWay, isMultiple) => set((state) => {
        const sourceTable = state.tables.find(t => t.id === sourceTableId);
        const targetTable = state.tables.find(t => t.id === targetTableId);
        
        if (!sourceTable || !targetTable) return;
        
        // Create unique IDs for the fields and relationship
        const sourceFieldId = `field-${Date.now()}-source`;
        const targetFieldId = `field-${Date.now()}-target`;
        const relationshipId = `rel-${Date.now()}`;
        
        // Create the source field
        const sourceField: Field = {
          id: sourceFieldId,
          name: fieldName,
          type: isTwoWay ? 'referenceTwo' : 'reference',
          required: false,
          unique: false,
          reference: {
            tableId: targetTableId,
            isTwoWay,
            isMultiple,
            linkedFieldId: isTwoWay ? targetFieldId : undefined
          }
        };
        
        // Add field to source table
        sourceTable.fields.push(sourceField);
        
        // For two-way references, create the target field
        if (isTwoWay) {
          const targetField: Field = {
            id: targetFieldId,
            name: `${fieldName} (from ${sourceTable.name})`,
            type: 'referenceTwo',
            required: false,
            unique: false,
            reference: {
              tableId: sourceTableId,
              isTwoWay: true,
              isMultiple: true, // Two-way references always allow multiple records
              linkedFieldId: sourceFieldId
            }
          };
          
          // Add field to target table
          targetTable.fields.push(targetField);
        }
        
        // Create the relationship
        const relationship: Relationship = {
          id: relationshipId,
          sourceTableId,
          sourceFieldId,
          targetTableId,
          targetFieldId: isTwoWay ? targetFieldId : undefined,
          // Determine the relationship type based on multiplicity
          type: isMultiple 
            ? (isTwoWay ? 'manyToMany' : 'oneToMany')
            : (isTwoWay ? 'manyToOne' : 'oneToOne'),
          isReference: true,
          isTwoWay
        };
        
        // Add relationship
        state.relationships.push(relationship);
        
        saveHistory(state);
      }),
      
      // Relationship actions
      addRelationship: (relationship) => set((state) => {
        state.relationships.push(relationship);
        saveHistory(state);
      }),
      
      updateRelationship: (relationshipId, updatedRelationship) => set((state) => {
        const index = state.relationships.findIndex((r) => r.id === relationshipId);
        if (index !== -1) {
          state.relationships[index] = updatedRelationship;
          saveHistory(state);
        }
      }),
      
      removeRelationship: (relationshipId) => set((state) => {
        state.relationships = state.relationships.filter((r) => r.id !== relationshipId);
        saveHistory(state);
      }),
      
      // History actions
      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--;
          const historicState = state.history[state.historyIndex];
          state.tables = JSON.parse(JSON.stringify(historicState.tables));
          state.relationships = JSON.parse(JSON.stringify(historicState.relationships));
          state.canUndo = state.historyIndex > 0;
          state.canRedo = true;
        }
      }),
      
      redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          const historicState = state.history[state.historyIndex];
          state.tables = JSON.parse(JSON.stringify(historicState.tables));
          state.relationships = JSON.parse(JSON.stringify(historicState.relationships));
          state.canUndo = true;
          state.canRedo = state.historyIndex < state.history.length - 1;
        }
      }),
      
      // Import/Export
      importModel: (model) => set((state) => {
        state.tables = model.tables || [];
        state.relationships = model.relationships || [];
        saveHistory(state);
      }),
      
      exportModel: () => {
        const { tables, relationships } = get();
        return { 
          tables: JSON.parse(JSON.stringify(tables)), 
          relationships: JSON.parse(JSON.stringify(relationships))
        };
      },
    }))
  )
);
