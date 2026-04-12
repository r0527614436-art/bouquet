import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AccessibilityStatement = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openGoogleMaps = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=שערי+תשובה+14+מודיעין+עילית', '_blank');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.phone || !contactForm.email || !contactForm.message) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await supabase.functions.invoke('send-contact', {
        body: {
          name: contactForm.name,
          phone: contactForm.phone,
          email: contactForm.email,
          message: contactForm.message
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "שגיאה בשליחת ההודעה");
      }

      toast({
        title: "הפנייה נשלחה",
        description: "תודה על פנייתך, נחזור אליך בהקדם"
      });
      
      setContactForm({ name: '', phone: '', email: '', message: '' });
    } catch (error: any) {
      console.error("Error sending contact form:", error);
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FBF4' }} dir="rtl">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover"
          style={{ 
            backgroundImage: `url('/lovable-uploads/contact-hero.webp')`,
            backgroundPosition: 'center 75%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#F8FBF4]" />
        <div className="relative z-10 text-center">
          <h1 className="font-synopsis font-light text-4xl md:text-5xl text-white mb-4">
            הצהרת נגישות
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none text-foreground font-ploni-aaa">
          
          <p className="text-foreground/80 leading-relaxed mb-8">
            37a9b20d-62bb-4776-af56-856e2275b0c8.lovableproject.com מחויב להבטיח נגישות דיגיטלית לכל המשתמשים, ללא קשר ליכולותיהם. אנו מציעים מגוון כלים ותכונות נגישות באמצעות סרגל הנגישות של החברה שלנו כדי לספק חוויה מכילה וחלקה.
          </p>

          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">תכונות</h2>
          
          <ul className="list-none space-y-4 text-foreground/80">
            <li><strong>קורא מסך:</strong> מסייע למשתמשים עם לקות ראייה על ידי קריאת תוכן האתר בקול רם.</li>
            <li><strong>ניווט מקלדת:</strong> מאפשר למשתמשים לנווט באתר באמצעות המקלדת בלבד.</li>
            <li><strong>ניווט קולי:</strong> מאפשר למשתמשים לשלוט באתר באמצעות פקודות קוליות.</li>
            <li><strong>קורא טקסט:</strong> מספק דרך קלה לקריאת הטקסט בקול רם.</li>
            <li><strong>אפשרויות ניגודיות:</strong> מעבר בין ניגודיות כהה לבהירה בהתאם להעדפות הויזואליות.</li>
            <li><strong>הגדרות רוויה:</strong> התאמה בין רוויה גבוהה לנמוכה או מעבר למצב שחור-לבן לפשטות ויזואלית.</li>
            <li><strong>התאמות תוכן:</strong> שינוי גודל טקסט, ריווח טקסט, ריווח גובה וריווח אותיות לשיפור הקריאות.</li>
            <li><strong>מיקום טקסט:</strong> יישור טקסט לשמאל, לימין או למרכז לנוחיותך.</li>
            <li><strong>הדגשת קישורים וכותרות:</strong> הדגשת קישורים וכותרות לאיתור קל של מידע חשוב.</li>
            <li><strong>גופנים קריאים:</strong> הפעלת גופנים קריאים יותר לבהירות טובה יותר.</li>
            <li><strong>סמן גדול:</strong> הגדלת הסמן לשיפור הנראות.</li>
            <li><strong>עצירת אנימציות:</strong> השהיית כל האנימציות להפחתת הסחות דעת.</li>
            <li><strong>עזר קריאה:</strong> שימוש במסיכת קריאה או מדריך קריאה לעזרה בהתמקדות בחלקים ספציפיים של הטקסט.</li>
            <li><strong>מבנה דף:</strong> ניווט קל דרך מבנה הדף.</li>
            <li><strong>מילון:</strong> קבלת הגדרות למילים קשות ישירות בדף.</li>
            <li><strong>הסתרת תמונות:</strong> הסתרת תמונות להתמקדות בתוכן הטקסטואלי.</li>
            <li><strong>חלוניות מידע:</strong> הפעלת חלוניות מידע להסברים נוספים על אלמנטים.</li>
          </ul>

          <hr className="border-border/30 my-8" />

          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">תמיכה בטכנולוגיה מסייעת</h2>
          <p className="text-foreground/80 leading-relaxed">
            אתר זה תואם למגוון רחב של טכנולוגיות מסייעות, כולל קוראי מסך, תוכנות זיהוי קול ומכשירים אחרים המיועדים לעזור למשתמשים לנווט בתוכן דיגיטלי. אנו מחויבים להבטיח שהאתר שלנו עובד ביעילות עם כלים אלה.
          </p>

          <hr className="border-border/30 my-8" />

          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">צור קשר לתמיכה בנגישות</h2>
          <p className="text-foreground/80 leading-relaxed">
            אם אתה נתקל בקשיים בגישה לתוכן או זקוק לסיוע, תוכל לדווח על בעיה ישירות דרך חלק 'דווח על בעיה' באתר זה. אנו מחויבים לטפל בכל בעיות הנגישות ולשפר באופן מתמיד את נגישות האתר שלנו.
          </p>

          <hr className="border-border/30 my-8" />

          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">הצהרת אחריות</h2>
          <p className="text-foreground/80 leading-relaxed">
            בעוד אנו שואפים להבטיח שהאתר נגיש במלואו ועומד בתקני הנגישות העדכניים ביותר, ייתכן שחלק מהתוכן של צד שלישי או קישורים חיצוניים לא יעמדו במלואם בהנחיות הנגישות. אנו עובדים באופן מתמיד לשיפור הנגישות של אתר זה ומקבלים בברכה משוב על כל בעיה שאתה עשוי להיתקל בה.
          </p>

        </div>

        {/* Back Link */}
        <div className="mt-16 text-center">
          <Link 
            to="/" 
            className="font-synopsis font-light text-[#314020] hover:text-[#314020]/70 transition-colors"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Left Side - Title and Contact Info */}
            <div className="w-full md:w-1/2 text-right flex flex-col justify-start pt-12">
              {/* Title with layered effect */}
              <div className="relative mb-12">
                <h2 className="font-allura text-[95px] md:text-[105px] font-light text-[#314020]/40 opacity-60 leading-none select-none" style={{
                  transform: 'translate(15px, -10px)'
                }}>
                  Contact us
                </h2>
                <h2 className="font-synopsis text-[80px] md:text-[90px] font-semibold text-[#314020] absolute top-1/2 right-0 -translate-y-1/2 leading-none">
                  צור קשר
                </h2>
              </div>

              {/* Contact Information */}
              <div className="space-y-6 mt-10">
                <div className="flex items-center justify-start gap-3 text-lg">
                  <MapPin className="h-6 w-6 text-[#314020]" />
                  <button onClick={openGoogleMaps} className="hover:text-[#314020]/70 transition-colors font-ploni-aaa font-light text-left text-[#314020]">
                    שערי תשובה 14 - מודיעין עילית
                  </button>
                </div>
                
                <div className="flex items-center justify-start gap-3 text-lg">
                  <Mail className="h-6 w-6 text-[#314020]" />
                  <a href="mailto:R0527614436@GMAIL.COM" className="hover:text-[#314020]/70 transition-colors font-ploni-aaa font-light text-[#314020]">
                    R0527614436@GMAIL.COM
                  </a>
                </div>
                
                <div className="flex items-center justify-start gap-3 text-lg">
                  <Phone className="h-6 w-6 text-[#314020]" />
                  <a href="tel:0527614436" className="hover:text-[#314020]/70 transition-colors font-ploni-aaa font-light text-[#314020]">
                    0527614436
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="w-full md:w-1/2">
              <form onSubmit={handleContactSubmit} className="space-y-4 p-8">
                <div className="space-y-1 text-right">
                  <label htmlFor="name" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    שם מלא
                  </label>
                  <input id="name" type="text" value={contactForm.name} onChange={e => setContactForm({
                    ...contactForm,
                    name: e.target.value
                  })} className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light text-[#314020]" required />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="phone" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    טלפון
                  </label>
                  <input id="phone" type="tel" value={contactForm.phone} onChange={e => setContactForm({
                    ...contactForm,
                    phone: e.target.value
                  })} className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light text-[#314020]" required />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="email" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    אימייל
                  </label>
                  <input id="email" type="email" value={contactForm.email} onChange={e => setContactForm({
                    ...contactForm,
                    email: e.target.value
                  })} className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light text-[#314020]" required />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="message" className="block text-sm font-ploni-aaa font-medium text-[#314020]">
                    הודעה
                  </label>
                  <textarea id="message" value={contactForm.message} onChange={e => setContactForm({
                    ...contactForm,
                    message: e.target.value
                  })} className="w-full bg-transparent border-0 border-b-2 border-[#314020] text-right px-0 py-1 focus:outline-none focus:border-[#314020] focus:ring-0 font-ploni-aaa font-light min-h-[60px] resize-none text-[#314020]" required />
                </div>

                <button type="submit" className="w-full bg-[#314020] hover:bg-[#314020]/90 text-white font-ploni-aaa font-medium text-lg py-3 rounded-full transition-all duration-300 disabled:opacity-50" disabled={isSubmitting}>
                  {isSubmitting ? 'שולח...' : 'שליחה'}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  בשליחת הטופס את/ה מסכימ/ה ל<Link to="/privacy-policy" className="text-[#314020] hover:underline">מדיניות הפרטיות</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#11150d] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <p className="text-white/90 font-ploni-aaa text-base">
              בוקט - שזירת פרחים מקצועית | <a href="tel:0527614436" className="hover:text-white transition-colors">0527614436</a> | <a href="mailto:r0527614436@gmail.com" className="hover:text-white transition-colors">r0527614436@gmail.com</a>
            </p>
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="text-white/60 text-sm hover:text-white transition-colors">
                מדיניות פרטיות
              </Link>
              <Link to="/accessibility" className="text-white/60 text-sm hover:text-white transition-colors">
                הצהרת נגישות
              </Link>
            </div>
            <p className="text-white/60 text-sm">
              © 2025 כל הזכויות שמורות ל <a href="https://jobclic.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">AD אתרים</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AccessibilityStatement;
