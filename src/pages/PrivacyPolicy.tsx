import { Link } from "react-router-dom";
import { useEffect } from "react";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('/lovable-uploads/contact-hero.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="relative z-10 text-center">
          <h1 className="font-synopsis font-light text-4xl md:text-5xl text-white mb-4">
            מדיניות פרטיות
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none text-foreground font-ploni-aaa">
          
          <p className="text-muted-foreground mb-8">
            המדיניות מנוסחת בלשון נקבה למען הנוחות, אך פונה לכל המינים.
          </p>

          {/* Section 1 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">1. כללי</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            ברוכה הבאה לאתר "בוקט" (להלן: "האתר").
            האתר מופעל ומנוהל על-ידי בעלת העסק רחל רובינשטיין, המכהנת גם כממונה הגנת הנתונים.
            מדיניות פרטיות זו מפרטת כיצד נאסף, נשמר ומנוצל מידע הנוגע לגולשות האתר.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            גלישה באתר מהווה הסכמה למדיניות זו.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 2 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">2. פרטי העסק והממונה על הגנת המידע</h2>
          <ul className="list-none space-y-2 text-foreground/80">
            <li><strong>שם העסק:</strong> בוקט</li>
            <li><strong>ממונה הגנת נתונים:</strong> רחל רובינשטיין</li>
            <li><strong>כתובת העסק:</strong> שערי תשובה 14, מודיעין עילית</li>
            <li><strong>מיקוד:</strong> 7182616</li>
            <li><strong>טלפון:</strong> 052-7614436</li>
            <li><strong>דוא"ל:</strong> <a href="mailto:R0527614436@gmail.com" className="text-gold-dark hover:text-gold transition-colors">R0527614436@gmail.com</a></li>
          </ul>

          <hr className="border-border/30 my-8" />

          {/* Section 3 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">3. סוג השירות באתר</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            האתר מאפשר ביצוע הזמנת מוצרים <strong>ללא תשלום באתר</strong>.
            האתר אינו מפעיל מערכת סליקה ואינו שומר פרטי אשראי.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 4 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">4. מידע הנאסף באתר</h2>
          <p className="text-foreground/80 leading-relaxed mb-4">האתר אוסף מידע משני סוגים:</p>
          
          <h3 className="font-synopsis font-light text-xl text-foreground mt-6 mb-3">א. נתוני גלישה (מידע לא מזוהה אישית)</h3>
          <p className="text-foreground/80 leading-relaxed mb-2">האתר אוסף נתונים סטטיסטיים לצורך:</p>
          <ul className="list-disc list-inside space-y-1 text-foreground/80 mr-4">
            <li>שיפור חוויית ונוחות הגלישה</li>
            <li>שיפור תפקוד האתר</li>
            <li>התאמת תכני האתר לגולשות</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed mt-4">
            מידע זה עשוי לכלול: זמן שהייה, עמודים בהם ביקרתן, סוג הדפדפן, סוג המכשיר ועוד.
            המידע אינו מזהה את המשתמשת באופן אישי.
          </p>

          <h3 className="font-synopsis font-light text-xl text-foreground mt-6 mb-3">ב. מידע שמסרת מרצון</h3>
          <p className="text-foreground/80 leading-relaxed">
            האתר ישמור מידע <strong>רק אם תבחרי לשלוח הודעה דרך האתר</strong> (למשל: שם, טלפון, מייל ותוכן הפנייה).
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 5 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">5. שימוש במידע</h2>
          <p className="text-foreground/80 leading-relaxed mb-2">המידע שתמסרי יישמר וישמש רק למטרות הבאות:</p>
          <ul className="list-disc list-inside space-y-1 text-foreground/80 mr-4">
            <li>מענה לפניות שנשלחו דרך האתר</li>
            <li>יצירת קשר לפי הצורך</li>
            <li>שיפור השירות וחוויית המשתמשת</li>
            <li>תיעוד התכתבויות במידת הצורך</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed mt-4">
            האתר <strong>אינו שולח הודעות מכל סוג</strong> אלא אם המשתמשת יזמה פנייה.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 6 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">6. שמירת מידע ואבטחתו</h2>
          <p className="text-foreground/80 leading-relaxed">
            האתר נוקט באמצעי אבטחה מקובלים להגנה על המידע מפני גישה בלתי מורשית.
            למרות המאמצים, אין ביכולתנו להבטיח אבטחה מוחלטת של מערכות מידע.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 7 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">7. מסירת מידע לצד שלישי</h2>
          <p className="text-foreground/80 leading-relaxed mb-2">
            האתר <strong>אינו מעביר מידע לצדדים שלישיים</strong>, אלא אם:
          </p>
          <ul className="list-disc list-inside space-y-1 text-foreground/80 mr-4">
            <li>נדרשת מסירה על פי חוק</li>
            <li>ניתנה הסכמת המשתמשת במפורש</li>
            <li>הדבר נדרש לצורך הפעלת האתר ושיפורו, ובכפוף להתחייבות לסודיות</li>
          </ul>

          <hr className="border-border/30 my-8" />

          {/* Section 8 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">8. זכויות המשתמשת</h2>
          <p className="text-foreground/80 leading-relaxed mb-2">על פי חוק הגנת הפרטיות, כל משתמשת זכאית לדרוש:</p>
          <ul className="list-disc list-inside space-y-1 text-foreground/80 mr-4">
            <li>עיון במידע שנשמר אודותיה</li>
            <li>תיקון מידע שגוי</li>
            <li>מחיקת מידע מסוים בכפוף לדין</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed mt-4">
            פניות בנושא ניתן לשלוח לדוא"ל: <a href="mailto:R0527614436@gmail.com" className="text-gold-dark hover:text-gold transition-colors font-semibold">R0527614436@gmail.com</a>
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 9 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">9. שינוי במדיניות הפרטיות</h2>
          <p className="text-foreground/80 leading-relaxed">
            האתר רשאי לעדכן מדיניות זו מעת לעת.
            הנוסח העדכני יפורסם באתר וייכנס לתוקף מיד עם פרסומו.
          </p>

          <hr className="border-border/30 my-8" />

          {/* Section 10 */}
          <h2 className="font-synopsis font-light text-2xl text-foreground mt-12 mb-4">10. יצירת קשר</h2>
          <p className="text-foreground/80 leading-relaxed">
            לשאלות בנושא מדיניות פרטיות זו ניתן לפנות לכתובת:
            <br />
            <a href="mailto:R0527614436@gmail.com" className="text-gold-dark hover:text-gold transition-colors font-semibold">R0527614436@gmail.com</a>
            <br />
            או בטלפון <a href="tel:052-7614436" className="text-gold-dark hover:text-gold transition-colors font-semibold">052-7614436</a>
          </p>

        </div>

        {/* Back Link */}
        <div className="mt-16 text-center">
          <Link 
            to="/" 
            className="font-synopsis font-light text-gold-dark hover:text-gold transition-colors"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/20">
        <div className="container mx-auto px-4 text-center">
          <p className="font-synopsis font-light text-foreground/60 text-sm">
            © {new Date().getFullYear()} בוקט. כל הזכויות שמורות.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
