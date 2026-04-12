import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import arrowCircleGreen from '@/assets/arrow-circle-new.png';

interface CatalogWelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const CatalogWelcomePopup: React.FC<CatalogWelcomePopupProps> = ({ isOpen, onClose, onContinue }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="p-0 border-0 bg-transparent shadow-none max-w-[95vw] md:max-w-[900px] w-full [&>button]:hidden"
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
              backgroundImage: `url('/lovable-uploads/catalog-popup-bg.webp')`,
            }}
          />
          
          {/* Light blur overlay - not covering text area */}
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(3px)'
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12 md:px-14 md:py-16 min-h-[450px] md:min-h-[520px]">
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
              className="font-synopsis text-4xl md:text-6xl font-bold mb-8 md:mb-10"
              style={{ color: '#314020' }}
            >
              לקוחות יקרים!
            </h2>
            
            {/* Body text */}
            <div 
              className="font-ploni-aaa font-regular text-base md:text-xl leading-relaxed max-w-[650px] mb-10 md:mb-12 space-y-1"
              style={{ color: '#314020' }}
            >
              <p>בתהליך בחירת הפרחים והשזירה</p>
              <p>מושקע מאמץ רב ע"מ להנגיש לכם זר עמיד יפה ורענן,</p>
              <p>עם כל זאת מכיון שהפרחים בחלקם אינם זמינים בכל ימות השנה,</p>
              <p>ייתכנו שינויים קלים בסוג הפרח / גוון הפרח ובשלבי הפתיחה.</p>
            </div>
            
            {/* Continue button */}
            <button 
              onClick={onContinue}
              className="flex items-center gap-4 hover:scale-105 transition-transform"
            >
              <span 
                className="font-synopsis text-xl md:text-2xl font-semibold"
                style={{ color: '#314020' }}
              >
                להמשך בקטלוג
              </span>
              <div className="w-10 h-10 md:w-12 md:h-12">
                <img 
                  src={arrowCircleGreen} 
                  alt="להמשך בקטלוג" 
                  className="w-full h-full rotate-180" 
                />
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogWelcomePopup;
