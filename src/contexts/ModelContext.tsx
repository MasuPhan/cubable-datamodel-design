
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  options?: Record<string, any>;
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
  targetFieldId: string;
  type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
}

interface ModelState {
  tables: Table[];
  relationships: Relationship[];
  history: { tables: Table[]; relationships: Relationship[] }[];
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
  | { type: 'ADD_RELATIONSHIP'; payload: Relationship }
  | { type: 'UPDATE_RELATIONSHIP'; payload: { relationshipId: string; updatedRelationship: Relationship } }
  | { type: 'REMOVE_RELATIONSHIP'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'IMPORT_MODEL'; payload: { tables: Table[]; relationships: Relationship[] } };

interface ModelContextType extends ModelState {
  addTable: (table: Table) => void;
  removeTable: (tableId: string) => void;
  updateTableName: (tableId: string, name: string) => void;
  updateTablePosition: (tableId: string, position: { x: number; y: number }) => void;
  addFieldToTable: (tableId: string, field: Field) => void;
  updateField: (tableId: string, fieldId: string, updatedField: Field) => void;
  removeField: (tableId: string, fieldId: string) => void;
  addRelationship: (relationship: Relationship) => void;
  updateRelationship: (relationshipId: string, updatedRelationship: Relationship) => void;
  removeRelationship: (relationshipId: string) => void;
  undo: () => void;
  redo: () => void;
  importModel: (model: { tables: Table[]; relationships: Relationship[] }) => void;
  exportModel: () => { tables: Table[]; relationships: Relationship[] };
}

const initialState: ModelState = {
  tables: [],
  relationships: [],
  history: [{ tables: [], relationships: [] }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
};

const saveHistory = (state: ModelState, tables: Table[], relationships: Relationship[]): ModelState => {
  const historyCopy = [...state.history.slice(0, state.historyIndex + 1)];
  historyCopy.push({
    tables: JSON.parse(JSON.stringify(tables)),
    relationships: JSON.parse(JSON.stringify(relationships)),
  });
  
  // Limit history to 50 entries
  if (historyCopy.length > 50) {
    historyCopy.shift();
  }
  
  return {
    ...state,
    tables,
    relationships,
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
        state.relationships
      );
      
    case 'REMOVE_TABLE': {
      const filteredRelationships = state.relationships.filter(
        (rel) => rel.sourceTableId !== action.payload && rel.targetTableId !== action.payload
      );
      const filteredTables = state.tables.filter((t) => t.id !== action.payload);
      return saveHistory(state, filteredTables, filteredRelationships);
    }
    
    case 'UPDATE_TABLE_NAME': {
      const updatedTables = state.tables.map((table) =>
        table.id === action.payload.tableId
          ? { ...table, name: action.payload.name }
          : table
      );
      return saveHistory(state, updatedTables, state.relationships);
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
      return saveHistory(state, updatedTables, state.relationships);
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
      return saveHistory(state, updatedTables, state.relationships);
    }
    
    case 'REMOVE_FIELD': {
      const updatedTables = state.tables.map((table) => {
        if (table.id !== action.payload.tableId) return table;
        return {
          ...table,
          fields: table.fields.filter((field) => field.id !== action.payload.fieldId)
        };
      });
      
      // Remove relationships connected to this field
      const updatedRelationships = state.relationships.filter(
        (rel) =>
          !(rel.sourceTableId === action.payload.tableId && rel.sourceFieldId === action.payload.fieldId) &&
          !(rel.targetTableId === action.payload.tableId && rel.targetFieldId === action.payload.fieldId)
      );
      
      return saveHistory(state, updatedTables, updatedRelationships);
    }
    
    case 'ADD_RELATIONSHIP':
      return saveHistory(
        state,
        state.tables,
        [...state.relationships, action.payload]
      );
      
    case 'UPDATE_RELATIONSHIP': {
      const updatedRelationships = state.relationships.map((rel) =>
        rel.id === action.payload.relationshipId ? action.payload.updatedRelationship : rel
      );
      return saveHistory(state, state.tables, updatedRelationships);
    }
    
    case 'REMOVE_RELATIONSHIP': {
      const filteredRelationships = state.relationships.filter((r) => r.id !== action.payload);
      return saveHistory(state, state.tables, filteredRelationships);
    }
    
    case 'UNDO': {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const historicState = state.history[newIndex];
        return {
          ...state,
          tables: JSON.parse(JSON.stringify(historicState.tables)),
          relationships: JSON.parse(JSON.stringify(historicState.relationships)),
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
        action.payload.relationships || []
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

  const addRelationship = (relationship: Relationship) => {
    dispatch({ type: 'ADD_RELATIONSHIP', payload: relationship });
  };

  const updateRelationship = (relationshipId: string, updatedRelationship: Relationship) => {
    dispatch({ type: 'UPDATE_RELATIONSHIP', payload: { relationshipId, updatedRelationship } });
  };

  const removeRelationship = (relationshipId: string) => {
    dispatch({ type: 'REMOVE_RELATIONSHIP', payload: relationshipId });
  };

  const undo = () => {
    dispatch({ type: 'UNDO' });
  };

  const redo = () => {
    dispatch({ type: 'REDO' });
  };

  const importModel = (model: { tables: Table[]; relationships: Relationship[] }) => {
    dispatch({ type: 'IMPORT_MODEL', payload: model });
  };

  const exportModel = () => {
    const { tables, relationships } = state;
    return { 
      tables: JSON.parse(JSON.stringify(tables)), 
      relationships: JSON.parse(JSON.stringify(relationships))
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
    addRelationship,
    updateRelationship,
    removeRelationship,
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
