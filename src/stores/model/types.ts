
import { Table, Relationship, Area, Note } from '@/lib/types';

// Base store state type
export interface ModelState {
  tables: Table[];
  relationships: Relationship[];
  areas: Area[];
  notes: Note[];
}
