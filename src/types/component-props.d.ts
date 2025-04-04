
interface ModelHeaderProps {
  isPaletteVisible: boolean;
  setIsPaletteVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isGridVisible: boolean;
  setIsGridVisible: React.Dispatch<React.SetStateAction<boolean>>;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  onAddArea: () => void;
  onAddNote: () => void;
  onAddTable: () => void;
}
