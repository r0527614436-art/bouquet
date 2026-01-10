import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl p-0 overflow-hidden border-[3px] border-[#314020] rounded-2xl md:max-h-[95vh] md:overflow-visible max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F5F0E8' }}>
        <VisuallyHidden>
          <DialogTitle>הזמנת פריט: {item.title}</DialogTitle>
          <DialogDescription>מלא את הפרטים להשלמת ההזמנה</DialogDescription>
        </VisuallyHidden>
        
        <form onSubmit={handleSubmit} className="relative p-6 md:p-8 flex flex-col">
          {/* Category Title */}
          {category && (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-synopsis font-bold text-center text-[#314020] mb-6 md:mb-8">
              {category.name}
            </h2>
          )}
          
          {/* Form and Image Layout */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Image Section - Left side on desktop */}
            <div className="md:w-[35%] flex flex-col items-center order-first md:order-none self-stretch">
              <p className="font-synopsis text-xl md:text-2xl text-[#314020] mb-3 font-bold">דגם {item.price || item.title}</p>
              <div className="w-full rounded-2xl overflow-hidden bg-[#6B8E4E] max-h-[200px] md:max-h-none md:flex-1">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Form Section - Left side on desktop */}
            <div className="md:w-[65%] flex flex-col gap-3 md:gap-4">
              {/* Row 1: Names */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="שם פרטי"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                    required
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="שם משפחה"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Phones */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="border-b border-[#314020]">
                  <Input
                    type="tel"
                    placeholder="פלאפון זמין ביום האירוע:"
                    value={phoneEvent}
                    onChange={(e) => setPhoneEvent(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                    required
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="tel"
                    placeholder="פלאפון מחותנת:"
                    value={phoneMechuteNet}
                    onChange={(e) => setPhoneMechuteNet(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                  />
                </div>
              </div>

              {/* Row 3: Event Date and Day */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="border-b border-[#314020]">
                  <Input
                    type="date"
                    placeholder="תאריך האירוע:"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                    required
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="יום בשבוע:"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                  />
                </div>
              </div>

              {/* Address Section Title */}
              <p className="text-right font-synopsis text-[#314020] font-bold text-base mt-2">כתובת למשלוח:</p>

              {/* Row 4: City and Street */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="עיר:"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="רחוב:"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                  />
                </div>
              </div>

              {/* Row 5: Building, Entrance, Floor */}
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="בנין:"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="כניסה (אופציונלי):"
                    value={entrance}
                    onChange={(e) => setEntrance(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="קומה:"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
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
                  className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 h-10 text-base font-ploni-aaa placeholder:text-[#314020]/70"
                />
              </div>

              {/* Payment Method */}
              <div className="pt-2">
                <p className="text-right font-synopsis text-[#314020] mb-3 text-base">אמצעי תשלום:</p>
                <div className="flex gap-3 justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`px-5 md:px-8 py-2 rounded-full border-2 font-synopsis transition-all text-base ${
                      paymentMethod === 'transfer' 
                        ? 'bg-[#314020] text-white border-[#314020]' 
                        : 'bg-transparent text-[#314020] border-[#314020] hover:bg-[#314020]/10'
                    }`}
                  >
                    העברה
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit')}
                    className={`px-5 md:px-8 py-2 rounded-full border-2 font-synopsis transition-all text-base ${
                      paymentMethod === 'credit' 
                        ? 'bg-[#314020] text-white border-[#314020]' 
                        : 'bg-transparent text-[#314020] border-[#314020] hover:bg-[#314020]/10'
                    }`}
                  >
                    אשראי
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bit')}
                    className={`px-5 md:px-8 py-2 rounded-full border-2 font-synopsis transition-all text-base ${
                      paymentMethod === 'bit' 
                        ? 'bg-[#314020] text-white border-[#314020]' 
                        : 'bg-transparent text-[#314020] border-[#314020] hover:bg-[#314020]/10'
                    }`}
                  >
                    ביט
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`px-5 md:px-8 py-2 rounded-full border-2 font-synopsis transition-all text-base ${
                      paymentMethod === 'cash' 
                        ? 'bg-[#314020] text-white border-[#314020]' 
                        : 'bg-transparent text-[#314020] border-[#314020] hover:bg-[#314020]/10'
                    }`}
                  >
                    מזומן
                  </button>
                </div>

                {/* Payment Method Info */}
                {paymentMethod === 'cash' && (
                  <p className="mt-3 font-synopsis text-[#314020] text-sm text-right">ניצור איתכם קשר בהמשך לצורך התשלום</p>
                )}
                {paymentMethod === 'bit' && (
                  <p className="mt-3 font-synopsis text-[#314020] text-sm text-right">לתשלום בביט: 052-7669989</p>
                )}
                {paymentMethod === 'credit' && (
                  <p className="mt-3 font-synopsis text-[#314020] text-sm text-right">ניצור איתכם קשר בהמשך לצורך התשלום</p>
                )}
                {paymentMethod === 'transfer' && (
                  <p className="mt-3 font-synopsis text-[#314020] text-sm text-right">בנק מזרחי טפחות (20) סניף 722  חשבון 102979 ע"ש רחל רובינשטיין</p>
                )}

                {/* Submit Button - Below payment buttons */}
                <div className="pt-4 md:pt-6 flex flex-col items-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#314020] hover:bg-[#314020]/90 text-white rounded-full px-8 md:px-12 py-2.5 md:py-3 flex items-center justify-center gap-3 font-synopsis font-bold disabled:opacity-50 text-lg md:text-xl"
                  >
                    <span>{isSubmitting ? 'שולח...' : 'שליחת הזמנה'}</span>
                    <img src={orderArrow} alt="" className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                  <p className="text-center text-xs md:text-sm text-gray-600 mt-3" dir="rtl">
                    בשליחת הטופס את/ה מסכימ/ה ל<a href="/privacy-policy" className="text-[#314020] hover:underline">מדיניות הפרטיות</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};