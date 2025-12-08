import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  
  // Form state
  const [eventDate, setEventDate] = useState<Date>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: name,
        phone: phone,
        event_date: eventDate.toISOString(),
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
        title: "ההזמנה נשלחה בהצלחה",
        description: "ניצור איתכם קשר בהקדם",
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="text-center">
          <h2 className="text-2xl font-synopsis font-light text-[#314020] mb-4">אין פריטים בעגלה</h2>
          <Link to="/catalog">
            <Button className="bg-[#314020] hover:bg-[#314020]/90 text-white rounded-full px-8">
              חזרה לקטלוג
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8FBF4' }}>
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow-md">
          <CheckCircle className="h-16 w-16 text-[#314020] mx-auto mb-4" />
          <h2 className="text-2xl font-synopsis font-light text-[#314020] mb-4">ההזמנה נשלחה בהצלחה!</h2>
          <p className="text-gray-600 mb-6 font-ploni-aaa">
            הזמנתך התקבלה! ניצור איתכם קשר בהקדם
          </p>
          <div className="space-y-3">
            <Link to="/catalog" className="block">
              <Button className="w-full bg-[#314020] hover:bg-[#314020]/90 text-white rounded-full">
                המשיכו לקנות
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button variant="outline" className="w-full border-[#314020] text-[#314020] hover:bg-[#314020] hover:text-white rounded-full">
                חזרה לעמוד הבית
              </Button>
            </Link>
          </div>
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
              <ArrowRight className="h-5 w-5 ml-2" />
              חזרה לעגלה
            </Link>
            
            <div className="flex items-center">
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
          <h1 className="text-3xl font-synopsis font-light text-[#314020] mb-2">פרטי הזמנה</h1>
          <p className="text-gray-600 font-ploni-aaa">אנא מלאו את הפרטים להשלמת ההזמנה</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-synopsis font-light text-[#314020] mb-4">סיכום הזמנה</h2>
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
          <h2 className="text-xl font-synopsis font-light text-[#314020] mb-4">פרטי המזמין</h2>
          
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#314020] hover:bg-[#314020]/90 text-white font-synopsis font-light text-lg py-6 rounded-full transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'שולח...' : 'שליחת הזמנה'}
          </Button>
          
          <p className="text-center text-sm text-gray-500 font-ploni-aaa">
            בשליחת הטופס את/ה מסכימ/ה ל<Link to="/privacy-policy" className="text-[#314020] hover:underline">מדיניות הפרטיות</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Order;
