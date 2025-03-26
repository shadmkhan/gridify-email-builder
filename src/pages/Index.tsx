
import React, { useState, useCallback } from 'react';
import Grid from '@/components/EmailBuilder/Grid';
import ComponentPanel from '@/components/EmailBuilder/ComponentPanel';
import { ComponentType } from '@/components/EmailBuilder/EmailComponents';
import { GridItem as GridItemType, isPositionOccupied } from '@/utils/gridHelpers';

const Index = () => {
  const [items, setItems] = useState<GridItemType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const CELL_SIZE = 40;
  const GRID_COLS = 12;
  const GRID_ROWS = 15;
  
  const handleDragStart = (component: ComponentType, e: React.DragEvent) => {
    e.dataTransfer.setData('component', component.type);
    e.dataTransfer.setData('defaultSize', JSON.stringify(component.defaultSize));
  };
  
  const handleItemAdd = useCallback((item: GridItemType) => {
    setItems(prev => [...prev, item]);
    setSelectedId(item.id);
  }, []);
  
  const handleItemMove = useCallback((id: string, x: number, y: number) => {
    setItems(prev => {
      const itemIndex = prev.findIndex(item => item.id === id);
      if (itemIndex === -1) return prev;
      
      const item = prev[itemIndex];
      const newPosition = {
        ...item.position,
        x,
        y
      };
      
      // Check if new position overlaps with other items
      if (isPositionOccupied(
        prev.filter(i => i.id !== id),
        newPosition
      )) {
        return prev;
      }
      
      const newItems = [...prev];
      newItems[itemIndex] = {
        ...item,
        position: newPosition
      };
      
      return newItems;
    });
  }, []);
  
  const handleItemResize = useCallback((id: string, w: number, h: number) => {
    setItems(prev => {
      const itemIndex = prev.findIndex(item => item.id === id);
      if (itemIndex === -1) return prev;
      
      const item = prev[itemIndex];
      const newPosition = {
        ...item.position,
        w,
        h
      };
      
      // Check if new size overlaps with other items
      if (isPositionOccupied(
        prev.filter(i => i.id !== id),
        newPosition
      )) {
        return prev;
      }
      
      const newItems = [...prev];
      newItems[itemIndex] = {
        ...item,
        position: newPosition
      };
      
      return newItems;
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
        <Grid
          items={items}
          selectedId={selectedId}
          cellSize={CELL_SIZE}
          cols={GRID_COLS}
          rows={GRID_ROWS}
          onItemAdd={handleItemAdd}
          onItemMove={handleItemMove}
          onItemResize={handleItemResize}
          onItemSelect={setSelectedId}
        />
      </div>
      
      <ComponentPanel onDragStart={handleDragStart} />
    </div>
  );
};

export default Index;
