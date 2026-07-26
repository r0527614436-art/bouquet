import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  const [virtualPath, setVirtualPath] = useState<string | null>(null);

  const { data: popups = [] } = useQuery({
    queryKey: ['popups-public'],
    queryFn: async () => {
      const { data, error } = await supabase.from('popups').select('*');
      if (error) throw error;
      return (data || []) as PopupRow[];
    },
  });

  const activePath = virtualPath ?? location.pathname;

  const popup = popups.find(
    (p) => p.is_active && p.page_path === activePath,
  );

  // Allow other parts of the app (e.g. the quick-order dialog) to trigger a popup
  useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      if (typeof path === 'string') setVirtualPath(path);
    };
    window.addEventListener('site-popup:show', handler as EventListener);
    return () => window.removeEventListener('site-popup:show', handler as EventListener);
  }, []);

  // Reset any virtual popup when navigating
  useEffect(() => {
    setVirtualPath(null);
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
    if (!popup) return;
    const t = setTimeout(() => {
      setOpen(true);
    }, virtualPath ? 300 : 1500);
    return () => clearTimeout(t);
  }, [popup?.id, activePath]);

  // Close without blocking default behaviour (needed so links still navigate)
  const handleClose = (event?: React.SyntheticEvent) => {
    if (event) event.stopPropagation();
    setOpen(false);
    setVirtualPath(null);
  };

  // Close for non-navigating elements (overlay / X button)
  const handleDismiss = (event?: React.SyntheticEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setOpen(false);
    setVirtualPath(null);
  };

  if (!popup || !open) return null;

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

  return createPortal(
    <div
      data-site-popup-root="true"
      className="fixed inset-0 flex items-center justify-center p-4 pointer-events-auto"
      style={{ zIndex: 100000, pointerEvents: 'auto' }}
      role="dialog"
      aria-modal="false"
      aria-label={popup.title || 'הודעה'}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleDismiss}
      />
      <div className="relative w-full max-w-[95vw] md:max-w-[800px]">
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

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12 md:px-14 md:py-16 min-h-[400px] md:min-h-[480px]">
            <button
              type="button"
              onClick={handleDismiss}
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
                  onClick={handleClose}
                  className="flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  {buttonContent}
                </a>
              ) : popup.button_link === popup.page_path || popup.button_link === location.pathname ? (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex items-center gap-4 hover:scale-105 transition-transform"
                >
                  {buttonContent}
                </button>
              ) : (
                <Link
                  to={popup.button_link}
                  onClick={(event) => {
                    handleClose(event);
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
      </div>
    </div>,
    document.body,
  );
};

export default SitePopup;