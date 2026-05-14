import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
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
      <SEO
        title="מדיניות פרטיות | בוקט - שזירת פרחים"
        description="מדיניות הפרטיות של בוקט שזירת פרחים: כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלך באתר."
        path="/privacy-policy"
      />
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
            מדיניות פרטיות
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none text-foreground font-ploni-aaa">
          
          {/* Owner Details */}
          <div className="mb-8 p-6 bg-[#314020]/5 rounded-lg">
            <h3 className="font-synopsis font-light text-xl text-foreground mb-4">פרטי בעל האתר ובעל השליטה במאגר:</h3>
            <ul className="list-none space-y-2 text-foreground/80">
              <li><strong>שם:</strong> רחל רובינשטיין</li>
              <li><strong>כתובת דואר אלקטרוני:</strong> <a href="mailto:R0527614436@gmail.com" className="text-[#314020] hover:text-[#314020]/70 transition-colors">R0527614436@gmail.com</a></li>
              <li><strong>טלפון:</strong> <a href="tel:0527614436" className="text-[#314020] hover:text-[#314020]/70 transition-colors">0527614436</a></li>
              <li><strong>כתובת URL של האתר:</strong> <a href="https://bouquet-flowers.co.il/" target="_blank" rel="noopener noreferrer" className="text-[#314020] hover:text-[#314020]/70 transition-colors">https://bouquet-flowers.co.il/</a></li>
              <li><strong>מען למכתבים:</strong> שערי תשובה 14 מודיעין עילית</li>
            </ul>
          </div>

          {/* Section 1 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">1. כללי</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            אנו ב'בוקט שזירת פרחים', מכבדים את פרטיות המשתמשים באתר שלנו. לכן, החלטנו לפרסם מדיניות פרטיות ברורה ושקופה, ואנו מתחייבים לפעול לפיה.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-4">
            מטרת מסמך זה היא להסביר כיצד אנו מתנהלים בנוגע לפרטיות המשתמשים. בין היתר, נסביר איזה מידע נאסף, כיצד אנו משתמשים בו, ואילו זכויות עומדות לרשותך בנוגע למידע זה.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-4">
            מדיניות פרטיות זו מותאמת להוראות סעיף 11 לחוק הגנת הפרטיות, התשמ"א–1981.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-4">
            מסמך זה מנוסח בלשון זכר מטעמי נוחות בלבד, אך הוא מיועד לכל המגדרים.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-4">
            אנו ממליצים לקרוא בעיון את מדיניות הפרטיות. המשך השימוש באתר מהווה אישור לכך שקראת, הבנת ושאתה מסכים למדיניות זו. אם אינך מעוניין שהמידע שלך ייאסף בהתאם למדיניות זו, אנא הימנע משימוש באתר.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            אין חובה חוקית למסור את פרטיך, אך שים לב שמסירת מידע מסוים עשויה להיות תנאי לגישה מלאה לתכני האתר, לשירותים שאנו מציעים, או לביצוע רכישות והזמנות.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 2 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">2. המידע שאנו אוספים באתר</h2>
          
          <h3 className="font-synopsis font-light text-xl text-foreground mt-6 mb-3">2.1. בעת השימוש בשירותי האתר נאסף מידע על אודותיך, חלקו מזהה אותך אישית:</h3>
          <ul className="list-disc list-inside space-y-1 text-foreground/80 mr-4">
            <li>פרטי יצירת קשר, כגון שמך, כתובת דואר אלקטרוני, מספר טלפון;</li>
            <li>מידע שהעברת במסגרת התכתבויות ו/או תקשורת עם האתר;</li>
            <li>מידע שהעברת על ההצעות והשירותים שעניינו אותך;</li>
            <li>נעשה שימוש בקבצי 'עוגיות' ו/או 'פיקסלים' שחלקו עשוי לזהות אותך אישית;</li>
            <li>כתובת IP;</li>
          </ul>

          <h3 className="font-synopsis font-light text-xl text-foreground mt-6 mb-3">2.2. חלק מהמידע שנאסף אינו מזהה אישית, למשל:</h3>
          <ul className="list-disc list-inside space-y-1 text-foreground/80 mr-4">
            <li>סוג הדפדפן שממנו אתה צופה באתר;</li>
            <li>סוג המכשיר שממנו אתה צופה באתר;</li>
            <li>אופן השימוש באתר ונתוני גלישה – משך זמן שימוש בכל עמוד, באיזה עמודים ביקרת, פעולות שבוצעו באתר;</li>
            <li>מוצרים שהתעניינת בהם;</li>
            <li>התאמות משתמש כגון שפה מועדפת;</li>
          </ul>

          <hr className="border-border/30 my-8" />

          {/* Section 3 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">3. איסוף המידע</h2>
          <p className="text-foreground/80 leading-relaxed">
            הנתונים שיאספו וכן תכנים שהמשתמש מעלה ו/או משתף ו/או יוצר באתר, יישמרו ברשות בעל האתר. מסדי הנתונים מאוחסנים בשרתי אחסון. המשתמש באתר מצהיר כי הוא מסכים לשמירת מידע בשרתים אלו, אשר עשויים להיות בישראל או בחו"ל.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 4 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">4. מטרות איסוף ושימוש במידע</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            השימוש במידע שנאסף, ייעשה בהתאם למדיניות פרטיות זו, או בהתאם להוראות כל דין החל, על מנת –
          </p>
          <ul className="list-disc list-inside space-y-1 text-foreground/80 mr-4">
            <li>לתת ולאפשר שירותים כמפורט באתר;</li>
            <li>לשפר את השירותים והתכנים המוצעים באתר, לשנותם או לבטלם;</li>
            <li>לתקשר איתך ולהשיב לפניותיך;</li>
            <li>אספקה ושילוח של מוצרים;</li>
            <li>לשלוח ולפרסם מידע ותכנים שיווקיים, ולשם יצירת קשר;</li>
            <li>על מנת להתאים את המודעות שיוצגו בעת ביקורך באתר לתחומי העניין שלך;</li>
            <li>לצורך אכיפת כללים ונהלים באתר כפי שהם מופיעים בתנאי השימוש;</li>
            <li>למטרות בקרה – לרבות אבטחה ומניעת הונאות, זיהוי שימוש לא חוקי באתר;</li>
          </ul>

          <hr className="border-border/30 my-8" />

          {/* Section 5 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">5. הבסיס החוקי לאיסוף המידע</h2>
          <p className="text-foreground/80 leading-relaxed">
            אנו נעבד את המידע האישי שלך, לרבות מידע רגיש, רק כאשר יש לנו בסיס חוקי לעשות זאת- אם נתת הסכמתך לכך או אם יש לנו אישור כדין לעשות זאת.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 6 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">6. דיוור אלקטרוני ויצירת קשר עם המשתמש</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            בעל האתר מעוניין לעדכן את המשתמשים לגבי עדכונים חשובים, התפתחויות ועניינים רלוונטיים אחרים הקשורים לאתר ולשירותיו. על מנת להבטיח תקשורת רציפה ומעודכנת, בעל האתר רשאי לשלוח הודעות (נוטיפיקציות) למשתמשים.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-4">
            כמו כן, בעל האתר מעוניין לשלוח אליך, מעת לעת, ניוזלטרים או הודעות אחרות במייל, ו/או במסרון SMS או בוואטסאפ ו/או באמצעים דיגיטליים אחרים, על אודות השירותים והמוצרים וכן מידע שיווקי ופרסומי.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            הודעות דיוור, יישלחו אליך רק אם נתת הסכמתך המפורשת, ובכל עת תוכל לבטל את הסכמתך ולהפסיק לקבלו.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 7 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">7. מסירת מידע לצד שלישי</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            בעל האתר לא יעביר לצדדים שלישיים את פרטיך האישיים והמידע שנאסף על פעילותך באתר אלא במקרים המפורטים להלן:
          </p>
          <ul className="list-disc list-inside space-y-1 text-foreground/80 mr-4">
            <li>שם וכתובת המייל מועברים לספק מערכת הדיוור של האתר;</li>
            <li>אם תרכוש מוצרים ושירותים באמצעות האתר, יסופק לצד השלישי המידע הנחוץ לו להשלמת תהליך הרכישה ו/או האספקה;</li>
            <li>חלק מהשירותים באתר מסופקים על ידי צדדים שלישיים, להם יש תנאי שימוש ומדיניות פרטיות נפרדת:</li>
            <li>תוכן ההודעות והשיחות בוואטסאפ כפוף גם למדיניות הפרטיות של META;</li>
            <li>חלק מהמידע מועבר לספק אשר מספק שירותי אחסון לאתר;</li>
            <li>מידע אודות השימוש והפעילות שלך באתר, יעבור לפלטפורמות שיווק כגון META ו-GOOGLE באמצעות קבצי COOKIES ו/או פיקסלים. כמו כן, יתכן שהאתר יעביר לצדדים שלישיים מידע סטטיסטי כללי בלבד, שאינו אישי או פרטי, לגבי השימוש באתר, כגון המספר הכולל של המבקרים באתר זה ובכל עמוד של האתר וכן שמות הדומיין של נותני שירות האינטרנט של המבקרים באתר;</li>
            <li>במקרה של מחלוקת משפטית בינך לבין בית העסק שתחייב את חשיפת פרטיך;</li>
            <li>אם תבצע באתר פעולות המנוגדות לחוק;</li>
            <li>אם יתקבל צו בית משפט המורה למסור את פרטיך או מידע על אודותיך לצד שלישי;</li>
            <li>העברות בעלות עסקיות, מיזוגים וכיוצא בזה: במקרה של מיזוג, רכישה או העברה של נכסים, המידע האישי שלך עשוי להיות מועבר לצד שלישי כחלק מהעסקה, בתנאי שהתאגיד הנעבר יקבל על עצמו את הוראות מדיניות פרטיות זו;</li>
          </ul>

          <hr className="border-border/30 my-8" />

          {/* Section 8 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">8. עוגיות (Cookies)</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            עוגייה (קובץ "Cookie") היא קוד אשר משמש לאימות, מעקב אחר נתוני גלישה וכן לשמירת מידע על אודות המשתמשים. כל עוגייה נוצרת על ידי שרת, ומועברת לדפדפן של המשתמש; הדפדפן שלך הוא זה ששומר עוגיות בזיכרון של המחשב או המכשיר שלך.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-4">
            האתר משתמש בעוגיות לצורך תפעולו השוטף והתקין, ובכלל זה כדי לאסוף נתונים סטטיסטיים על המשתמש ביחס לשימוש באתר, לאימות פרטים, כדי להתאים את האתר להעדפותיך האישיות ולצורכי אבטחת מידע.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-4">
            דפדפנים מודרניים כוללים אפשרות להימנע מקבלת עוגיות וכן למחוק את העוגיות הקיימות. אם אינך יודע כיצד לעשות זאת, בדוק בקובץ העזרה של הדפדפן שבו אתה משתמש.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-2">באתר יתכן ויעשה שימוש בשלושה סוגי עוגיות:</p>
          <ul className="list-decimal list-inside space-y-1 text-foreground/80 mr-4">
            <li><strong>Cookies חיוניים:</strong> הכרחיים לתפעול התקין של האתר (לדוגמה: מתן אפשרות כניסה לחשבון).</li>
            <li><strong>Cookies לביצועים:</strong> משמשים לניתוח השימוש באתר, לדוגמה (Google Analytics).</li>
            <li><strong>Cookies פרסומיים:</strong> מספקים פרסומות מותאמות אישית למשתמש.</li>
          </ul>

          <hr className="border-border/30 my-8" />

          {/* Section 9 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">9. אבטחת מידע</h2>
          <p className="text-foreground/80 leading-relaxed">
            באתר מיושמות מערכות ונהלים עדכניים לאבטחת מידע. בעוד שמערכות ונהלים אלה מצמצמים את הסיכונים לחדירה בלתי-מורשית, אין הם מעניקים בטחון מוחלט. לכן, בעל האתר לא מתחייב שהאתר ושירותיו יהיו חסינים באופן מוחלט מפני גישה בלתי-מורשית למידע המאוחסן בהם והמשתמש מצהיר כי הוא מודע ומסכים לכך.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 10 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">10. זכויות נשוא המידע</h2>
          
          <h3 className="font-synopsis font-light text-xl text-foreground mt-6 mb-3">10.1. זכות העיון</h3>
          <p className="text-foreground/80 leading-relaxed mb-4">
            על-פי חוק הגנת הפרטיות, התשמ"א - 1981, כל אדם זכאי לעיין במידע על אודותיו, המוחזק במאגר מידע.
          </p>

          <h3 className="font-synopsis font-light text-xl text-foreground mt-6 mb-3">10.2. זכות לתיקון מידע</h3>
          <p className="text-foreground/80 leading-relaxed mb-4">
            אדם שעיין במידע שעליו ומצא כי אינו נכון, שלם, ברור או מעודכן, רשאי לפנות לבעל מאגר המידע בבקשה לתקן את המידע או למוחקו.
          </p>

          <h3 className="font-synopsis font-light text-xl text-foreground mt-6 mb-3">10.3. פניות בנושאי זכויות</h3>
          <p className="text-foreground/80 leading-relaxed">
            יש להפנות בדרכי יצירת הקשר הרשומות מעלה.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 11 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">11. דיווח על פגיעה בפרטיות</h2>
          <p className="text-foreground/80 leading-relaxed">
            אם אתה סבור כי פרטיותך נפגעה במסגרת או בזיקה לפעילות האתר, אנא פנה לבעל האתר ופרט בפנייתך את נסיבות הפגיעה כפי שאתה רואה אותה. כמו כן, אם יש לך שאלות או חששות בנוגע לעיבוד המידע האישי שלך או שתרצה לממש את זכויותיך, בעל האתר יענה תוך זמן סביר לפניותיך ויספק לך את המידע הדרוש לך. ניתן לפנות לבעל האתר באמצעות בדרכי יצירת הקשר הרשומות בראשית מסמך זה.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 12 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">12. שינויים במדיניות הפרטיות</h2>
          <p className="text-foreground/80 leading-relaxed">
            אנו נסקור ונעדכן באופן קבוע את מדיניות הפרטיות שלנו כדי להבטיח שהיא משקפת את נהלי הטיפול הנוכחיים שלנו בנתונים. כל העדכונים יימסרו לך בבירור, ואנו נקבל את הסכמתך ככל ויידרש על פי דין.
          </p>

          <p className="text-foreground/80 leading-relaxed mt-8 font-semibold">
            מדיניות הפרטיות עודכנה בתאריך: דצמבר 2025
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

export default PrivacyPolicy;
