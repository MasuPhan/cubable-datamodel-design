import { create } from 'zustand';
import { Table, Relationship, Area, Note } from '@/lib/types';

interface ModelState {
  tables: Table[];
  relationships: Relationship[];
  areas: Area[];
  notes: Note[];
  addTable: (table: Table) => void;
  updateTablePosition: (id: string, position: { x: number; y: number }) => void;
  updateTableName: (id: string, name: string) => void;
  removeTable: (id: string) => void;
  addFieldToTable: (tableId: string, field: any) => void;
  updateField: (tableId: string, fieldId: string, updatedField: any) => void;
  removeField: (tableId: string, fieldId: string) => void;
  addRelationship: (relationship: Relationship) => void;
  removeRelationship: (id: string) => void;
  addArea: (area: Area) => void;
  updateArea: (area: Area) => void;
  removeArea: (id: string) => void;
  updateAreaPosition: (id: string, position: { x: number; y: number }) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  removeNote: (id: string) => void;
  updateNotePosition: (id: string, position: { x: number; y: number }) => void;
  moveLayerUp: (itemId: string, type: 'note' | 'area' | 'table') => void;
  moveLayerDown: (itemId: string, type: 'note' | 'area' | 'table') => void;
  updateTable: (id: string, updatedTable: Partial<Table>) => void;
}

const useModelStore = create<ModelState>((set) => ({
  tables: [],
  relationships: [],
  areas: [],
  notes: [],
  addTable: (table) => set((state) => ({ tables: [...state.tables, table] })),
  updateTablePosition: (id, position) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === id ? { ...table, position: position } : table
      ),
    })),
  updateTableName: (id, name) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === id ? { ...table, name: name } : table
      ),
    })),
  removeTable: (id) =>
    set((state) => ({
      tables: state.tables.filter((table) => table.id !== id),
      relationships: state.relationships.filter(
        (relationship) =>
          relationship.sourceTableId !== id && relationship.targetTableId !== id
      ),
    })),
  addFieldToTable: (tableId, field) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId ? { ...table, fields: [...(table.fields || []), field] } : table
      ),
    })),
  updateField: (tableId, fieldId, updatedField) =>
    set((state) => ({
      tables: state.tables.map((table) => {
        if (table.id === tableId) {
          const updatedFields = table.fields?.map((field) =>
            field.id === fieldId ? { ...field, ...updatedField } : field
          ) || [];
          return { ...table, fields: updatedFields };
        }
        return table;
      }),
    })),
  removeField: (tableId, fieldId) =>
    set((state) => ({
      tables: state.tables.map((table) => {
        if (table.id === tableId) {
          const updatedFields = table.fields?.filter((field) => field.id !== fieldId) || [];
          return { ...table, fields: updatedFields };
        }
        return table;
      }),
      relationships: state.relationships.filter(
        (relationship) =>
          !(relationship.sourceTableId === tableId && relationship.sourceFieldId === fieldId) &&
          !(relationship.targetTableId === tableId && relationship.targetFieldId === fieldId)
      ),
    })),
  addRelationship: (relationship) =>
    set((state) => ({ relationships: [...state.relationships, relationship] })),
  removeRelationship: (id) =>
    set((state) => ({
      relationships: state.relationships.filter((relationship) => relationship.id !== id),
    })),
  addArea: (area) => set((state) => ({ areas: [...state.areas, area] })),
  updateArea: (area) =>
    set((state) => ({
      areas: state.areas.map((a) => (a.id === area.id ? { ...a, ...area } : a)),
    })),
  removeArea: (id) =>
    set((state) => ({ areas: state.areas.filter((area) => area.id !== id) })),
  updateAreaPosition: (id, position) =>
    set((state) => ({
      areas: state.areas.map((area) =>
        area.id === id ? { ...area, position: position } : area
      ),
    })),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  updateNote: (note) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === note.id ? { ...n, ...note } : n)),
    })),
  removeNote: (id) =>
    set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
  updateNotePosition: (id, position) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, position: position } : note
      ),
    })),
  moveLayerUp: (itemId, type) => {
    set(state => {
      let items;
      switch (type) {
        case 'note':
          items = [...state.notes];
          break;
        case 'area':
          items = [...state.areas];
          break;
        case 'table':
          items = [...state.tables];
          break;
        default:
          console.warn('Unknown type for moveLayerUp:', type);
          return state;
      }

      const index = items.findIndex(item => item.id === itemId);
      if (index === -1 || index === items.length - 1) {
        return state; // Item not found or already on top
      }

      // Swap zIndex with the item above
      const tempZIndex = items[index].zIndex;
      items[index].zIndex = items[index + 1].zIndex || 0;
      items[index + 1].zIndex = tempZIndex || 0;

      // Reorder the items array
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];

      switch (type) {
        case 'note':
          return { ...state, notes: newItems };
        case 'area':
          return { ...state, areas: newItems };
        case 'table':
          return { ...state, tables: newItems };
        default:
          return state;
      }
    });
  },
  moveLayerDown: (itemId, type) => {
    set(state => {
      let items;
      switch (type) {
        case 'note':
          items = [...state.notes];
          break;
        case 'area':
          items = [...state.areas];
          break;
        case 'table':
          items = [...state.tables];
          break;
        default:
          console.warn('Unknown type for moveLayerDown:', type);
          return state;
      }

      const index = items.findIndex(item => item.id === itemId);
      if (index <= 0) {
        return state; // Item not found or already at the bottom
      }

      // Swap zIndex with the item below
      const tempZIndex = items[index].zIndex;
      items[index].zIndex = items[index - 1].zIndex || 0;
      items[index - 1].zIndex = tempZIndex || 0;

      // Reorder the items array
      const newItems = [...items];
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];

      switch (type) {
        case 'note':
          return { ...state, notes: newItems };
        case 'area':
          return { ...state, areas: newItems };
        case 'table':
          return { ...state, tables: newItems };
        default:
          return state;
      }
    });
  },
  updateTable: (id, updatedTable) => {
    set(state => ({
      tables: state.tables.map(table => 
        table.id === id ? { ...table, ...updatedTable } : table
      )
    }));
  },
}));

export default useModelStore;
