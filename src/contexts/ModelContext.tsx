import React, { createContext, useState, useContext } from 'react';
import { Table, Field, Relationship, Area, Note } from '@/lib/types';

interface ModelContextType {
  tables: Table[];
  relationships: Relationship[];
  areas: Area[];
  notes: Note[];
  addTable: (table: Table) => void;
  removeTable: (id: string) => void;
  updateTablePosition: (id: string, position: { x: number; y: number }) => void;
  updateTableName: (id: string, name: string) => void;
  addFieldToTable: (tableId: string, field: Field) => void;
  updateField: (tableId: string, fieldId: string, updatedField: Partial<Field>) => void;
  updateTable: (id: string, updatedTable: Partial<Table>) => void;
  removeField: (tableId: string, fieldId: string) => void;
  addRelationship: (relationship: Relationship) => void;
  removeRelationship: (id: string) => void;
  updateRelationship: (id: string, updatedRelationship: Partial<Relationship>) => void;
  addArea: (area: Area) => void;
  removeArea: (id: string) => void;
  updateArea: (updatedArea: Area) => void;
  updateAreaPosition: (id: string, position: { x: number; y: number }) => void;
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  updateNote: (updatedNote: Note) => void;
  updateNotePosition: (id: string, position: { x: number; y: number }) => void;
  moveLayerUp: (itemId: string, type: 'table' | 'area' | 'note') => void;
  moveLayerDown: (itemId: string, type: 'table' | 'area' | 'note') => void;
  
  // Add the missing properties/methods
  createReferenceField: (sourceTableId: string, targetTableId: string, fieldName: string, isTwoWay: boolean, isMultiple: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  importModel: (data: any) => void;
  exportModel: () => any;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

interface ModelProviderProps {
  children: React.ReactNode;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const addTable = (table: Table) => {
    setTables(prevTables => [...prevTables, table]);
  };

  const removeTable = (id: string) => {
    setTables(prevTables => prevTables.filter(table => table.id !== id));
  };

  const updateTablePosition = (id: string, position: { x: number; y: number }) => {
    setTables(prevTables =>
      prevTables.map(table => table.id === id ? { ...table, position: position } : table)
    );
  };

  const updateTableName = (id: string, name: string) => {
    setTables(prevTables =>
      prevTables.map(table => table.id === id ? { ...table, name: name } : table)
    );
  };
  
  const updateTable = (id: string, updatedTable: Partial<Table>) => {
    setTables(prevTables =>
      prevTables.map(table => table.id === id ? { ...table, ...updatedTable } : table)
    );
  };

  const addFieldToTable = (tableId: string, field: Field) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId ? { ...table, fields: [...(table.fields || []), field] } : table
      )
    );
  };

  const updateField = (tableId: string, fieldId: string, updatedField: Partial<Field>) => {
    setTables(prevTables =>
      prevTables.map(table => {
        if (table.id === tableId) {
          const updatedFields = table.fields?.map(field =>
            field.id === fieldId ? { ...field, ...updatedField } : field
          ) || [];
          return { ...table, fields: updatedFields };
        }
        return table;
      })
    );
  };

  const removeField = (tableId: string, fieldId: string) => {
    setTables(prevTables =>
      prevTables.map(table => {
        if (table.id === tableId) {
          const updatedFields = table.fields?.filter(field => field.id !== fieldId) || [];
          return { ...table, fields: updatedFields };
        }
        return table;
      })
    );
  };

  const addRelationship = (relationship: Relationship) => {
    setRelationships(prevRelationships => [...prevRelationships, relationship]);
  };

  const removeRelationship = (id: string) => {
    setRelationships(prevRelationships => prevRelationships.filter(relationship => relationship.id !== id));
  };

  const updateRelationship = (id: string, updatedRelationship: Partial<Relationship>) => {
    setRelationships(prevRelationships =>
      prevRelationships.map(relationship =>
        relationship.id === id ? { ...relationship, ...updatedRelationship } : relationship
      )
    );
  };

  const addArea = (area: Area) => {
    setAreas(prevAreas => [...prevAreas, area]);
  };

  const removeArea = (id: string) => {
    setAreas(prevAreas => prevAreas.filter(area => area.id !== id));
  };

  const updateArea = (updatedArea: Area) => {
    setAreas(prevAreas =>
      prevAreas.map(area => area.id === updatedArea.id ? updatedArea : area)
    );
  };

  const updateAreaPosition = (id: string, position: { x: number; y: number }) => {
    setAreas(prevAreas =>
      prevAreas.map(area => area.id === id ? { ...area, position: position } : area)
    );
  };

  const addNote = (note: Note) => {
    setNotes(prevNotes => [...prevNotes, note]);
  };

  const removeNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prevNotes =>
      prevNotes.map(note => note.id === updatedNote.id ? updatedNote : note)
    );
  };

  const updateNotePosition = (id: string, position: { x: number; y: number }) => {
    setNotes(prevNotes =>
      prevNotes.map(note => note.id === id ? { ...note, position: position } : note)
    );
  };
  
  const moveLayerUp = (itemId: string, type: 'table' | 'area' | 'note') => {
    const updateZIndex = (items: any[], id: string, increment: number) => {
      const itemIndex = items.findIndex(item => item.id === id);
      if (itemIndex === -1) return items;
  
      // If it's already the top item, don't do anything
      if (increment > 0 && itemIndex === items.length - 1) return items;
      if (increment < 0 && itemIndex === 0) return items;
  
      const newItems = [...items];
      const temp = newItems[itemIndex];
      
      // Swap items
      const targetIndex = itemIndex + increment;
      newItems[itemIndex] = newItems[targetIndex];
      newItems[targetIndex] = temp;
  
      return newItems.map((item, index) => ({ ...item, zIndex: index + 1 }));
    };
  
    switch (type) {
      case 'table':
        setTables(prevTables => {
          const updatedTables = updateZIndex([...prevTables], itemId, 1);
          return updatedTables;
        });
        break;
      case 'area':
        setAreas(prevAreas => {
          const updatedAreas = updateZIndex([...prevAreas], itemId, 1);
          return updatedAreas;
        });
        break;
      case 'note':
        setNotes(prevNotes => {
          const updatedNotes = updateZIndex([...prevNotes], itemId, 1);
          return updatedNotes;
        });
        break;
      default:
        break;
    }
  };
  
  const moveLayerDown = (itemId: string, type: 'table' | 'area' | 'note') => {
    const updateZIndex = (items: any[], id: string, increment: number) => {
      const itemIndex = items.findIndex(item => item.id === id);
      if (itemIndex === -1) return items;
  
      // If it's already the top item, don't do anything
      if (increment > 0 && itemIndex === items.length - 1) return items;
      if (increment < 0 && itemIndex === 0) return items;
  
      const newItems = [...items];
      const temp = newItems[itemIndex];
      
      // Swap items
      const targetIndex = itemIndex + increment;
      newItems[itemIndex] = newItems[targetIndex];
      newItems[targetIndex] = temp;
  
      return newItems.map((item, index) => ({ ...item, zIndex: index + 1 }));
    };
  
    switch (type) {
      case 'table':
        setTables(prevTables => {
          const updatedTables = updateZIndex([...prevTables], itemId, -1);
          return updatedTables;
        });
        break;
      case 'area':
        setAreas(prevAreas => {
          const updatedAreas = updateZIndex([...prevAreas], itemId, -1);
          return updatedAreas;
        });
        break;
      case 'note':
        setNotes(prevNotes => {
          const updatedNotes = updateZIndex([...prevNotes], itemId, -1);
          return updatedNotes;
        });
        break;
      default:
        break;
    }
  };

  const createReferenceField = (sourceTableId: string, targetTableId: string, fieldName: string, isTwoWay: boolean, isMultiple: boolean) => {
    const refId = `ref-${Date.now()}`;
    const sourceField = {
      id: `field-${Date.now()}-src`,
      name: fieldName,
      type: isTwoWay ? 'referenceTwo' : 'reference',
      required: false,
      unique: false,
      isPrimary: false,
      description: `Reference to ${targetTableId}`,
      defaultValue: '',
    };
    
    // Add the field to source table
    addFieldToTable(sourceTableId, sourceField);
    
    // Create the relationship
    addRelationship({
      id: refId,
      sourceTableId,
      sourceFieldId: sourceField.id,
      targetTableId,
      isReference: true,
      isTwoWay
    });
    
    // If it's a two-way reference, add the corresponding field to the target table
    if (isTwoWay) {
      const targetTable = tables.find(t => t.id === targetTableId);
      if (targetTable) {
        const sourceTable = tables.find(t => t.id === sourceTableId);
        if (sourceTable) {
          const targetField = {
            id: `field-${Date.now()}-target`,
            name: sourceTable.name,
            type: 'referenceTwo',
            required: false,
            unique: false,
            isPrimary: false,
            description: `Reference to ${sourceTableId}`,
            defaultValue: '',
          };
          
          addFieldToTable(targetTableId, targetField);
        }
      }
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      setTables(previousState.tables);
      setRelationships(previousState.relationships);
      setAreas(previousState.areas);
      setNotes(previousState.notes);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setTables(nextState.tables);
      setRelationships(nextState.relationships);
      setAreas(nextState.areas);
      setNotes(nextState.notes);
    }
  };
  
  const importModel = (data: any) => {
    if (data.tables) setTables(data.tables);
    if (data.relationships) setRelationships(data.relationships);
    if (data.areas) setAreas(data.areas);
    if (data.notes) setNotes(data.notes);
    
    // Add to history
    const newState = {
      tables: data.tables || [],
      relationships: data.relationships || [],
      areas: data.areas || [],
      notes: data.notes || []
    };
    
    setHistory([...history.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(historyIndex + 1);
  };
  
  const exportModel = () => {
    return {
      tables,
      relationships,
      areas,
      notes
    };
  };
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const value: ModelContextType = {
    tables,
    relationships,
    areas,
    notes,
    addTable,
    removeTable,
    updateTablePosition,
    updateTableName,
    addFieldToTable,
    updateField,
    updateTable,
    removeField,
    addRelationship,
    removeRelationship,
    updateRelationship,
    addArea,
    removeArea,
    updateArea,
    updateAreaPosition,
    addNote,
    removeNote,
    updateNote,
    updateNotePosition,
    moveLayerUp,
    moveLayerDown,
    createReferenceField,
    undo,
    redo,
    canUndo,
    canRedo,
    importModel,
    exportModel
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModelContext = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModelContext must be used within a ModelProvider");
  }
  return context;
};
