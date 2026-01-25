import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import simpleArrow from '@/assets/simple-arrow.png';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [eventDate, setEventDate] = useState<Date>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !eventDate) {
      toast({
        title: "שגיאה",
        description: "אנא מלאו את כל השדות",
        variant: "destructive"
      });
      return;
    }

    if (!privacyAccepted) {
      toast({
        title: "שגיאה",
        description: "יש לאשר את מדיניות הפרטיות",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: name,
        phone: phone,
        email: email || null,
        event_date: eventDate.toISOString(),
        items: JSON.stringify(items),
        created_at: new Date().toISOString()
      };

      // Send order via Supabase edge function
      const { error } = await supabase.functions.invoke('send-order', {
        body: orderData
      });

      if (error) throw error;

      clearCart();
      navigate('/order-confirmation');

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="text-center">
          <h2 className="text-2xl font-ploni-aaa font-bold text-[#314020] mb-4">אין פריטים בעגלה</h2>
          <Link to="/catalog">
            <Button className="bg-[#314020] hover:bg-[#314020]/90 text-white rounded-full px-8">
              חזרה לקטלוג
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FBF4' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/cart" className="flex items-center text-[#314020] hover:text-[#314020]/70">
              <img src={simpleArrow} alt="" className="h-5 w-5 ml-2" />
              חזרה לעגלה
            </Link>
            
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
              <div className="bg-white/80 backdrop-blur-sm rounded-t-[3rem] p-3 mx-px my-0 px-px py-[3px] shadow-lg">
                <img 
                  src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                  alt="בוקט לוגו" 
                  width="476" 
                  height="726"
                  loading="lazy"
                  decoding="async"
                  className="h-32 w-auto contrast-125 brightness-110"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-ploni-aaa font-bold text-[#314020] mb-2">פרטי הזמנה</h1>
          <p className="text-gray-600 font-ploni-aaa font-light">אנא מלאו את הפרטים להשלמת ההזמנה</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-ploni-aaa font-bold text-[#314020] mb-4">סיכום הזמנה</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <span className="text-gray-800 font-ploni-aaa">דגם {item.title}</span>
                    <span className="text-gray-500 text-sm block">כמות: {item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmitOrder} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          <h2 className="text-xl font-ploni-aaa font-bold text-[#314020] mb-4">פרטי המזמין</h2>
          
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-ploni-aaa text-[#314020]">שם מלא *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם מלא"
              className="border-[#314020]/30 focus:border-[#314020] rounded-lg font-ploni-aaa"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-ploni-aaa text-[#314020]">טלפון *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="050-0000000"
              className="border-[#314020]/30 focus:border-[#314020] rounded-lg font-ploni-aaa"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-ploni-aaa text-[#314020]">אימייל (לקבלת אישור הזמנה)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="border-[#314020]/30 focus:border-[#314020] rounded-lg font-ploni-aaa"
              dir="ltr"
            />
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label className="font-ploni-aaa text-[#314020]">תאריך האירוע *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-ploni-aaa border-[#314020]/30 rounded-lg",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="ml-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP", { locale: he }) : "בחרו תאריך"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
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

          <div className="flex items-start gap-3 mt-4">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                id="privacy-checkbox-order"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="peer sr-only"
              />
              <label
                htmlFor="privacy-checkbox-order"
                className="flex h-4 w-4 cursor-pointer items-center justify-center rounded border-2 border-[#314020] bg-transparent transition-all duration-200 peer-checked:border-[#314020]"
              >
                <svg
                  className="h-7 w-7 text-[#314020] transition-transform duration-200 -mt-1 ml-0.5"
                  style={{ transform: privacyAccepted ? 'scale(1)' : 'scale(0)' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </label>
            </div>
            <label htmlFor="privacy-checkbox-order" className="text-sm text-gray-600 font-ploni-aaa cursor-pointer text-right">
              קראתי ואני מסכימ/ה ל<Link to="/privacy-policy" className="text-[#314020] hover:underline">מדיניות הפרטיות</Link>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !privacyAccepted}
            className="w-full bg-[#314020] hover:bg-[#314020]/90 text-white font-ploni-aaa font-bold text-lg py-6 rounded-full transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'שולח...' : 'שליחת הזמנה'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Order;
