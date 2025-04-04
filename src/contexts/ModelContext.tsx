
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  isPrimary?: boolean;
  description?: string;
  defaultValue?: string;
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
  width?: number;
  height?: number;
}

export interface Area {
  id: string;
  title: string;
  color: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

export interface Note {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  width: number;
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

interface ModelState {
  tables: Table[];
  relationships: Relationship[];
  areas: Area[];
  notes: Note[];
  history: { tables: Table[]; relationships: Relationship[]; areas: Area[]; notes: Note[] }[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}

type ModelAction =
  | { type: 'ADD_TABLE'; payload: Table }
  | { type: 'REMOVE_TABLE'; payload: string }
  | { type: 'UPDATE_TABLE_NAME'; payload: { tableId: string; name: string } }
  | { type: 'UPDATE_TABLE_POSITION'; payload: { tableId: string; position: { x: number; y: number } } }
  | { type: 'ADD_FIELD_TO_TABLE'; payload: { tableId: string; field: Field } }
  | { type: 'UPDATE_FIELD'; payload: { tableId: string; fieldId: string; updatedField: Field } }
  | { type: 'REMOVE_FIELD'; payload: { tableId: string; fieldId: string } }
  | { type: 'CREATE_REFERENCE_FIELD'; payload: { sourceTableId: string; targetTableId: string; fieldName: string; isTwoWay: boolean; isMultiple: boolean } }
  | { type: 'ADD_RELATIONSHIP'; payload: Relationship }
  | { type: 'UPDATE_RELATIONSHIP'; payload: { relationshipId: string; updatedRelationship: Relationship } }
  | { type: 'REMOVE_RELATIONSHIP'; payload: string }
  | { type: 'ADD_AREA'; payload: Area }
  | { type: 'UPDATE_AREA'; payload: Area }
  | { type: 'UPDATE_AREA_POSITION'; payload: { areaId: string; position: { x: number; y: number } } }
  | { type: 'REMOVE_AREA'; payload: string }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE_POSITION'; payload: { noteId: string; position: { x: number; y: number } } }
  | { type: 'REMOVE_NOTE'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'IMPORT_MODEL'; payload: { tables: Table[]; relationships: Relationship[]; areas: Area[]; notes: Note[] } };

interface ModelContextType extends ModelState {
  addTable: (table: Table) => void;
  removeTable: (tableId: string) => void;
  updateTableName: (tableId: string, name: string) => void;
  updateTablePosition: (tableId: string, position: { x: number; y: number }) => void;
  addFieldToTable: (tableId: string, field: Field) => void;
  updateField: (tableId: string, fieldId: string, updatedField: Field) => void;
  removeField: (tableId: string, fieldId: string) => void;
  createReferenceField: (sourceTableId: string, targetTableId: string, fieldName: string, isTwoWay: boolean, isMultiple: boolean) => void;
  addRelationship: (relationship: Relationship) => void;
  updateRelationship: (relationshipId: string, updatedRelationship: Relationship) => void;
  removeRelationship: (relationshipId: string) => void;
  undo: () => void;
  redo: () => void;
  importModel: (model: { tables: Table[]; relationships: Relationship[]; areas?: Area[]; notes?: Note[] }) => void;
  exportModel: () => { tables: Table[]; relationships: Relationship[]; areas: Area[]; notes: Note[] };
  // Add new functions for areas and notes
  addArea: (area: Area) => void;
  updateArea: (area: Area) => void;
  updateAreaPosition: (areaId: string, position: { x: number; y: number }) => void;
  removeArea: (areaId: string) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  updateNotePosition: (noteId: string, position: { x: number; y: number }) => void;
  removeNote: (noteId: string) => void;
}

const initialState: ModelState = {
  tables: [],
  relationships: [],
  areas: [],
  notes: [],
  history: [{ tables: [], relationships: [], areas: [], notes: [] }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
};

const saveHistory = (state: ModelState, tables: Table[], relationships: Relationship[], areas: Area[], notes: Note[]): ModelState => {
  const historyCopy = [...state.history.slice(0, state.historyIndex + 1)];
  historyCopy.push({
    tables: JSON.parse(JSON.stringify(tables)),
    relationships: JSON.parse(JSON.stringify(relationships)),
    areas: JSON.parse(JSON.stringify(areas)),
    notes: JSON.parse(JSON.stringify(notes)),
  });
  
  // Limit history to 50 entries
  if (historyCopy.length > 50) {
    historyCopy.shift();
  }
  
  return {
    ...state,
    tables,
    relationships,
    areas,
    notes,
    history: historyCopy,
    historyIndex: historyCopy.length - 1,
    canUndo: historyCopy.length > 1,
    canRedo: false,
  };
};

const modelReducer = (state: ModelState, action: ModelAction): ModelState => {
  switch (action.type) {
    case 'ADD_TABLE':
      return saveHistory(
        state,
        [...state.tables, action.payload],
        state.relationships,
        state.areas,
        state.notes
      );
      
    case 'REMOVE_TABLE': {
      const filteredRelationships = state.relationships.filter(
        (rel) => rel.sourceTableId !== action.payload && rel.targetTableId !== action.payload
      );
      const filteredTables = state.tables.filter((t) => t.id !== action.payload);
      return saveHistory(state, filteredTables, filteredRelationships, state.areas, state.notes);
    }
    
    case 'UPDATE_TABLE_NAME': {
      const updatedTables = state.tables.map((table) =>
        table.id === action.payload.tableId
          ? { ...table, name: action.payload.name }
          : table
      );
      return saveHistory(state, updatedTables, state.relationships, state.areas, state.notes);
    }
    
    case 'UPDATE_TABLE_POSITION': {
      const updatedTables = state.tables.map((table) =>
        table.id === action.payload.tableId
          ? { ...table, position: action.payload.position }
          : table
      );
      // Don't save history for position changes
      return {
        ...state,
        tables: updatedTables,
      };
    }
    
    case 'ADD_FIELD_TO_TABLE': {
      const updatedTables = state.tables.map((table) =>
        table.id === action.payload.tableId
          ? { ...table, fields: [...table.fields, action.payload.field] }
          : table
      );
      return saveHistory(state, updatedTables, state.relationships, state.areas, state.notes);
    }
    
    case 'UPDATE_FIELD': {
      const updatedTables = state.tables.map((table) => {
        if (table.id !== action.payload.tableId) return table;
        return {
          ...table,
          fields: table.fields.map((field) =>
            field.id === action.payload.fieldId ? action.payload.updatedField : field
          )
        };
      });
      return saveHistory(state, updatedTables, state.relationships, state.areas, state.notes);
    }
    
    case 'REMOVE_FIELD': {
      let updatedTables = [...state.tables];
      let updatedRelationships = [...state.relationships];
      
      const sourceTable = updatedTables.find(t => t.id === action.payload.tableId);
      if (sourceTable) {
        const fieldToRemove = sourceTable.fields.find(f => f.id === action.payload.fieldId);
        
        // If this is a reference field that's part of a two-way relationship,
        // we need to remove the linked field in the other table too
        if (fieldToRemove && (fieldToRemove.type === 'reference' || fieldToRemove.type === 'referenceTwo') &&
            fieldToRemove.reference && fieldToRemove.reference.linkedFieldId) {
          const targetTableId = fieldToRemove.reference.tableId;
          const linkedFieldId = fieldToRemove.reference.linkedFieldId;
          
          updatedTables = updatedTables.map(table => {
            if (table.id === targetTableId) {
              return {
                ...table,
                fields: table.fields.filter(f => f.id !== linkedFieldId)
              };
            }
            return table;
          });
        }
        
        // Update the source table to remove the field
        updatedTables = updatedTables.map(table => {
          if (table.id === action.payload.tableId) {
            return {
              ...table,
              fields: table.fields.filter(f => f.id !== action.payload.fieldId)
            };
          }
          return table;
        });
        
        // Remove relationships connected to this field
        updatedRelationships = updatedRelationships.filter(
          (rel) => 
            !(rel.sourceTableId === action.payload.tableId && rel.sourceFieldId === action.payload.fieldId) &&
            !(rel.targetTableId === action.payload.tableId && rel.targetFieldId === action.payload.fieldId)
        );
      }
      
      return saveHistory(state, updatedTables, updatedRelationships, state.areas, state.notes);
    }
    
    case 'CREATE_REFERENCE_FIELD': {
      const { sourceTableId, targetTableId, fieldName, isTwoWay, isMultiple } = action.payload;
      
      let updatedTables = [...state.tables];
      let updatedRelationships = [...state.relationships];
      
      const sourceTable = updatedTables.find(t => t.id === sourceTableId);
      const targetTable = updatedTables.find(t => t.id === targetTableId);
      
      if (!sourceTable || !targetTable) return state;
      
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
      
      // Update source table with the new field
      updatedTables = updatedTables.map(table => {
        if (table.id === sourceTableId) {
          return {
            ...table,
            fields: [...table.fields, sourceField]
          };
        }
        return table;
      });
      
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
        
        // Update target table with the new field
        updatedTables = updatedTables.map(table => {
          if (table.id === targetTableId) {
            return {
              ...table,
              fields: [...table.fields, targetField]
            };
          }
          return table;
        });
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
      
      // Add the relationship
      updatedRelationships = [...updatedRelationships, relationship];
      
      return saveHistory(state, updatedTables, updatedRelationships, state.areas, state.notes);
    }
    
    case 'ADD_RELATIONSHIP':
      return saveHistory(
        state,
        state.tables,
        [...state.relationships, action.payload],
        state.areas,
        state.notes
      );
      
    case 'UPDATE_RELATIONSHIP': {
      const updatedRelationships = state.relationships.map((rel) =>
        rel.id === action.payload.relationshipId ? action.payload.updatedRelationship : rel
      );
      return saveHistory(state, state.tables, updatedRelationships, state.areas, state.notes);
    }
    
    case 'REMOVE_RELATIONSHIP': {
      const filteredRelationships = state.relationships.filter((r) => r.id !== action.payload);
      return saveHistory(state, state.tables, filteredRelationships, state.areas, state.notes);
    }

    // Area actions
    case 'ADD_AREA':
      return saveHistory(
        state,
        state.tables,
        state.relationships,
        [...state.areas, action.payload],
        state.notes
      );

    case 'UPDATE_AREA': {
      const updatedAreas = state.areas.map((area) =>
        area.id === action.payload.id ? action.payload : area
      );
      return saveHistory(state, state.tables, state.relationships, updatedAreas, state.notes);
    }

    case 'UPDATE_AREA_POSITION': {
      const updatedAreas = state.areas.map((area) =>
        area.id === action.payload.areaId
          ? { ...area, position: action.payload.position }
          : area
      );
      // Don't save history for position changes
      return {
        ...state,
        areas: updatedAreas,
      };
    }

    case 'REMOVE_AREA': {
      const filteredAreas = state.areas.filter((a) => a.id !== action.payload);
      return saveHistory(state, state.tables, state.relationships, filteredAreas, state.notes);
    }

    // Note actions
    case 'ADD_NOTE':
      return saveHistory(
        state,
        state.tables,
        state.relationships,
        state.areas,
        [...state.notes, action.payload]
      );

    case 'UPDATE_NOTE': {
      const updatedNotes = state.notes.map((note) =>
        note.id === action.payload.id ? action.payload : note
      );
      return saveHistory(state, state.tables, state.relationships, state.areas, updatedNotes);
    }

    case 'UPDATE_NOTE_POSITION': {
      const updatedNotes = state.notes.map((note) =>
        note.id === action.payload.noteId
          ? { ...note, position: action.payload.position }
          : note
      );
      // Don't save history for position changes
      return {
        ...state,
        notes: updatedNotes,
      };
    }

    case 'REMOVE_NOTE': {
      const filteredNotes = state.notes.filter((n) => n.id !== action.payload);
      return saveHistory(state, state.tables, state.relationships, state.areas, filteredNotes);
    }
    
    case 'UNDO': {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const historicState = state.history[newIndex];
        return {
          ...state,
          tables: JSON.parse(JSON.stringify(historicState.tables)),
          relationships: JSON.parse(JSON.stringify(historicState.relationships)),
          areas: JSON.parse(JSON.stringify(historicState.areas)),
          notes: JSON.parse(JSON.stringify(historicState.notes)),
          historyIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: true,
        };
      }
      return state;
    }
    
    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const historicState = state.history[newIndex];
        return {
          ...state,
          tables: JSON.parse(JSON.stringify(historicState.tables)),
          relationships: JSON.parse(JSON.stringify(historicState.relationships)),
          areas: JSON.parse(JSON.stringify(historicState.areas)),
          notes: JSON.parse(JSON.stringify(historicState.notes)),
          historyIndex: newIndex,
          canUndo: true,
          canRedo: newIndex < state.history.length - 1,
        };
      }
      return state;
    }
    
    case 'IMPORT_MODEL':
      return saveHistory(
        state,
        action.payload.tables || [],
        action.payload.relationships || [],
        action.payload.areas || [],
        action.payload.notes || []
      );
      
    default:
      return state;
  }
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(modelReducer, initialState);

  const addTable = (table: Table) => {
    dispatch({ type: 'ADD_TABLE', payload: table });
  };

  const removeTable = (tableId: string) => {
    dispatch({ type: 'REMOVE_TABLE', payload: tableId });
  };

  const updateTableName = (tableId: string, name: string) => {
    dispatch({ type: 'UPDATE_TABLE_NAME', payload: { tableId, name } });
  };

  const updateTablePosition = (tableId: string, position: { x: number; y: number }) => {
    dispatch({ type: 'UPDATE_TABLE_POSITION', payload: { tableId, position } });
  };

  const addFieldToTable = (tableId: string, field: Field) => {
    dispatch({ type: 'ADD_FIELD_TO_TABLE', payload: { tableId, field } });
  };

  const updateField = (tableId: string, fieldId: string, updatedField: Field) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { tableId, fieldId, updatedField } });
  };

  const removeField = (tableId: string, fieldId: string) => {
    dispatch({ type: 'REMOVE_FIELD', payload: { tableId, fieldId } });
  };

  const createReferenceField = (sourceTableId: string, targetTableId: string, fieldName: string, isTwoWay: boolean, isMultiple: boolean) => {
    dispatch({ type: 'CREATE_REFERENCE_FIELD', payload: { sourceTableId, targetTableId, fieldName, isTwoWay, isMultiple } });
  };

  const addRelationship = (relationship: Relationship) => {
    dispatch({ type: 'ADD_RELATIONSHIP', payload: relationship });
  };

  const updateRelationship = (relationshipId: string, updatedRelationship: Relationship) => {
    dispatch({ type: 'UPDATE_RELATIONSHIP', payload: { relationshipId, updatedRelationship } });
  };

  const removeRelationship = (relationshipId: string) => {
    dispatch({ type: 'REMOVE_RELATIONSHIP', payload: relationshipId });
  };

  // Area functions
  const addArea = (area: Area) => {
    dispatch({ type: 'ADD_AREA', payload: area });
  };

  const updateArea = (area: Area) => {
    dispatch({ type: 'UPDATE_AREA', payload: area });
  };

  const updateAreaPosition = (areaId: string, position: { x: number; y: number }) => {
    dispatch({ type: 'UPDATE_AREA_POSITION', payload: { areaId, position } });
  };

  const removeArea = (areaId: string) => {
    dispatch({ type: 'REMOVE_AREA', payload: areaId });
  };

  // Note functions
  const addNote = (note: Note) => {
    dispatch({ type: 'ADD_NOTE', payload: note });
  };

  const updateNote = (note: Note) => {
    dispatch({ type: 'UPDATE_NOTE', payload: note });
  };

  const updateNotePosition = (noteId: string, position: { x: number; y: number }) => {
    dispatch({ type: 'UPDATE_NOTE_POSITION', payload: { noteId, position } });
  };

  const removeNote = (noteId: string) => {
    dispatch({ type: 'REMOVE_NOTE', payload: noteId });
  };

  const undo = () => {
    dispatch({ type: 'UNDO' });
  };

  const redo = () => {
    dispatch({ type: 'REDO' });
  };

  const importModel = (model: { tables: Table[]; relationships: Relationship[]; areas?: Area[]; notes?: Note[] }) => {
    dispatch({ type: 'IMPORT_MODEL', payload: { 
      tables: model.tables || [],
      relationships: model.relationships || [],
      areas: model.areas || [],
      notes: model.notes || []
    }});
  };

  const exportModel = () => {
    const { tables, relationships, areas, notes } = state;
    return { 
      tables: JSON.parse(JSON.stringify(tables)), 
      relationships: JSON.parse(JSON.stringify(relationships)),
      areas: JSON.parse(JSON.stringify(areas)),
      notes: JSON.parse(JSON.stringify(notes))
    };
  };

  const value = {
    ...state,
    addTable,
    removeTable,
    updateTableName,
    updateTablePosition,
    addFieldToTable,
    updateField,
    removeField,
    createReferenceField,
    addRelationship,
    updateRelationship,
    removeRelationship,
    addArea,
    updateArea,
    updateAreaPosition,
    removeArea,
    addNote,
    updateNote,
    updateNotePosition,
    removeNote,
    undo,
    redo,
    importModel,
    exportModel,
  };

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
};

export const useModelContext = (): ModelContextType => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModelContext must be used within a ModelProvider');
  }
  return context;
};
