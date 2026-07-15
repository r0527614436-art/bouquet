import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import arrowCircleGreen from '@/assets/arrow-circle-new.png';

interface PopupRow {
  id: string;
  page_path: string;
  is_active: boolean;
  title: string;
  body_text: string;
  button_text: string;
  button_link: string;
  image_url: string;
  overlay_opacity: number;
}

const SitePopup: React.FC = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const { data: popups = [] } = useQuery({
    queryKey: ['popups-public'],
    queryFn: async () => {
      const { data, error } = await supabase.from('popups').select('*');
      if (error) throw error;
      return (data || []) as PopupRow[];
    },
  });

  const popup = popups.find(
    (p) => p.is_active && p.page_path === location.pathname,
  );

  useEffect(() => {
    setOpen(false);
    if (!popup) return;
    const key = `popup-shown:${popup.id}`;
    if (sessionStorage.getItem(key)) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(key, '1');
    }, 1500);
    return () => clearTimeout(t);
  }, [popup?.id, location.pathname]);

  if (!popup) return null;

  const isExternal = /^https?:\/\//i.test(popup.button_link);
  const opacity = Math.min(100, Math.max(0, popup.overlay_opacity)) / 100;

  const buttonContent = (
    <>
      <span
        className="font-synopsis text-xl md:text-2xl font-semibold"
        style={{ color: '#314020' }}
      >
        {popup.button_text}
      </span>
      <div className="w-10 h-10 md:w-12 md:h-12">
        <img src={arrowCircleGreen} alt="" className="w-full h-full rotate-180" />
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
      <DialogContent
        className="p-0 border-0 bg-transparent shadow-none max-w-[95vw] md:max-w-[800px] w-full [&>button]:hidden z-[9999]"
        style={{ background: 'transparent' }}
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            border: '4px solid #314020',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {popup.image_url && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${popup.image_url}')` }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(128, 128, 128, ${opacity})` }}
          />

          <VisuallyHidden>
            <DialogTitle>{popup.title || 'הודעה'}</DialogTitle>
            <DialogDescription>{popup.body_text}</DialogDescription>
          </VisuallyHidden>

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12 md:px-14 md:py-16 min-h-[400px] md:min-h-[480px]">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 hover:opacity-70 transition-opacity z-20"
              style={{ color: '#314020' }}
              aria-label="סגור"
            >
              <X className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
            </button>

            {popup.title && (
              <h2
                className="font-synopsis text-3xl md:text-5xl font-bold mb-6 md:mb-8"
                style={{ color: '#314020' }}
              >
                {popup.title}
              </h2>
            )}

            {popup.body_text && (
              <div
                className="font-ploni-aaa font-regular text-base md:text-xl leading-relaxed max-w-[650px] mb-8 md:mb-10 whitespace-pre-line"
                style={{ color: '#314020' }}
              >
                {popup.body_text}
              </div>
            )}

            {popup.button_text && popup.button_link && (
              isExternal ? (
                <a
                  href={popup.button_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  {buttonContent}
                </a>
              ) : popup.button_link === popup.page_path ? (
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  {buttonContent}
                </button>
              ) : (
                <Link
                  to={popup.button_link}
                  onClick={() => {
                    setOpen(false);
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

export default SitePopup;