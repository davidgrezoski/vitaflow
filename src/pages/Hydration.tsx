import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Droplets, Trophy } from 'lucide-react';
import { useApp } from '../context/Store';

const Hydration = () => {
  const { water, addWater } = useApp();
  
  const percentage = Math.min(100, (water.current / water.goal) * 100);

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border shadow-sm">
      
      {/* Liquid Animation Container */}
      <div className="absolute inset-0 z-0 flex items-end overflow-hidden rounded-[2.5rem]">
        <motion.div 
          className="w-full bg-blue-500 dark:bg-blue-600 relative"
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 20 }}
        >
            {/* Wave decoration on top */}
            <div className="absolute -top-4 left-0 w-full h-8 bg-blue-500 dark:bg-blue-600 opacity-50 blur-lg rounded-full"></div>
        </motion.div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex-1 flex flex-col p-8 justify-between">
        
        {/* Header Info */}
        <div className="flex justify-between items-start">
            <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm">
                <p className="text-xs font-bold text-gray-500 dark:text-blue-200 uppercase tracking-wider mb-1">Meta Diária</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{water.goal}ml</p>
            </div>
            <div className="w-12 h-12 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                <Droplets size={24} fill="currentColor" className="opacity-80" />
            </div>
        </div>

        {/* Center Big Number */}
        <div className="text-center mix-blend-difference text-white dark:text-white">
           <h2 className="text-8xl font-black tracking-tighter">
            {Math.round(percentage)}<span className="text-4xl">%</span>
           </h2>
           <p className="text-lg font-medium opacity-80 mt-2">{water.current}ml consumidos</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <WaterButton amount={250} onClick={() => addWater(250)} />
          <WaterButton amount={500} onClick={() => addWater(500)} />
        </div>
      </div>
    </div>
  );
};

const WaterButton = ({ amount, onClick }: { amount: number, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="bg-white/90 dark:bg-black/60 backdrop-blur-xl p-5 rounded-[2rem] shadow-lg border border-white/50 dark:border-white/10 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-all group"
  >
    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
      <Plus size={20} />
    </div>
    <span className="font-bold text-gray-900 dark:text-white text-lg">+{amount}ml</span>
  </button>
);

export default Hydration;
