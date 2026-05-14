
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import simpleArrow from '@/assets/simple-arrow.webp';
import SEO from '@/components/SEO';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleProceedToOrder = () => {
    if (items.length > 0) {
      navigate('/order');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <SEO
          title="עגלת הקניות | בוקט - שזירת פרחים"
          description="העגלה שלך בבוקט שזירת פרחים. הוסיפי פריטים מהקטלוג והמשיכי להזמנה."
          path="/cart"
        />
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-pink-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link to="/catalog" className="flex items-center text-pink-600 hover:text-pink-800">
                <img src={simpleArrow} alt="" className="h-5 w-5 ml-2" />
                חזרה לקטלוג
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-700 mb-4">העגלה ריקה</h1>
            <p className="text-gray-500 mb-8">אין פריטים בסל המוצרים שלכם</p>
            <Link to="/catalog">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3">
                התחילו להזמנה
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <SEO
        title="עגלת הקניות | בוקט - שזירת פרחים"
        description="עגלת הקניות שלך בבוקט שזירת פרחים. עברי על הפריטים שבחרת והמשיכי להזמנה."
        path="/cart"
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/catalog" className="flex items-center text-pink-600 hover:text-pink-800">
              <img src={simpleArrow} alt="" className="h-5 w-5 ml-2" />
              חזרה לקטלוג
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pink-800 mb-2">סל המוצרים</h1>
          <p className="text-gray-600">{getTotalItems()} פריטים בעגלה</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {items.map((item, index) => (
            <div key={item.id} className={`p-6 flex items-center space-x-4 rtl:space-x-reverse ${index < items.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                {item.price && (
                  <p className="text-pink-600 font-bold">₪{item.price}</p>
                )}
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-8 w-8"
                  aria-label={`הפחת כמות עבור ${item.title}`}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-8 w-8"
                  aria-label={`הוסף כמות עבור ${item.title}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => removeFromCart(item.id)}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label={`הסר את ${item.title} מהעגלה`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={clearCart}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            רוקן עגלה
          </Button>

          <Button
            onClick={handleProceedToOrder}
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg"
          >
            המשיכו להזמנה
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
