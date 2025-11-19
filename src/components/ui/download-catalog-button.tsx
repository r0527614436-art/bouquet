import { ArrowDown } from 'lucide-react';

interface DownloadCatalogButtonProps {
  onClick: () => void;
}

export const DownloadCatalogButton = ({ onClick }: DownloadCatalogButtonProps) => {
  return (
    <div className="absolute left-4 bottom-0 translate-y-1/2 z-[100]">
      {/* White circle background - behind the button */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-0 w-32 h-16 bg-white rounded-b-full shadow-lg -z-10" />
      
      <button onClick={onClick} className="relative z-10 group" aria-label="להורדת הקטלוג הדיגיטלי שלנו">
        <div className="relative w-24 h-24 hover:scale-110 transition-transform duration-300 mx-[59px] py-0 px-0 my-0 rounded-full">
          {/* Rotating text circle */}
          <svg 
            className="w-full h-full drop-shadow-2xl animate-spin-slow" 
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <path
                id="circlePath"
                d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
              />
            </defs>
            <text className="text-[20px] font-ploni-black fill-[#314020]">
              <textPath href="#circlePath" startOffset="0%">
                להורדת הקטלוג הדיגיטלי שלנו • להורדת הקטלוג הדיגיטלי שלנו •
              </textPath>
            </text>
          </svg>
          
          {/* Static arrow in center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <ArrowDown className="w-20 h-20 text-[#314020]" strokeWidth={2.5} />
          </div>
        </div>
      </button>
    </div>
  );
};
