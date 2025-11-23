import { motion } from 'framer-motion';
import bouquetLogoArch from '@/assets/bouquet-logo-arch.png';

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          <img 
            src={bouquetLogoArch} 
            alt="Bouquet Logo" 
            className="w-64 h-auto mx-auto"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
