
interface CanvasGridProps {
  isGridVisible: boolean;
  canvasSize: {
    width: string;
    height: string;
  };
}

export const CanvasGrid = ({ isGridVisible, canvasSize }: CanvasGridProps) => {
  if (!isGridVisible) return null;
  
  return (
    <div 
      className="absolute inset-0 grid grid-cols-[repeat(600,20px)] grid-rows-[repeat(600,20px)] opacity-20" 
      style={{ width: canvasSize.width, height: canvasSize.height }}
    >
      {Array.from({ length: 600 }).map((_, row) => (
        Array.from({ length: 600 }).map((_, col) => (
          <div 
            key={`${row}-${col}`}
            className="border-[0.5px] border-slate-300"
          />
        ))
      ))}
    </div>
  );
};
