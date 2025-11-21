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
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-primary/20">
        <VisuallyHidden>
          <DialogTitle>הזמנת פריט: {item.title}</DialogTitle>
          <DialogDescription>מלא את הפרטים להשלמת ההזמנה</DialogDescription>
        </VisuallyHidden>
        
        {/* Background Image with Overlay */}
        <div className="relative min-h-[600px] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${item.image_url})` }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          </div>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 left-4 z-50 text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-3 shadow-lg"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Form Content */}
          <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-8 m-8 w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-ploni-aaa font-black text-center mb-2 text-[#3d5a3d]">
              דגם {item.title}
            </h2>
            {item.price && (
              <p className="text-xl font-ploni-aaa font-bold text-center mb-6 text-gray-700">₪{item.price}</p>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="שם מלא"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-right border-2 border-[#3d5a3d]/30 focus:border-[#3d5a3d] rounded-lg py-6"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="tel"
                  placeholder="טלפון"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-right border-2 border-[#3d5a3d]/30 focus:border-[#3d5a3d] rounded-lg py-6"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="date"
                  placeholder="תאריך"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-right border-2 border-[#3d5a3d]/30 focus:border-[#3d5a3d] rounded-lg py-6"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-[#3d5a3d] hover:bg-[#2d4a2d] text-white rounded-full py-6 text-lg flex items-center justify-center gap-2 shadow-lg font-ploni-aaa font-medium"
              >
                <span>שלח הזמנה</span>
                <img src={arrowCircle} alt="" className="h-5 w-5 rotate-180" />
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
