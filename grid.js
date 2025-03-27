
// Grid Helper Functions
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 9);
}

function isPositionOccupied(items, position, excludeId = null) {
  return items.some(item => {
    if (excludeId && item.id === excludeId) return false;
    
    const itemRight = item.position.x + item.position.w;
    const itemBottom = item.position.y + item.position.h;
    const positionRight = position.x + position.w;
    const positionBottom = position.y + position.h;
    
    return !(
      itemRight <= position.x ||
      item.position.x >= positionRight ||
      itemBottom <= position.y ||
      item.position.y >= positionBottom
    );
  });
}

function calculateGridPosition(clientX, clientY, cellSize, gridOffset) {
  const col = Math.floor((clientX - gridOffset.x) / cellSize);
  const row = Math.floor((clientY - gridOffset.y) / cellSize);
  return { col, row };
}

// Grid Component
class Grid {
  constructor(containerSelector, options = {}) {
    this.container = document.getElementById(containerSelector);
    this.cellSize = options.cellSize || 40;
    this.cols = options.cols || 12;
    this.rows = options.rows || 15;
    this.items = [];
    this.selectedId = null;
    
    // Set up state for dragging and resizing
    this.isDragging = false;
    this.isResizing = false;
    this.resizeDirection = null;
    this.dragOffset = { x: 0, y: 0 };
    this.initialPosition = { x: 0, y: 0 };
    this.initialSize = { w: 0, h: 0 };
    
    this.init();
  }
  
  init() {
    // Set grid size
    this.container.style.width = `${this.cols * this.cellSize}px`;
    this.container.style.height = `${this.rows * this.cellSize}px`;
    
    // Create grid cells (visual only)
    this.createGridCells();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  createGridCells() {
    // Clear existing cells
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    
    // Create cells
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.style.left = `${col * this.cellSize}px`;
        cell.style.top = `${row * this.cellSize}px`;
        cell.style.width = `${this.cellSize}px`;
        cell.style.height = `${this.cellSize}px`;
        this.container.appendChild(cell);
      }
    }
  }
  
  setupEventListeners() {
    // Grid event listeners for dropping components
    this.container.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.container.addEventListener('drop', (e) => this.handleDrop(e));
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.selectItem(null);
      }
    });
    
    // Document event listeners for drag and resize operations
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseup', () => this.handleMouseUp());
  }
  
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }
  
  handleDrop(e) {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('component');
    const defaultSize = JSON.parse(e.dataTransfer.getData('defaultSize'));
    
    const gridRect = this.container.getBoundingClientRect();
    const dropPosition = calculateGridPosition(
      e.clientX,
      e.clientY,
      this.cellSize,
      { x: gridRect.left, y: gridRect.top }
    );
    
    const newPosition = {
      x: Math.min(dropPosition.col, this.cols - defaultSize.w),
      y: Math.min(dropPosition.row, this.rows - defaultSize.h),
      w: defaultSize.w,
      h: defaultSize.h
    };
    
    // Check if the position is occupied
    if (isPositionOccupied(this.items, newPosition)) {
      return;
    }
    
    const newItem = {
      id: generateUniqueId(),
      type: componentType,
      position: newPosition
    };
    
    this.addItem(newItem);
  }
  
  addItem(item) {
    this.items.push(item);
    this.renderItem(item);
    this.selectItem(item.id);
  }
  
  renderItem(item) {
    const { x, y, w, h } = item.position;
    
    // Create or update the DOM element
    let itemElement = document.getElementById(`grid-item-${item.id}`);
    
    if (!itemElement) {
      // Create new element
      itemElement = document.createElement('div');
      itemElement.id = `grid-item-${item.id}`;
      itemElement.className = 'grid-item';
      itemElement.dataset.id = item.id;
      
      // Create component content
      const componentContent = ComponentFactory.createComponent(item.type);
      itemElement.appendChild(componentContent);
      
      // Add event listeners
      itemElement.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        this.startDragging(e, item.id);
      });
      
      itemElement.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectItem(item.id);
      });
      
      this.container.appendChild(itemElement);
    }
    
    // Position the item
    itemElement.style.transform = `translate(${x * this.cellSize}px, ${y * this.cellSize}px)`;
    itemElement.style.width = `${w * this.cellSize}px`;
    itemElement.style.height = `${h * this.cellSize}px`;
  }
  
  selectItem(id) {
    // Remove selection from previous item
    if (this.selectedId) {
      const prevSelected = document.getElementById(`grid-item-${this.selectedId}`);
      if (prevSelected) {
        prevSelected.classList.remove('selected');
        
        // Remove resize handles
        const handles = prevSelected.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
      }
    }
    
    this.selectedId = id;
    
    // Add selection to new item
    if (id) {
      const selected = document.getElementById(`grid-item-${id}`);
      if (selected) {
        selected.classList.add('selected');
        
        // Add resize handles
        this.addResizeHandles(selected, id);
      }
    }
  }
  
  addResizeHandles(element, itemId) {
    const directions = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
    
    directions.forEach(dir => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${dir}`;
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.startResizing(e, itemId, dir);
      });
      
      element.appendChild(handle);
    });
  }
  
  startDragging(e, itemId) {
    e.preventDefault();
    
    this.isDragging = true;
    this.selectItem(itemId);
    
    const item = this.items.find(item => item.id === itemId);
    if (!item) return;
    
    const itemElement = document.getElementById(`grid-item-${itemId}`);
    if (!itemElement) return;
    
    itemElement.classList.add('dragging');
    
    const rect = itemElement.getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    this.initialPosition = { 
      x: item.position.x, 
      y: item.position.y 
    };
  }
  
  startResizing(e, itemId, direction) {
    e.preventDefault();
    
    this.isResizing = true;
    this.resizeDirection = direction;
    this.selectItem(itemId);
    
    const item = this.items.find(item => item.id === itemId);
    if (!item) return;
    
    const itemElement = document.getElementById(`grid-item-${itemId}`);
    if (!itemElement) return;
    
    itemElement.classList.add('resizing');
    
    this.initialSize = { 
      w: item.position.w, 
      h: item.position.h 
    };
    
    this.initialPosition = { 
      x: item.position.x, 
      y: item.position.y 
    };
  }
  
  handleMouseMove(e) {
    if (this.isDragging && this.selectedId) {
      this.handleDragging(e);
    }
    
    if (this.isResizing && this.selectedId && this.resizeDirection) {
      this.handleResizing(e);
    }
  }
  
  handleDragging(e) {
    const item = this.items.find(item => item.id === this.selectedId);
    if (!item) return;
    
    const gridRect = this.container.getBoundingClientRect();
    
    let newX = Math.round((e.clientX - gridRect.left - this.dragOffset.x) / this.cellSize);
    let newY = Math.round((e.clientY - gridRect.top - this.dragOffset.y) / this.cellSize);
    
    // Ensure we don't go outside the grid
    newX = Math.max(0, Math.min(newX, this.cols - item.position.w));
    newY = Math.max(0, Math.min(newY, this.rows - item.position.h));
    
    const newPosition = {
      ...item.position,
      x: newX,
      y: newY
    };
    
    // Check if new position overlaps with other items
    if (!isPositionOccupied(this.items, newPosition, item.id)) {
      item.position.x = newX;
      item.position.y = newY;
      this.renderItem(item);
    }
  }
  
  handleResizing(e) {
    const item = this.items.find(item => item.id === this.selectedId);
    if (!item) return;
    
    const gridRect = this.container.getBoundingClientRect();
    
    let newW = this.initialSize.w;
    let newH = this.initialSize.h;
    let newX = this.initialPosition.x;
    let newY = this.initialPosition.y;
    
    if (this.resizeDirection.includes('e')) {
      newW = Math.max(1, Math.round((e.clientX - gridRect.left - (this.initialPosition.x * this.cellSize)) / this.cellSize));
    }
    
    if (this.resizeDirection.includes('s')) {
      newH = Math.max(1, Math.round((e.clientY - gridRect.top - (this.initialPosition.y * this.cellSize)) / this.cellSize));
    }
    
    if (this.resizeDirection.includes('w')) {
      const rightEdge = (this.initialPosition.x + this.initialSize.w) * this.cellSize;
      const newLeftEdge = Math.min(e.clientX - gridRect.left, rightEdge - this.cellSize);
      newX = Math.floor(newLeftEdge / this.cellSize);
      newW = Math.max(1, this.initialSize.w + (this.initialPosition.x - newX));
    }
    
    if (this.resizeDirection.includes('n')) {
      const bottomEdge = (this.initialPosition.y + this.initialSize.h) * this.cellSize;
      const newTopEdge = Math.min(e.clientY - gridRect.top, bottomEdge - this.cellSize);
      newY = Math.floor(newTopEdge / this.cellSize);
      newH = Math.max(1, this.initialSize.h + (this.initialPosition.y - newY));
    }
    
    // Ensure we don't go outside the grid
    newW = Math.min(newW, this.cols - newX);
    newH = Math.min(newH, this.rows - newY);
    
    const newPosition = {
      x: newX,
      y: newY,
      w: newW,
      h: newH
    };
    
    // Check if new position overlaps with other items
    if (!isPositionOccupied(this.items, newPosition, item.id)) {
      item.position = newPosition;
      this.renderItem(item);
    }
  }
  
  handleMouseUp() {
    if (this.isDragging || this.isResizing) {
      const itemElement = document.getElementById(`grid-item-${this.selectedId}`);
      if (itemElement) {
        itemElement.classList.remove('dragging', 'resizing');
      }
    }
    
    this.isDragging = false;
    this.isResizing = false;
    this.resizeDirection = null;
  }
}
