import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import arrowCircleGreen from '@/assets/arrow-circle-new.png';

interface CatalogNotReadyPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CatalogNotReadyPopup: React.FC<CatalogNotReadyPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="p-0 border-0 bg-transparent shadow-none max-w-[95vw] md:max-w-[700px] w-full [&>button]:hidden z-[9999]"
        style={{ background: 'transparent' }}
      >
        {/* Main container with green border */}
        <div 
          className="relative rounded-3xl overflow-hidden"
          style={{ 
            border: '4px solid #314020',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('/lovable-uploads/catalog-popup-bg.jpg')`,
            }}
          />
          
          {/* Light blur overlay */}
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(3px)'
            }}
          />
          
          {/* Accessibility: Hidden title and description for screen readers */}
          <VisuallyHidden>
            <DialogTitle>הקטלוג בהכנה</DialogTitle>
            <DialogDescription>הקטלוג עדיין לא זמין להורדה, מוזמנים לגלול בקטלוג באתר</DialogDescription>
          </VisuallyHidden>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12 md:px-14 md:py-16 min-h-[350px] md:min-h-[400px]">
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 hover:opacity-70 transition-opacity z-20"
              style={{ color: '#314020' }}
              aria-label="סגור"
            >
              <X className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
            </button>
            
            {/* Title */}
            <h2 
              className="font-synopsis text-3xl md:text-5xl font-bold mb-8 md:mb-10"
              style={{ color: '#314020' }}
            >
              הקטלוג בהכנה
            </h2>
            
            {/* Body text */}
            <div 
              className="font-ploni-aaa font-regular text-lg md:text-xl leading-relaxed max-w-[550px] mb-10 md:mb-12"
              style={{ color: '#314020' }}
            >
              <p>מוזמנים בינתיים לגלול בקטלוג באתר</p>
            </div>
            
            {/* Go to catalog button */}
            <Link 
              to="/catalog"
              onClick={() => {
                onClose();
                window.scrollTo(0, 0);
              }}
              className="flex items-center gap-4 hover:scale-105 transition-transform"
            >
              <span 
                className="font-synopsis text-xl md:text-2xl font-semibold"
                style={{ color: '#314020' }}
              >
                לקטלוג באתר
              </span>
              <div className="w-10 h-10 md:w-12 md:h-12">
                <img 
                  src={arrowCircleGreen} 
                  alt="לקטלוג באתר" 
                  className="w-full h-full rotate-180" 
                />
              </div>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogNotReadyPopup;
