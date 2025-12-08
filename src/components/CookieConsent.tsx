import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 max-w-xs bg-background border border-border/30 rounded-lg shadow-lg p-4 animate-fade-in"
      dir="rtl"
    >
      <button 
        onClick={handleReject}
        className="absolute top-2 left-2 text-foreground/50 hover:text-foreground transition-colors"
        aria-label="סגור"
      >
        <X className="w-4 h-4" />
      </button>
      
      <p className="font-ploni-aaa text-sm text-foreground/80 mb-4 pr-2">
        אתר זה משתמש בעוגיות לשיפור חוויית הגלישה.{" "}
        <Link to="/privacy-policy" className="text-gold-dark hover:text-gold underline">
          מדיניות פרטיות
        </Link>
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="flex-1 bg-gold-dark hover:bg-gold text-background font-synopsis font-light text-sm py-2 px-3 rounded transition-colors"
        >
          קבל הכל
        </button>
        <button
          onClick={handleReject}
          className="flex-1 border border-border/50 hover:bg-foreground/5 text-foreground font-synopsis font-light text-sm py-2 px-3 rounded transition-colors"
        >
          דחה הכל
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
