import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import arrowCircleGreen from '@/assets/arrow-circle-new.png';

export interface HomepagePopupData {
  title: string;
  body_text: string;
  button_text: string;
  button_link: string;
  image_url: string;
  overlay_opacity: number; // 0-100
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: HomepagePopupData;
}

const HomepagePopup: React.FC<Props> = ({ isOpen, onClose, data }) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 border-0 bg-transparent shadow-none max-w-[95vw] md:max-w-[700px] w-full [&>button]:hidden z-[9999]"
        style={{ background: 'transparent' }}
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            border: '4px solid #314020',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${data.image_url}')` }}
          />

          {/* Gray overlay (admin-controlled opacity) */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(128, 128, 128, ${opacity})` }}
          />

          <VisuallyHidden>
            <DialogTitle>{data.title || 'הודעה'}</DialogTitle>
            <DialogDescription>{data.body_text}</DialogDescription>
          </VisuallyHidden>

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12 md:px-14 md:py-16 min-h-[350px] md:min-h-[420px]">
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
                className="font-synopsis text-3xl md:text-5xl font-bold mb-6 md:mb-8"
                style={{ color: '#314020' }}
              >
                {data.title}
              </h2>
            )}

            {data.body_text && (
              <div
                className="font-ploni-aaa font-regular text-lg md:text-xl leading-relaxed max-w-[550px] mb-8 md:mb-10 whitespace-pre-line"
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
                  onClick={onClose}
                  className="flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  {buttonContent}
                </a>
              ) : (
                <Link
                  to={data.button_link}
                  onClick={() => {
                    onClose();
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

export default HomepagePopup;