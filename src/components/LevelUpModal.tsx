import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X, Share2 } from 'lucide-react';
import Confetti from 'react-confetti';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, level, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none z-[101]">
            <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />
        </div>

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 100 }}
          className="relative z-[102] w-full max-w-sm bg-zinc-900 border-2 border-primary/50 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_-10px_rgba(249,115,22,0.5)] overflow-hidden"
        >
          {/* Background Rays Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/30 rounded-full blur-[80px]" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-20"
          >
            <X size={24} />
          </button>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-32 h-32 mb-6 relative"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full animate-pulse blur-md" />
                <div className="absolute inset-1 bg-zinc-900 rounded-full flex items-center justify-center border-4 border-yellow-500">
                    <Trophy size={64} className="text-yellow-400 drop-shadow-lg" fill="currentColor" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xl font-black px-3 py-1 rounded-full border-4 border-zinc-900 shadow-lg">
                    {level}
                </div>
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2"
            >
              Level Up!
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-zinc-400 font-medium mb-8"
            >
              Parabéns! Você alcançou um novo patamar na sua jornada fitness.
            </motion.p>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="w-full space-y-3"
            >
                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                            <Star size={20} fill="currentColor" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-zinc-400 font-bold uppercase">Recompensa</p>
                            <p className="text-white font-bold">Destaque no Perfil</p>
                        </div>
                    </div>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Continuar Evoluindo 🚀
                </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LevelUpModal;
