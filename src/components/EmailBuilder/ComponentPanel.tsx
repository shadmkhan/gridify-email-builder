
import React, { useState } from 'react';
import { DraggableComponent, componentTypes } from './EmailComponents';
import { ComponentType } from './EmailComponents';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ComponentPanelProps {
  onDragStart: (component: ComponentType, e: React.DragEvent) => void;
}

const ComponentPanel: React.FC<ComponentPanelProps> = ({ onDragStart }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={cn(
      "h-full border-l border-email-border bg-white flex flex-col overflow-hidden transition-all duration-300",
      isOpen ? "w-64" : "w-10"
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          {isOpen && <h2 className="text-lg font-medium">Components</h2>}
          <CollapsibleTrigger asChild>
            <button className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100">
              {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent forceMount className="flex-1 overflow-hidden">
          <div className={cn(
            "space-y-2 overflow-y-auto p-4 pt-0",
            !isOpen && "hidden"
          )}>
            {componentTypes.map((component) => (
              <DraggableComponent
                key={component.type}
                component={component}
                onDragStart={onDragStart}
              />
            ))}
          </div>
          
          {isOpen && (
            <div className="mt-auto p-4 text-xs text-muted-foreground">
              <p>Drag components to the grid</p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ComponentPanel;
