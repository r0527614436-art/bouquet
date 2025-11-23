import { motion } from 'framer-motion';
import bouquetLogo3D from '@/assets/bouquet-logo-3d.png';

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#11150d]"
    >
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8"
        >
          <img 
            src={bouquetLogo3D} 
            alt="Bouquet Logo" 
            className="w-48 h-48 mx-auto"
          />
        </motion.div>
        
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <p className="text-white text-2xl font-ploni-aaa">טוען...</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
