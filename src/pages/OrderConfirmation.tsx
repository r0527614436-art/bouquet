import React from 'react';
import { Link } from 'react-router-dom';
import bouquetLogo3D from '@/assets/bouquet-logo-3d.webp';
const OrderConfirmation = () => {
  return <div className="min-h-screen w-full relative flex items-center justify-center" dir="rtl">
      {/* Background Image with Blur Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: 'url(/lovable-uploads/order-confirmation-bg.webp)'
    }} />
      
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Logo in Gray Arch Background - Clickable */}
        <Link to="/" className="mb-10 transition-transform hover:scale-105">
          <div style={{
          backgroundColor: '#EAEAEA'
        }} className="w-[105px] h-[170px] md:w-[130px] md:h-[200px] flex items-center justify-center rounded-t-full pt-2 pb-1 bg-secondary py-[56px]">
            <img src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" alt="בוקט - לוגו" className="w-[90px] md:w-[120px] h-auto object-contain" />
          </div>
        </Link>
        
        {/* Main Text */}
        <div className="space-y-6 md:space-y-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-synopsis font-semibold text-[#314020]">
            ההזמנה נקלטה בהצלחה
          </h1>
          <p className="text-3xl md:text-5xl lg:text-6xl font-synopsis font-bold text-[#314020]">
            שמחים שבחרתם בנו!
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-synopsis font-semibold mt-8 text-[#314020]">
            צוות בוקט
          </p>
        </div>
      </div>
    </div>;
};
export default OrderConfirmation;