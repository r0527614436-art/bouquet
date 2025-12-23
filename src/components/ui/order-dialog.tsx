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
  const [paymentMethod, setPaymentMethod] = useState<'bit' | 'credit' | 'transfer' | ''>('');
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
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-[3px] border-[#314020] rounded-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F5F0E8' }}>
        <VisuallyHidden>
          <DialogTitle>הזמנת פריט: {item.title}</DialogTitle>
          <DialogDescription>מלא את הפרטים להשלמת ההזמנה</DialogDescription>
        </VisuallyHidden>
        
        <div className="relative p-6 md:p-8">
          {/* Category Title */}
          {category && (
            <h2 className="text-4xl md:text-5xl font-synopsis font-bold text-center text-[#314020] mb-6">
              {category.name}
            </h2>
          )}
          
          {/* Form and Image Layout */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-4">
              {/* Row 1: Names */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="שם פרטי"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="שם משפחה"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Phones */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="tel"
                    placeholder="פלאפון זמין ביום האירוע:"
                    value={phoneEvent}
                    onChange={(e) => setPhoneEvent(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="tel"
                    placeholder="פלאפון מחותנת:"
                    value={phoneMechuteNet}
                    onChange={(e) => setPhoneMechuteNet(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Row 3: Event Date and Day */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="date"
                    placeholder="תאריך האירוע:"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="יום בשבוע:"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Row 4: Address and City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="כתובת למשלוח:"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="עיר:"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Row 5: Street and Building */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="רחוב:"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="בנין :"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Row 6: Entrance and Floor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="כניסה:"
                    value={entrance}
                    onChange={(e) => setEntrance(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
                <div className="border-b border-[#314020]">
                  <Input
                    type="text"
                    placeholder="קומה:"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Row 7: Dress Color */}
              <div className="border-b border-[#314020]">
                <Input
                  type="text"
                  placeholder="גוון שמלה:"
                  value={dressColor}
                  onChange={(e) => setDressColor(e.target.value)}
                  className="text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-500"
                />
              </div>

              {/* Payment Method */}
              <div className="pt-4">
                <p className="text-right font-synopsis text-[#314020] mb-3">אמצעי תשלום:</p>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bit')}
                    className={`px-6 py-2 rounded-full border-2 font-synopsis transition-all ${
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
                    className={`px-6 py-2 rounded-full border-2 font-synopsis transition-all ${
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
                    className={`px-6 py-2 rounded-full border-2 font-synopsis transition-all ${
                      paymentMethod === 'transfer' 
                        ? 'bg-[#314020] text-white border-[#314020]' 
                        : 'bg-transparent text-[#314020] border-[#314020] hover:bg-[#314020]/10'
                    }`}
                  >
                    העברה
                  </button>
                </div>

                {/* Payment Method Info */}
                {paymentMethod === 'bit' && (
                  <div className="mt-4 p-4 bg-white/50 rounded-lg text-right">
                    <p className="font-synopsis text-[#314020]">לתשלום בביט: 052-7614436</p>
                  </div>
                )}
                {paymentMethod === 'credit' && (
                  <div className="mt-4 p-4 bg-white/50 rounded-lg text-right">
                    <p className="font-synopsis text-[#314020]">לתשלום באשראי יש ליצור קשר בטלפון 052-7614436</p>
                  </div>
                )}
                {paymentMethod === 'transfer' && (
                  <div className="mt-4 p-4 bg-white/50 rounded-lg text-right">
                    <p className="font-synopsis text-[#314020]">לתשלום בהעברה בנקאית: בנק הפועלים, סניף 123, חשבון 456789</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#314020] hover:bg-[#314020]/90 text-white rounded-full px-8 py-3 flex items-center justify-center gap-3 font-synopsis font-light mx-auto disabled:opacity-50"
                >
                  <span className="text-xl">{isSubmitting ? 'שולח...' : 'שליחת הזמנה'}</span>
                  <img src={orderArrow} alt="" className="h-6 w-6" />
                </Button>
                <p className="text-center text-sm text-gray-600 mt-4" dir="rtl">
                  בשליחת הטופס את/ה מסכימ/ה ל<a href="/privacy-policy" className="text-[#314020] hover:underline">מדיניות הפרטיות</a>
                </p>
              </div>
            </form>

            {/* Image Section */}
            <div className="md:w-1/3 flex flex-col items-center">
              <p className="font-synopsis text-xl text-[#314020] mb-2">דגם {item.price || item.title}</p>
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#6B8E4E]">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};