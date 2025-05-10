
import { StateCreator } from 'zustand';
import { ModelState } from './types';
import { Note } from '@/lib/types';

export interface NoteSlice {
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  removeNote: (id: string) => void;
  updateNotePosition: (id: string, position: { x: number; y: number }) => void;
}

export const createNoteSlice: StateCreator<
  ModelState & NoteSlice,
  [],
  [],
  NoteSlice
> = (set) => ({
  notes: [],
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
        note.id === id ? { ...note, position } : note
      ),
    })),
});
