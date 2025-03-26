
// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the component panel
  const componentPanel = new ComponentPanel();
  
  // Initialize the grid
  const grid = new Grid('grid-container', {
    cellSize: 40,
    cols: 12,
    rows: 15
  });
  
  console.log('Email Builder initialized');
});
