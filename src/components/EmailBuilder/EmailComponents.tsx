
import React from 'react';
import { Image, TextIcon, Square, Divide } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComponentType {
  type: 'button' | 'paragraph' | 'image' | 'divider';
  label: string;
  icon: React.ReactNode;
  defaultSize: { w: number, h: number };
}

export const componentTypes: ComponentType[] = [
  {
    type: 'button',
    label: 'Button',
    icon: <Square className="h-5 w-5" />,
    defaultSize: { w: 2, h: 1 }
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    icon: <TextIcon className="h-5 w-5" />,
    defaultSize: { w: 3, h: 2 }
  },
  {
    type: 'image',
    label: 'Image',
    icon: <Image className="h-5 w-5" />,
    defaultSize: { w: 2, h: 2 }
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: <Divide className="h-5 w-5" />,
    defaultSize: { w: 4, h: 1 }
  }
];

interface DraggableComponentProps {
  component: ComponentType;
  onDragStart: (component: ComponentType, e: React.DragEvent) => void;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({ 
  component, 
  onDragStart 
}) => {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-md bg-white cursor-grab border border-email-border hover:border-email-accent hover:bg-email-hover transition-all duration-200 animate-fade-in"
      draggable
      onDragStart={(e) => onDragStart(component, e)}
    >
      <div className="flex-shrink-0 h-8 w-8 rounded-md bg-email-placeholder flex items-center justify-center text-email-accent">
        {component.icon}
      </div>
      <span className="font-medium">{component.label}</span>
    </div>
  );
};

interface PlacedComponentProps {
  type: 'button' | 'paragraph' | 'image' | 'divider';
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const PlacedComponent: React.FC<PlacedComponentProps> = ({ 
  type, 
  isSelected, 
  isDragging,
  isResizing,
  onClick 
}) => {
  return (
    <div 
      className={cn(
        "w-full h-full rounded-md flex items-center justify-center overflow-hidden",
        "border border-email-border transition-colors",
        isSelected ? "border-email-accent" : "",
        isDragging || isResizing ? "opacity-80" : ""
      )}
      onClick={onClick}
    >
      {type === 'button' && (
        <button className="px-4 py-2 bg-email-accent text-white rounded-md">
          Click Me
        </button>
      )}
      
      {type === 'paragraph' && (
        <div className="p-3 text-sm">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
        </div>
      )}
      
      {type === 'image' && (
        <div className="w-full h-full bg-email-placeholder flex items-center justify-center">
          <Image className="h-8 w-8 text-gray-400" />
        </div>
      )}
      
      {type === 'divider' && (
        <div className="w-full px-4">
          <div className="h-[1px] w-full bg-gray-300"></div>
        </div>
      )}
    </div>
  );
};
