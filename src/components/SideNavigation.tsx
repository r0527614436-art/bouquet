import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SideNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div 
      className={`fixed right-0 top-0 h-screen bg-primary transition-all duration-300 ease-in-out z-50 ${
        isMenuOpen ? 'w-80' : 'w-20'
      }`}
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <div className="flex flex-col h-full py-8 bg-[#11150d]">
        {/* Hamburger Icon */}
        <div className={`flex justify-center mb-12 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="flex flex-col gap-1.5 cursor-pointer">
            <div className="w-8 h-0.5 bg-white"></div>
            <div className="w-8 h-0.5 bg-white"></div>
            <div className="w-8 h-0.5 bg-white"></div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col justify-start gap-12 px-4 bg-[#11150d]">
          {[
            { num: '01', label: 'בית', href: '/' },
            { num: '02', label: 'אודות', href: '/about' },
            { num: '03', label: 'קטלוג', href: '/catalog' },
            { num: '04', label: 'צור קשר', href: '/contact' }
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-4">
              {/* Collapsed State - Number and Dot */}
              <div className={`flex flex-col items-center gap-2 transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-0 absolute' : 'opacity-100'
              }`}>
                <span className="font-ploni-aaa font-medium text-white text-base whitespace-nowrap">
                  {item.num}
                </span>
                <div className="w-2 h-2 rounded-full bg-[#89a86c]"></div>
              </div>

              {/* Expanded State - Full Menu */}
              <div className={`flex items-center gap-4 transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-100' : 'opacity-0 absolute'
              }`}>
                <span className="font-ploni-aaa font-light text-white text-xl min-w-[3rem]">
                  {item.num}
                </span>
                <div className="w-2 h-2 rounded-full bg-[#89a86c] flex-shrink-0"></div>
                <Link
                  to={item.href}
                  className="font-ploni-aaa font-medium text-white text-xl hover:text-[#89a86c] transition-colors whitespace-nowrap"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SideNavigation;
