import React from 'react';
import { Link } from 'react-router-dom';
import bouquetLogo3D from '@/assets/bouquet-logo-3d.png';

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center" dir="rtl">
      {/* Background Image with Blur Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/lovable-uploads/order-confirmation-bg.jpg)',
        }}
      />
      
      {/* Blur/Fog Overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Logo in Gray Arch Background - Clickable */}
        <Link 
          to="/"
          className="mb-10 transition-transform hover:scale-105"
        >
          <div 
            className="w-[70px] h-[85px] md:w-[85px] md:h-[100px] flex items-center justify-center rounded-t-full pt-2 pb-1"
            style={{ backgroundColor: '#EAEAEA' }}
          >
            <img 
              src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
              alt="בוקט - לוגו" 
              className="w-[60px] md:w-[80px] h-auto object-contain"
            />
          </div>
        </Link>
        
        {/* Main Text */}
        <div className="space-y-3">
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-['Ploni_DemiBold_AAA']"
            style={{ color: '#314020' }}
          >
            ההזמנה נקלטה בהצלחה
          </h1>
          <p 
            className="text-3xl md:text-5xl lg:text-6xl font-['Ploni_Bold_AAA']"
            style={{ color: '#314020' }}
          >
            שמחים שבחרתם בנו!
          </p>
          <p 
            className="text-xl md:text-2xl lg:text-3xl font-['Ploni_Regular_AAA'] mt-6"
            style={{ color: '#314020' }}
          >
            צוות בוקט
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
