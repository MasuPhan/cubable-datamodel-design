
import { StateCreator } from 'zustand';
import { ModelState } from './types';
import { Relationship } from '@/lib/types';

export interface RelationshipSlice {
  relationships: Relationship[];
  addRelationship: (relationship: Relationship) => void;
  removeRelationship: (id: string) => void;
}

export const createRelationshipSlice: StateCreator<
  ModelState & RelationshipSlice,
  [],
  [],
  RelationshipSlice
> = (set) => ({
  relationships: [],
  addRelationship: (relationship) =>
    set((state) => ({ relationships: [...state.relationships, relationship] })),
  removeRelationship: (id) =>
    set((state) => ({
      relationships: state.relationships.filter((relationship) => relationship.id !== id),
    })),
});
