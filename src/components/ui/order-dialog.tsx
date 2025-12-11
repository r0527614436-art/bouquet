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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
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
    
    if (!name || !phone || !date) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: name,
        phone: phone,
        event_date: new Date(date).toISOString(),
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
      setName('');
      setPhone('');
      setDate('');
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
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-2 border-[#314020] bg-transparent rounded-lg">
        <VisuallyHidden>
          <DialogTitle>הזמנת פריט: {item.title}</DialogTitle>
          <DialogDescription>מלא את הפרטים להשלמת ההזמנה</DialogDescription>
        </VisuallyHidden>
        
        {/* Background Image with Light Overlay */}
        <div className="relative min-h-[500px] flex flex-col rounded-lg overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${item.image_url})` }}
          >
            <div className="absolute inset-0 bg-white/60"></div>
          </div>

          {/* Form Content - Flex column to push fields down */}
          <div className="relative z-10 w-full flex flex-col h-full min-h-[500px]">
            {/* Top section with titles */}
            <div className="text-center pt-16 px-8">
              {/* Category Name - Larger and positioned lower */}
              {category && (
                <p className="text-4xl md:text-5xl font-synopsis font-light mb-4 text-[#314020]">
                  {category.name}
                </p>
              )}
              
              {/* Model Number with "דגם" - More emphasized */}
              <h2 className="text-xl md:text-2xl font-synopsis font-medium text-[#314020]">
                דגם {item.price || item.title}
              </h2>
            </div>
            
            {/* Spacer to push form down */}
            <div className="flex-grow"></div>
            
            {/* Form at bottom */}
            <form onSubmit={handleSubmit} className="px-8 pb-8">
              {/* Three Fields in a Row - positioned just above button */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Name Field */}
                <div className="text-center">
                  <label className="block text-sm font-synopsis font-light text-gray-700 mb-2">
                    שם מלא
                  </label>
                  <div className="border-b border-[#314020]">
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-center border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
                
                {/* Phone Field */}
                <div className="text-center">
                  <label className="block text-sm font-synopsis font-light text-gray-700 mb-2">
                    טלפון
                  </label>
                  <div className="border-b border-[#314020]">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-center border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
                
                {/* Date Field */}
                <div className="text-center">
                  <label className="block text-sm font-synopsis font-light text-gray-700 mb-2">
                    תאריך האירוע
                  </label>
                  <div className="border-b border-[#314020]">
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="text-center border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-synopsis placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#314020] hover:bg-[#314020]/90 text-white rounded-full px-20 py-3 flex items-center justify-center gap-3 font-synopsis font-light mx-auto min-w-[300px] disabled:opacity-50"
                >
                  <span className="text-lg">{isSubmitting ? 'שולח...' : 'שליחת הזמנה'}</span>
                  <img src={orderArrow} alt="" className="h-6 w-6" />
                </Button>
                <p className="text-center text-sm text-gray-600 mt-4" dir="rtl">
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