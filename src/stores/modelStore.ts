
import { create } from 'zustand';
import { ModelState } from './model/types';
import { TableSlice, createTableSlice } from './model/tableSlice';
import { RelationshipSlice, createRelationshipSlice } from './model/relationshipSlice';
import { AreaSlice, createAreaSlice } from './model/areaSlice';
import { NoteSlice, createNoteSlice } from './model/noteSlice';
import { LayerSlice, createLayerSlice } from './model/layerSlice';

// Define the complete store type
type ModelStore = ModelState & TableSlice & RelationshipSlice & AreaSlice & NoteSlice & LayerSlice;

// Create the store combining all slices
const useModelStore = create<ModelStore>()((...a) => ({
  ...createTableSlice(...a),
  ...createRelationshipSlice(...a),
  ...createAreaSlice(...a),
  ...createNoteSlice(...a),
  ...createLayerSlice(...a),
}));

export default useModelStore;
