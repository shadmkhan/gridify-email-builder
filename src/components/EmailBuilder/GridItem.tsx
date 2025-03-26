
import React, { useEffect, useRef, useState } from 'react';
import { GridItem as GridItemType } from '@/utils/gridHelpers';
import { PlacedComponent } from './EmailComponents';
import { cn } from '@/lib/utils';

interface GridItemProps {
  item: GridItemType;
  cellSize: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
}

const GridItem: React.FC<GridItemProps> = ({
  item,
  cellSize,
  isSelected,
  onSelect,
  onMove,
  onResize
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const initialPosition = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ w: 0, h: 0 });
  
  const { x, y, w, h } = item.position;
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(item.id);
    
    if (e.currentTarget === itemRef.current) {
      setIsDragging(true);
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        initialPosition.current = { x: item.position.x, y: item.position.y };
      }
    }
  };
  
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(item.id);
    setIsResizing(true);
    setResizeDirection(direction);
    initialSize.current = { w: item.position.w, h: item.position.h };
    initialPosition.current = { x: item.position.x, y: item.position.y };
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && itemRef.current) {
        const gridRect = itemRef.current.parentElement?.getBoundingClientRect();
        if (!gridRect) return;
        
        let newX = Math.round((e.clientX - gridRect.left - dragOffset.current.x) / cellSize);
        let newY = Math.round((e.clientY - gridRect.top - dragOffset.current.y) / cellSize);
        
        // Ensure we don't go outside the grid
        newX = Math.max(0, Math.min(newX, Math.floor(gridRect.width / cellSize) - w));
        newY = Math.max(0, Math.min(newY, Math.floor(gridRect.height / cellSize) - h));
        
        onMove(item.id, newX, newY);
      }
      
      if (isResizing && resizeDirection) {
        const gridRect = itemRef.current?.parentElement?.getBoundingClientRect();
        if (!gridRect || !itemRef.current) return;
        
        let newW = initialSize.current.w;
        let newH = initialSize.current.h;
        let newX = initialPosition.current.x;
        let newY = initialPosition.current.y;
        
        if (resizeDirection.includes('e')) {
          newW = Math.max(1, Math.round((e.clientX - gridRect.left - (initialPosition.current.x * cellSize)) / cellSize));
        }
        
        if (resizeDirection.includes('s')) {
          newH = Math.max(1, Math.round((e.clientY - gridRect.top - (initialPosition.current.y * cellSize)) / cellSize));
        }
        
        if (resizeDirection.includes('w')) {
          const rightEdge = (initialPosition.current.x + initialSize.current.w) * cellSize;
          const newLeftEdge = Math.min(e.clientX - gridRect.left, rightEdge - cellSize);
          newX = Math.floor(newLeftEdge / cellSize);
          newW = Math.max(1, initialSize.current.w + (initialPosition.current.x - newX));
        }
        
        if (resizeDirection.includes('n')) {
          const bottomEdge = (initialPosition.current.y + initialSize.current.h) * cellSize;
          const newTopEdge = Math.min(e.clientY - gridRect.top, bottomEdge -

 cellSize);
          newY = Math.floor(newTopEdge / cellSize);
          newH = Math.max(1, initialSize.current.h + (initialPosition.current.y - newY));
        }
        
        if (newX >= 0 && newY >= 0) {
          onMove(item.id, newX, newY);
          onResize(item.id, newW, newH);
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeDirection, cellSize, item.id, onMove, onResize, w, h]);
  
  return (
    <div
      ref={itemRef}
      className={cn(
        'grid-item',
        isDragging && 'grid-item-dragging',
        isResizing && 'grid-item-resizing',
        isSelected && 'grid-item-selected'
      )}
      style={{
        transform: `translate(${x * cellSize}px, ${y * cellSize}px)`,
        width: `${w * cellSize}px`,
        height: `${h * cellSize}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <PlacedComponent
        type={item.type}
        isSelected={isSelected}
        isDragging={isDragging}
        isResizing={isResizing}
        onClick={() => onSelect(item.id)}
      />
      
      {isSelected && (
        <>
          <div className="resize-handle resize-handle-n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
          <div className="resize-handle resize-handle-e" onMouseDown={(e) => handleResizeStart(e, 'e')} />
          <div className="resize-handle resize-handle-s" onMouseDown={(e) => handleResizeStart(e, 's')} />
          <div className="resize-handle resize-handle-w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
          <div className="resize-handle resize-handle-ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
          <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
          <div className="resize-handle resize-handle-sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
          <div className="resize-handle resize-handle-nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
        </>
      )}
    </div>
  );
};

export default GridItem;
