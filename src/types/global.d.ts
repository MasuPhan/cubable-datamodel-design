
interface ModelDesignerAPI {
  addArea: () => void;
  addNote: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

declare global {
  interface Window {
    modelDesignerAPI: ModelDesignerAPI;
  }
}

export {};
