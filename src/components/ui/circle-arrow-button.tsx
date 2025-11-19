import { ChevronLeft } from 'lucide-react';

interface CircleArrowButtonProps {
  direction?: 'left' | 'right';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const CircleArrowButton = ({ 
  direction = 'right', 
  onClick, 
  className = '',
  disabled = false 
}: CircleArrowButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-12 h-12 hover:scale-110 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={direction === 'right' ? 'Next' : 'Previous'}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="23" fill="white" stroke="currentColor" strokeWidth="2"/>
        <g transform={direction === 'left' ? 'translate(24, 24) rotate(180) translate(-24, -24)' : ''}>
          <ChevronLeft 
            x="12" 
            y="12" 
            width="24" 
            height="24" 
            className="text-current"
          />
        </g>
      </svg>
    </button>
  );
};
