import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import arrowCircle from '@/assets/arrow-circle.png';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !date) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive"
      });
      return;
    }

    const message = `שלום, אני מעוניין/ת להזמין:\nדגם: ${item.title}\nשם: ${name}\nטלפון: ${phone}\nתאריך: ${date}${item.price ? `\nמחיר: ₪${item.price}` : ''}`;
    window.open(`https://wa.me/972527614436?text=${encodeURIComponent(message)}`, '_blank');
    
    // Reset form and close
    setName('');
    setPhone('');
    setDate('');
    onClose();
    
    toast({
      title: "ההזמנה נשלחה",
      description: "פותח WhatsApp..."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-primary/20 bg-transparent">
        <VisuallyHidden>
          <DialogTitle>הזמנת פריט: {item.title}</DialogTitle>
          <DialogDescription>מלא את הפרטים להשלמת ההזמנה</DialogDescription>
        </VisuallyHidden>
        
        {/* Background Image with Light Overlay */}
        <div className="relative min-h-[500px] flex items-center justify-center rounded-lg overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${item.image_url})` }}
          >
            <div className="absolute inset-0 bg-white/50"></div>
          </div>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-full p-2"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Form Content */}
          <div className="relative z-10 w-full max-w-md mx-8 text-center">
            <h2 className="text-3xl md:text-4xl font-ploni-aaa font-black mb-1 text-[#314020]">
              {item.title}
            </h2>
            {item.price && (
              <p className="text-lg font-ploni-aaa font-light mb-8 text-gray-700">דגם {item.price}</p>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="text-center">
                <label className="block text-sm font-ploni-aaa font-medium text-gray-700 mb-2">
                  שם מלא
                </label>
                <div className="border-b-2 border-gray-400">
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-center border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-ploni-aaa placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>
              
              {/* Phone Field */}
              <div className="text-center">
                <label className="block text-sm font-ploni-aaa font-medium text-gray-700 mb-2">
                  טלפון
                </label>
                <div className="border-b-2 border-gray-400">
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-center border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-ploni-aaa placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>
              
              {/* Date Field */}
              <div className="text-center">
                <label className="block text-sm font-ploni-aaa font-medium text-gray-700 mb-2">
                  תאריך האירוע
                </label>
                <div className="border-b-2 border-gray-400">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-center border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-base font-ploni-aaa placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="bg-[#314020] hover:bg-[#314020]/90 text-white rounded-full px-8 py-3 text-base flex items-center justify-center gap-2 font-ploni-aaa font-medium mx-auto"
                >
                  <img src={arrowCircle} alt="" className="h-5 w-5 rotate-180 brightness-0 invert" />
                  <span>שליחת הזמנה</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
