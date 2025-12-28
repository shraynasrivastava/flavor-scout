'use client';

import { Brand, BRAND_PROFILES } from '@/lib/types';
import { motion } from 'framer-motion';
import { Target, Dumbbell, Leaf, Sparkles } from 'lucide-react';

interface BrandSelectorProps {
  selected: Brand | 'all';
  onSelect: (brand: Brand | 'all') => void;
}

export default function BrandSelector({ selected, onSelect }: BrandSelectorProps) {
  const brands: { id: Brand | 'all'; label: string; color: string; icon: React.ReactNode; tagline: string }[] = [
    { id: 'all', label: 'All Brands', color: '#8B5CF6', icon: <Target className="w-5 h-5" />, tagline: 'View all recommendations' },
    { id: 'MuscleBlaze', label: 'MuscleBlaze', color: BRAND_PROFILES['MuscleBlaze'].color, icon: <Dumbbell className="w-5 h-5" />, tagline: 'For gym enthusiasts' },
    { id: 'HK Vitals', label: 'HK Vitals', color: BRAND_PROFILES['HK Vitals'].color, icon: <Leaf className="w-5 h-5" />, tagline: 'Daily wellness' },
    { id: 'TrueBasics', label: 'TrueBasics', color: BRAND_PROFILES['TrueBasics'].color, icon: <Sparkles className="w-5 h-5" />, tagline: 'Premium quality' }
  ];
  
  return (
    <div className="flex flex-wrap gap-3">
      {brands.map((brand, index) => {
        const isSelected = selected === brand.id;
        
        return (
          <motion.button
            key={brand.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(brand.id)}
            className={`
              relative px-5 py-3 rounded-xl font-medium 
              transition-all duration-300 flex items-center gap-3
              ${isSelected 
                ? 'text-white shadow-lg' 
                : 'text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:text-slate-200'
              }
            `}
            style={isSelected ? {
              backgroundColor: `${brand.color}25`,
              color: brand.color,
              border: `2px solid ${brand.color}70`,
              boxShadow: `0 4px 30px ${brand.color}30`
            } : undefined}
          >
            <motion.div 
              className={`p-2 rounded-lg ${isSelected ? '' : 'bg-slate-700/50'}`}
              style={isSelected ? { backgroundColor: `${brand.color}30` } : undefined}
              animate={{ rotate: isSelected ? [0, -5, 5, 0] : 0 }}
              transition={{ duration: 0.5 }}
            >
              {brand.icon}
            </motion.div>
            <div className="text-left">
              <span className="block text-sm font-semibold">{brand.label}</span>
              <span className={`block text-[10px] ${isSelected ? 'opacity-80' : 'text-slate-500'}`}>
                {brand.tagline}
              </span>
            </div>
            {isSelected && (
              <motion.div
                layoutId="brand-indicator"
                className="absolute inset-0 rounded-xl -z-10"
                style={{ backgroundColor: `${brand.color}10` }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
