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
    this.moveMode = false;
    this.editingId = null;
    
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
    
    // Document event listeners for move mode operations
    document.addEventListener('mousemove', (e) => {
      if (this.moveMode && this.selectedId) {
        this.handleMoveMode(e);
      }
    });
    
    document.addEventListener('mouseup', () => {
      this.moveMode = false;
      document.body.classList.remove('move-mode');
    });
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
      
      // Set up action buttons
      const editButton = componentContent.querySelector('.edit-button');
      const moveButton = componentContent.querySelector('.move-button');
      const deleteButton = componentContent.querySelector('.delete-button');
      
      // Edit button functionality
      if (editButton) {
        editButton.addEventListener('click', (e) => {
          e.stopPropagation();
          const richTextEditor = itemElement.querySelector('.rich-text-editor');
          if (richTextEditor) {
            richTextEditor.focus();
          }
        });
      }
      
      // Move button functionality
      if (moveButton) {
        moveButton.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          this.moveMode = true;
          document.body.classList.add('move-mode');
          this.selectItem(item.id);
        });
      }
      
      // Delete button functionality
      if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeItem(item.id);
        });
      }
      
      // Add click handler
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
      }
    }
    
    this.selectedId = id;
    
    // Add selection to new item
    if (id) {
      const selected = document.getElementById(`grid-item-${id}`);
      if (selected) {
        selected.classList.add('selected');
      }
    }
  }
  
  removeItem(id) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      
      const element = document.getElementById(`grid-item-${id}`);
      if (element) {
        element.remove();
      }
      
      if (this.selectedId === id) {
        this.selectedId = null;
      }
    }
  }
  
  handleMoveMode(e) {
    const item = this.items.find(item => item.id === this.selectedId);
    if (!item) return;
    
    const gridRect = this.container.getBoundingClientRect();
    
    const position = calculateGridPosition(
      e.clientX,
      e.clientY,
      this.cellSize,
      { x: gridRect.left, y: gridRect.top }
    );
    
    let newX = Math.max(0, Math.min(position.col, this.cols - item.position.w));
    let newY = Math.max(0, Math.min(position.row, this.rows - item.position.h));
    
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
}
