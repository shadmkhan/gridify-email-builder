
import React from 'react';
import { DraggableComponent, componentTypes } from './EmailComponents';
import { ComponentType } from './EmailComponents';

interface ComponentPanelProps {
  onDragStart: (component: ComponentType, e: React.DragEvent) => void;
}

const ComponentPanel: React.FC<ComponentPanelProps> = ({ onDragStart }) => {
  return (
    <div className="h-full w-64 border-l border-email-border bg-white p-4 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Components</h2>
      </div>
      
      <div className="space-y-2 overflow-y-auto">
        {componentTypes.map((component) => (
          <DraggableComponent
            key={component.type}
            component={component}
            onDragStart={onDragStart}
          />
        ))}
      </div>
      
      <div className="mt-auto pt-4 text-xs text-muted-foreground">
        <p>Drag components to the grid</p>
      </div>
    </div>
  );
};

export default ComponentPanel;
