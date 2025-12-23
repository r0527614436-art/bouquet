import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import orderArrow from '@/assets/order-arrow.png';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CatalogItem {
  id: string;
  title: string;
  image_url: string;
  price: string | null;
  category_id: string;
  created_at: string;
}

interface OrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem | null;
}

export const OrderDialog: React.FC<OrderDialogProps> = ({ isOpen, onClose, item }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneEvent, setPhoneEvent] = useState('');
  const [phoneMechuteNet, setPhoneMechuteNet] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [dressColor, setDressColor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bit' | 'credit' | 'transfer' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch category name
  const { data: category } = useQuery({
    queryKey: ['category', item?.category_id],
    queryFn: async () => {
      if (!item?.category_id) return null;
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('id', item.category_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!item?.category_id
  });

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !phoneEvent || !eventDate || !paymentMethod) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: `${firstName} ${lastName}`,
        phone: phoneEvent,
        phone_mechutenet: phoneMechuteNet,
        event_date: new Date(eventDate).toISOString(),
        day_of_week: dayOfWeek,
        address: `${address}, ${city}, ${street}, בניין ${building}, כניסה ${entrance}, קומה ${floor}`,
        dress_color: dressColor,
        payment_method: paymentMethod,
        items: JSON.stringify([{
          id: item.id,
          title: item.title,
          image_url: item.image_url,
          quantity: 1
        }]),
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.functions.invoke('send-order', {
        body: orderData
      });

      if (error) throw error;

      // Reset form and close
      setFirstName('');
      setLastName('');
      setPhoneEvent('');
      setPhoneMechuteNet('');
      setEventDate('');
      setDayOfWeek('');
      setAddress('');
      setCity('');
      setStreet('');
      setBuilding('');
      setEntrance('');
      setFloor('');
      setDressColor('');
      setPaymentMethod('');
      onClose();
      
      toast({
        title: "ההזמנה נשלחה בהצלחה",
        description: "ניצור איתכם קשר בהקדם"
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl p-0 overflow-hidden border-[3px] border-[#314020] rounded-2xl md:max-h-[95vh] md:overflow-visible max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F5F0E8' }}>
        <VisuallyHidden>
          <DialogTitle>הזמנת פריט: {item.title}</DialogTitle>
          <DialogDescription>מלא את הפרטים להשלמת ההזמנה</DialogDescription>
        </VisuallyHidden>
        
        <div className="relative p-4 md:p-6 flex flex-col h-full">
          {/* Category Title */}
          {category && (
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-synopsis font-bold text-center text-[#314020] mb-4 md:mb-6">
              {category.name}
            </h2>
          )}
          
          {/* Form and Image Layout - Image on right for desktop */}
          <div className="flex flex-col md:flex-row-reverse gap-4 md:gap-6 flex-1">
            {/* Image Section - Right side on desktop */}
            <div className="md:w-2/5 flex flex-col items-center order-first md:order-none">
              <p className="font-synopsis text-lg md:text-2xl lg:text-3xl text-[#314020] mb-2 font-bold">דגם {item.price || item.title}</p>
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#6B8E4E] max-h-[200px] md:max-h-none">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Form Section - Left side on desktop */}
            <form onSubmit={handleSubmit} className="md:w-3/5 flex flex-col gap-2 md:gap-3">
              {/* Row 1: Names */}
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="שם פרטי"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="שם משפחה"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Phones */}
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="tel"
                    placeholder="פלאפון זמין ביום האירוע:"
                    value={phoneEvent}
                    onChange={(e) => setPhoneEvent(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="tel"
                    placeholder="פלאפון מחותנת:"
                    value={phoneMechuteNet}
                    onChange={(e) => setPhoneMechuteNet(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Row 3: Event Date and Day */}
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="date"
                    placeholder="תאריך האירוע:"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="יום בשבוע:"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Row 4: City and Street */}
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="עיר:"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="רחוב:"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Row 5: Building, Entrance, Floor */}
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="בנין:"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="כניסה:"
                    value={entrance}
                    onChange={(e) => setEntrance(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="קומה:"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Row 6: Dress Color */}
              <div className="border-b border-[#314020]">
                <Input
                  type="text"
                  placeholder="גוון שמלה:"
                  value={dressColor}
                  onChange={(e) => setDressColor(e.target.value)}
                  className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-1 md:py-2 text-sm md:text-base font-synopsis placeholder:text-gray-500"
                />
              </div>

              {/* Payment Method */}
              <div className="pt-2 md:pt-3">
                <p className="text-right font-synopsis text-[#314020] mb-2 text-sm md:text-base">אמצעי תשלום:</p>
                <div className="flex gap-2 md:gap-3 justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full border-2 font-synopsis transition-all text-sm md:text-base ${
                      paymentMethod === 'cash' 
                        ? 'bg-[#314020] text-white border-[#314020]' 
                        : 'bg-transparent text-[#314020] border-[#314020] hover:bg-[#314020]/10'
                    }`}
                  >
                    מזומן
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bit')}
                    className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full border-2 font-synopsis transition-all text-sm md:text-base ${
                      paymentMethod === 'bit' 
                        ? 'bg-[#314020] text-white border-[#314020]' 
                        : 'bg-transparent text-[#314020] border-[#314020] hover:bg-[#314020]/10'
                    }`}
                  >
                    ביט
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit')}
                    className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full border-2 font-synopsis transition-all text-sm md:text-base ${
                      paymentMethod === 'credit' 
                        ? 'bg-[#314020] text-white border-[#314020]' 
                        : 'bg-transparent text-[#314020] border-[#314020] hover:bg-[#314020]/10'
                    }`}
                  >
                    אשראי
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full border-2 font-synopsis transition-all text-sm md:text-base ${
                      paymentMethod === 'transfer' 
                        ? 'bg-[#314020] text-white border-[#314020]' 
                        : 'bg-transparent text-[#314020] border-[#314020] hover:bg-[#314020]/10'
                    }`}
                  >
                    העברה
                  </button>
                </div>

                {/* Payment Method Info */}
                {paymentMethod === 'cash' && (
                  <div className="mt-2 md:mt-3 p-2 md:p-3 bg-white/50 rounded-lg text-right">
                    <p className="font-synopsis text-[#314020] text-sm md:text-base">ניצור איתכם קשר בהמשך לצורך התשלום</p>
                  </div>
                )}
                {paymentMethod === 'bit' && (
                  <div className="mt-2 md:mt-3 p-2 md:p-3 bg-white/50 rounded-lg text-right">
                    <p className="font-synopsis text-[#314020] text-sm md:text-base">לתשלום בביט: 052-7669989</p>
                  </div>
                )}
                {paymentMethod === 'credit' && (
                  <div className="mt-2 md:mt-3 p-2 md:p-3 bg-white/50 rounded-lg text-right">
                    <p className="font-synopsis text-[#314020] text-sm md:text-base">ניצור איתכם קשר בהמשך לצורך התשלום</p>
                  </div>
                )}
                {paymentMethod === 'transfer' && (
                  <div className="mt-2 md:mt-3 p-2 md:p-3 bg-white/50 rounded-lg text-right">
                    <p className="font-synopsis text-[#314020] text-sm md:text-base">לתשלום בהעברה בנקאית: בנק מזרחי טפחות, סניף 722, חשבון 102979 ע"ש רובינשטיין רחל</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 md:pt-3 mt-auto">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#314020] hover:bg-[#314020]/90 text-white rounded-full px-6 md:px-8 py-2 md:py-3 flex items-center justify-center gap-2 md:gap-3 font-synopsis font-light mx-auto disabled:opacity-50"
                >
                  <span className="text-base md:text-xl">{isSubmitting ? 'שולח...' : 'שליחת הזמנה'}</span>
                  <img src={orderArrow} alt="" className="h-4 w-4 md:h-6 md:w-6" />
                </Button>
                <p className="text-center text-xs md:text-sm text-gray-600 mt-2 md:mt-3" dir="rtl">
                  בשליחת הטופס את/ה מסכימ/ה ל<a href="/privacy-policy" className="text-[#314020] hover:underline">מדיניות הפרטיות</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};