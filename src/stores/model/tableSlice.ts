
import { StateCreator } from 'zustand';
import { ModelState } from './types';
import { Table } from '@/lib/types';

export interface TableSlice {
  tables: Table[];
  addTable: (table: Table) => void;
  updateTablePosition: (id: string, position: { x: number; y: number }) => void;
  updateTableName: (id: string, name: string) => void;
  removeTable: (id: string) => void;
  addFieldToTable: (tableId: string, field: any) => void;
  updateField: (tableId: string, fieldId: string, updatedField: any) => void;
  removeField: (tableId: string, fieldId: string) => void;
  updateTable: (id: string, updatedTable: Partial<Table>) => void;
}

export const createTableSlice: StateCreator<
  ModelState & TableSlice,
  [],
  [],
  TableSlice
> = (set) => ({
  tables: [],
  addTable: (table) => set((state) => ({ tables: [...state.tables, table] })),
  updateTablePosition: (id, position) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === id ? { ...table, position } : table
      ),
    })),
  updateTableName: (id, name) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === id ? { ...table, name } : table
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
  updateTable: (id, updatedTable) => {
    set(state => ({
      tables: state.tables.map(table => 
        table.id === id ? { ...table, ...updatedTable } : table
      )
    }));
  },
});
