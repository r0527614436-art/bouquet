
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
  
  // Form state
  const [eventDate, setEventDate] = useState<Date>();
  const [name, setName] = useState('');
  const [eventPhone, setEventPhone] = useState('');
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
    { value: 'ashkaei', label: 'אשקואי' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
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
            תודה על ההזמנה. ניצור איתכם קשר בקרוב לגבי פרטי התשלום והמשלוח.
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
              <img 
                src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                alt="בוקט לוגו" 
                className="h-24 w-auto"
              />
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

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
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
    </div>
  );
};

export default Order;
