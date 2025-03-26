
import React, { useRef } from 'react';
import { GridItem as GridItemType, calculateGridPosition, isPositionOccupied } from '@/utils/gridHelpers';
import GridItem from './GridItem';
import { ComponentType } from './EmailComponents';

interface GridProps {
  items: GridItemType[];
  selectedId: string | null;
  cellSize: number;
  cols: number;
  rows: number;
  onItemAdd: (item: GridItemType) => void;
  onItemMove: (id: string, x: number, y: number) => void;
  onItemResize: (id: string, w: number, h: number) => void;
  onItemSelect: (id: string | null) => void;
}

const Grid: React.FC<GridProps> = ({
  items,
  selectedId,
  cellSize,
  cols,
  rows,
  onItemAdd,
  onItemMove,
  onItemResize,
  onItemSelect,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('component') as ComponentType['type'];
    const defaultSize = JSON.parse(e.dataTransfer.getData('defaultSize'));
    
    if (!gridRef.current) return;
    
    const gridRect = gridRef.current.getBoundingClientRect();
    const dropPosition = calculateGridPosition(
      e.clientX - gridRect.left,
      e.clientY - gridRect.top,
      cellSize,
      { x: 0, y: 0 }
    );
    
    const newPosition = {
      x: Math.min(dropPosition.col, cols - defaultSize.w),
      y: Math.min(dropPosition.row, rows - defaultSize.h),
      w: defaultSize.w,
      h: defaultSize.h
    };
    
    // Check if the position is occupied
    if (isPositionOccupied(items, newPosition)) {
      return;
    }
    
    const newItem: GridItemType = {
      id: Math.random().toString(36).substring(2, 9),
      type: componentType,
      position: newPosition
    };
    
    onItemAdd(newItem);
  };

  return (
    <div
      ref={gridRef}
      className="relative bg-white shadow-sm rounded-lg overflow-hidden"
      style={{
        width: `${cols * cellSize}px`,
        height: `${rows * cellSize}px`
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onItemSelect(null)}
    >
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: cols }, (_, i) => (
          <div
            key={`col-${i}`}
            className="absolute border-r border-dashed border-email-border last:border-r-0"
            style={{
              left: `${i * cellSize}px`,
              height: '100%',
              width: '1px'
            }}
          />
        ))}
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={`row-${i}`}
            className="absolute border-b border-dashed border-email-border last:border-b-0"
            style={{
              top: `${i * cellSize}px`,
              width: '100%',
              height: '1px'
            }}
          />
        ))}
      </div>

      {items.map((item) => (
        <GridItem
          key={item.id}
          item={item}
          cellSize={cellSize}
          isSelected={item.id === selectedId}
          onSelect={onItemSelect}
          onMove={onItemMove}
          onResize={onItemResize}
        />
      ))}
    </div>
  );
};

export default Grid;
