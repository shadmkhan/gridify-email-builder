
export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridItem {
  id: string;
  type: 'button' | 'paragraph' | 'image' | 'divider';
  position: GridPosition;
  content?: any;
}

// Calculate grid cell position from pixel coordinates
export const calculateGridPosition = (
  x: number,
  y: number, 
  cellSize: number,
  gridOffset: { x: number, y: number }
): { col: number, row: number } => {
  const relativeX = x - gridOffset.x;
  const relativeY = y - gridOffset.y;
  
  const col = Math.floor(relativeX / cellSize);
  const row = Math.floor(relativeY / cellSize);
  
  return { col: Math.max(0, col), row: Math.max(0, row) };
};

// Calculate pixel coordinates from grid cell position
export const calculatePixelPosition = (
  col: number,
  row: number,
  cellSize: number
): { x: number, y: number } => {
  return {
    x: col * cellSize,
    y: row * cellSize
  };
};

// Check if a position is occupied by any item
export const isPositionOccupied = (
  items: GridItem[],
  position: GridPosition,
  excludeId?: string
): boolean => {
  return items.some(item => {
    if (excludeId && item.id === excludeId) return false;
    
    const itemRight = item.position.x + item.position.w;
    const itemBottom = item.position.y + item.position.h;
    const posRight = position.x + position.w;
    const posBottom = position.y + position.h;
    
    return !(
      itemRight <= position.x ||
      item.position.x >= posRight ||
      itemBottom <= position.y ||
      item.position.y >= posBottom
    );
  });
};

// Find the first available position for a new item with given dimensions
export const findAvailablePosition = (
  items: GridItem[],
  width: number,
  height: number,
  cols: number,
  rows: number
): GridPosition | null => {
  for (let y = 0; y < rows - height + 1; y++) {
    for (let x = 0; x < cols - width + 1; x++) {
      const position = { x, y, w: width, h: height };
      if (!isPositionOccupied(items, position)) {
        return position;
      }
    }
  }
  return null;
};

// Generate a unique ID for new items
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
