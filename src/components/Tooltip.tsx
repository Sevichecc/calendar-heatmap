import { useFloating, offset, shift, flip, arrow } from '@floating-ui/react';
import { useRef, useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);
  
  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(8),
      flip(),
      shift(),
      arrow({ element: arrowRef })
    ],
  });

  return (
    <div
      ref={refs.setReference}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-md shadow-lg whitespace-pre-line"
        >
          {content}
          <div ref={arrowRef} className="absolute w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );
} 