
// Define component types with their properties
const componentTypes = [
  {
    type: 'button',
    label: 'Button',
    icon: '□',
    defaultSize: { w: 2, h: 1 }
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    icon: 'T',
    defaultSize: { w: 3, h: 2 },
    isRichText: true
  },
  {
    type: 'image',
    label: 'Image',
    icon: '▣',
    defaultSize: { w: 2, h: 2 }
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: '—',
    defaultSize: { w: 4, h: 1 }
  }
];

// Component Panel Controller
class ComponentPanel {
  constructor() {
    this.panel = document.getElementById('component-panel');
    this.toggleButton = document.getElementById('toggle-panel');
    this.componentsList = document.getElementById('components-list');
    this.isOpen = true;
    
    this.init();
  }
  
  init() {
    // Set up toggle functionality
    this.toggleButton.addEventListener('click', () => this.togglePanel());
    
    // Render components
    this.renderComponents();
  }
  
  togglePanel() {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle('collapsed', !this.isOpen);
    
    const chevronRight = this.toggleButton.querySelector('.chevron-right');
    const chevronLeft = this.toggleButton.querySelector('.chevron-left');
    
    if (this.isOpen) {
      chevronRight.classList.remove('hidden');
      chevronLeft.classList.add('hidden');
    } else {
      chevronRight.classList.add('hidden');
      chevronLeft.classList.remove('hidden');
    }
  }
  
  renderComponents() {
    componentTypes.forEach(component => {
      const componentElement = document.createElement('div');
      componentElement.className = 'draggable-component';
      componentElement.draggable = true;
      componentElement.dataset.type = component.type;
      componentElement.dataset.defaultSize = JSON.stringify(component.defaultSize);
      
      componentElement.innerHTML = `
        <div class="component-icon">${component.icon}</div>
        <span class="component-label">${component.label}</span>
      `;
      
      // Add drag event listeners
      componentElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('component', component.type);
        e.dataTransfer.setData('defaultSize', JSON.stringify(component.defaultSize));
      });
      
      this.componentsList.appendChild(componentElement);
    });
  }
}

// Component Factory - creates DOM elements for placed components
class ComponentFactory {
  static createComponent(type) {
    const componentContent = document.createElement('div');
    componentContent.className = 'component-content';
    
    switch (type) {
      case 'button':
        const button = document.createElement('button');
        button.className = 'button-component';
        button.textContent = 'Click Me';
        componentContent.appendChild(button);
        break;
        
      case 'paragraph':
        const paragraph = document.createElement('div');
        paragraph.className = 'paragraph-component rich-text-editor';
        paragraph.contentEditable = 'true';
        paragraph.textContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.';
        paragraph.addEventListener('focus', function() {
          this.classList.add('editing');
        });
        paragraph.addEventListener('blur', function() {
          this.classList.remove('editing');
        });
        componentContent.appendChild(paragraph);
        break;
        
      case 'image':
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-component';
        imageContainer.innerHTML = '▣';
        componentContent.appendChild(imageContainer);
        break;
        
      case 'divider':
        const dividerContainer = document.createElement('div');
        dividerContainer.className = 'divider-component';
        const divider = document.createElement('div');
        dividerContainer.appendChild(divider);
        componentContent.appendChild(dividerContainer);
        break;
    }

    // Add context menu container
    const contextMenu = document.createElement('div');
    contextMenu.className = 'item-actions';
    contextMenu.innerHTML = `
      <button class="action-button edit-button" title="Edit"><span>✎</span></button>
      <button class="action-button move-button" title="Move"><span>↔</span></button>
      <button class="action-button delete-button" title="Delete"><span>×</span></button>
    `;
    componentContent.appendChild(contextMenu);
    
    return componentContent;
  }
}
