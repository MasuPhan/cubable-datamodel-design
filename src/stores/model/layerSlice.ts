
import { StateCreator } from 'zustand';
import { ModelState } from './types';
import { TableSlice } from './tableSlice';
import { AreaSlice } from './areaSlice';
import { NoteSlice } from './noteSlice';

export interface LayerSlice {
  moveLayerUp: (itemId: string, type: 'note' | 'area' | 'table') => void;
  moveLayerDown: (itemId: string, type: 'note' | 'area' | 'table') => void;
}

export const createLayerSlice: StateCreator<
  ModelState & TableSlice & AreaSlice & NoteSlice & LayerSlice,
  [],
  [],
  LayerSlice
> = (set) => ({
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
});
