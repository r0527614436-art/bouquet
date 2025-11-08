import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Order = () => {
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<'price-inquiry' | 'full-order' | null>(null);
  
  // Form state
  const [eventDate, setEventDate] = useState<Date>();
  const [name, setName] = useState('');
  const [eventPhone, setEventPhone] = useState('');
  const [email, setEmail] = useState(''); // For price inquiry
  const [mechutanPhone, setMechutanPhone] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [dressColor, setDressColor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  const daysOfWeek = [
    { value: 'sunday', label: 'ראשון' },
    { value: 'monday', label: 'שני' },
    { value: 'tuesday', label: 'שלישי' },
    { value: 'wednesday', label: 'רביעי' },
    { value: 'thursday', label: 'חמישי' },
    { value: 'friday', label: 'שישי' },
    { value: 'saturday', label: 'שבת' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'מזומן' },
    { value: 'bit', label: 'ביט' },
    { value: 'bank_transfer', label: 'העברה בנקאית' },
    { value: 'credit', label: 'אשראי' }
  ];

  const handlePriceInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !eventPhone) {
      toast({
        title: "שגיאה",
        description: "אנא מלאו את השם והטלפון",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const inquiryData = {
        type: 'price-inquiry',
        customer_name: name,
        phone: eventPhone,
        email: email || null,
        items: JSON.stringify(items),
        notes: notes || null,
        created_at: new Date().toISOString()
      };

      // Send price inquiry via Supabase edge function
      const { error } = await supabase.functions.invoke('send-order', {
        body: inquiryData
      });

      if (error) throw error;

      setOrderSubmitted(true);
      clearCart();
      
      toast({
        title: "בקשת בירור מחיר נשלחה",
        description: "בקשת בירור מחיר התקבלה! נחזור אליך בהקדם עם הצעת מחיר מותאמת",
      });

    } catch (error) {
      console.error('Error submitting price inquiry:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת הבקשה. אנא נסו שוב",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFullOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventDate || !name || !eventPhone || !dayOfWeek || !city || !street || !building || !paymentMethod) {
      toast({
        title: "שגיאה",
        description: "אנא מלאו את כל השדות הנדרשים",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        type: 'full-order',
        event_date: eventDate.toISOString(),
        customer_name: name,
        event_phone: eventPhone,
        mechutan_phone: mechutanPhone,
        day_of_week: dayOfWeek,
        delivery_city: city,
        delivery_street: street,
        delivery_building: building,
        delivery_entrance: entrance || null,
        delivery_floor: floor || null,
        dress_color: dressColor || null,
        payment_method: paymentMethod,
        notes: notes || null,
        items: JSON.stringify(items),
        created_at: new Date().toISOString()
      };

      // Send order via Supabase edge function
      const { error } = await supabase.functions.invoke('send-order', {
        body: orderData
      });

      if (error) throw error;

      setOrderSubmitted(true);
      clearCart();
      
      toast({
        title: "הזמנה נשלחה",
        description: "ההזמנה נשלחה בהצלחה! ניצור איתכם קשר בקרוב",
      });

    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשליחת ההזמנה. אנא נסו שוב",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">אין פריטים בעגלה</h2>
          <Link to="/catalog">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              חזרה לקטלוג
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">ההזמנה נשלחה בהצלחה!</h2>
          <p className="text-gray-600 mb-6">
            הזמנתך התקבלה! נחזור אליכם לביצוע התשלום
          </p>
          <div className="space-y-3">
            <Link to="/catalog" className="block">
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                המשיכו לקנות
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button variant="outline" className="w-full border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white">
                חזרה לעמוד הבית
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/cart" className="flex items-center text-pink-600 hover:text-pink-800">
              <ArrowRight className="h-5 w-5 ml-2" />
              חזרה לעגלה
            </Link>
            
            <div className="flex items-center">
              <div className="bg-gray-500/40 backdrop-blur-sm rounded-t-[3rem] p-3 mx-px my-0 px-px py-[3px]">
                <img 
                  src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                  alt="בוקט לוגו" 
                  className="h-32 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pink-800 mb-2">פרטי הזמנה</h1>
          <p className="text-gray-600">אנא מלאו את הפרטים להשלמת ההזמנה</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">סיכום הזמנה</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded object-cover" />
                  <span className="text-gray-800">{item.title}</span>
                </div>
                <div className="text-gray-600">
                  כמות: {item.quantity} {item.price && `| ₪${item.price}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Type Selection */}
        {!selectedOrderType ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
              בחרו סוג פעולה
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Button
                onClick={() => setSelectedOrderType('price-inquiry')}
                variant="outline"
                className="relative group h-28 bg-transparent border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10">בירור מחיר</span>
              </Button>
              <Button
                onClick={() => setSelectedOrderType('full-order')}
                variant="outline"
                className="relative group h-28 bg-transparent border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10">ביצוע הזמנה</span>
              </Button>
            </div>
          </div>
        ) : selectedOrderType === 'price-inquiry' ? (
          /* Price Inquiry Contact Info */
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">בירור מחיר</h2>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedOrderType(null)}
                className="text-sm"
              >
                חזרה לבחירה
              </Button>
            </div>

            <div className="text-center space-y-6">
              <div className="bg-pink-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-pink-800 mb-4">
                  לבירור מחיר יש ליצור קשר
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">טלפון</h4>
                    <a 
                      href="tel:0527614436" 
                      className="text-2xl font-bold text-pink-600 hover:text-pink-800 transition-colors"
                    >
                      0527614436
                    </a>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => window.open('https://wa.me/972527614436', '_blank')}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 fill-current ml-2"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085"/>
                      </svg>
                      שלח הודעה בוואטסאפ
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-gray-600">
                <p className="mb-2">מומלץ לשלוח את התמונות שלכם בוואטסאפ</p>
                <p>כדי לקבל הצעת מחיר מדויקת ומהירה</p>
              </div>
            </div>
          </div>
        ) : (
          /* Full Order Form */
          <div className="space-y-6">
            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">לתשומת ליבך לפני הזמנה</h3>
              <p className="text-yellow-700 mb-2">
                הזמנה מחייבת בירור מחיר מראש — אנא חזור ובחר באופציית בירור מחיר.
              </p>
              <p className="text-yellow-700 mb-2">
                אין לבצע הזמנה לפני קבלת הצעת מחיר.
              </p>
              <p className="text-yellow-700">
                שימו ❤️: סוגי הפרחים משתנים לפי עונות השנה ואין התחייבות לסוג מדויק.
              </p>
            </div>

            <form onSubmit={handleFullOrder} className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">ביצוע הזמנה מלאה</h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedOrderType(null)}
                  className="text-sm"
                >
                  חזרה לבחירה
                </Button>
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-right block">תאריך האירוע *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !eventDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="ml-2 h-4 w-4" />
                      {eventDate ? format(eventDate, "PPP", { locale: he }) : "בחרו תאריך"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={eventDate}
                      onSelect={setEventDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">שם *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="שם מלא"
                  required
                />
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventPhone">טלפון זמין ביום האירוע *</Label>
                  <Input
                    id="eventPhone"
                    value={eventPhone}
                    onChange={(e) => setEventPhone(e.target.value)}
                    placeholder="05X-XXXXXXX"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mechutanPhone">טלפון מחותנת</Label>
                  <Input
                    id="mechutanPhone"
                    value={mechutanPhone}
                    onChange={(e) => setMechutanPhone(e.target.value)}
                    placeholder="05X-XXXXXXX"
                  />
                </div>
              </div>

              {/* Day of Week */}
              <div className="space-y-2">
                <Label>יום בשבוע *</Label>
                <RadioGroup value={dayOfWeek} onValueChange={setDayOfWeek} className="grid grid-cols-4 gap-4">
                  {daysOfWeek.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value={day.value} id={day.value} />
                      <Label htmlFor={day.value}>{day.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">כתובת למשלוח</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">עיר *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="שם העיר"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">רחוב *</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="שם הרחוב"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="building">בניין *</Label>
                    <Input
                      id="building"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder="מספר בניין"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entrance">כניסה (אופציונלי)</Label>
                    <Input
                      id="entrance"
                      value={entrance}
                      onChange={(e) => setEntrance(e.target.value)}
                      placeholder="מספר כניסה"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">קומה (אופציונלי)</Label>
                    <Input
                      id="floor"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="מספר קומה"
                    />
                  </div>
                </div>
              </div>

              {/* Dress Color */}
              <div className="space-y-2">
                <Label htmlFor="dressColor">גוון שמלת כלה (אופציונלי)</Label>
                <Input
                  id="dressColor"
                  value={dressColor}
                  onChange={(e) => setDressColor(e.target.value)}
                  placeholder="תיאור גוון השמלה"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>אמצעי תשלום *</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div key={method.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value={method.value} id={method.value} />
                      <Label htmlFor={method.value}>{method.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">הערות (אופציונלי)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הערות נוספות להזמנה"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 text-lg"
              >
                {isSubmitting ? 'שולח הזמנה...' : 'שלח הזמנה'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
