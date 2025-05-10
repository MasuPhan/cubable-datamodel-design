
import { StateCreator } from 'zustand';
import { ModelState } from './types';
import { Area } from '@/lib/types';

export interface AreaSlice {
  areas: Area[];
  addArea: (area: Area) => void;
  updateArea: (area: Area) => void;
  removeArea: (id: string) => void;
  updateAreaPosition: (id: string, position: { x: number; y: number }) => void;
}

export const createAreaSlice: StateCreator<
  ModelState & AreaSlice,
  [],
  [],
  AreaSlice
> = (set) => ({
  areas: [],
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
        area.id === id ? { ...area, position } : area
      ),
    })),
});
