import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import arrowCircleGreen from '@/assets/arrow-circle-new.png';

interface CatalogWelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

interface PopupData {
  is_active: boolean;
  title: string;
  body_text: string;
  button_text: string;
  button_link: string;
  image_url: string;
  overlay_opacity: number;
}

const CatalogWelcomePopup: React.FC<CatalogWelcomePopupProps> = ({ isOpen, onClose, onContinue }) => {
  const { data } = useQuery({
    queryKey: ['catalog-popup'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('catalog_popup')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as PopupData | null;
    },
  });

  if (!data || !data.is_active) return null;

  const isExternal = /^https?:\/\//i.test(data.button_link);
  const opacity = Math.min(100, Math.max(0, data.overlay_opacity)) / 100;

  const buttonContent = (
    <>
      <span
        className="font-synopsis text-xl md:text-2xl font-semibold"
        style={{ color: '#314020' }}
      >
        {data.button_text}
      </span>
      <div className="w-10 h-10 md:w-12 md:h-12">
        <img src={arrowCircleGreen} alt="" className="w-full h-full rotate-180" />
      </div>
    </>
  );

  const handleButtonClick = () => {
    onContinue();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 border-0 bg-transparent shadow-none max-w-[95vw] md:max-w-[900px] w-full [&>button]:hidden"
        style={{ background: 'transparent' }}
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            border: '4px solid #314020',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${data.image_url}')` }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(128, 128, 128, ${opacity})` }}
          />

          <VisuallyHidden>
            <DialogTitle>{data.title || 'הודעה'}</DialogTitle>
            <DialogDescription>{data.body_text}</DialogDescription>
          </VisuallyHidden>

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12 md:px-14 md:py-16 min-h-[450px] md:min-h-[520px]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 hover:opacity-70 transition-opacity z-20"
              style={{ color: '#314020' }}
              aria-label="סגור"
            >
              <X className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
            </button>

            {data.title && (
              <h2
                className="font-synopsis text-4xl md:text-6xl font-bold mb-8 md:mb-10"
                style={{ color: '#314020' }}
              >
                {data.title}
              </h2>
            )}

            {data.body_text && (
              <div
                className="font-ploni-aaa font-regular text-base md:text-xl leading-relaxed max-w-[650px] mb-10 md:mb-12 whitespace-pre-line"
                style={{ color: '#314020' }}
              >
                {data.body_text}
              </div>
            )}

            {data.button_text && data.button_link && (
              isExternal ? (
                <a
                  href={data.button_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleButtonClick}
                  className="flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  {buttonContent}
                </a>
              ) : data.button_link === '/catalog' ? (
                <button
                  onClick={handleButtonClick}
                  className="flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  {buttonContent}
                </button>
              ) : (
                <Link
                  to={data.button_link}
                  onClick={() => {
                    handleButtonClick();
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  {buttonContent}
                </Link>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogWelcomePopup;
