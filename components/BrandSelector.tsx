'use client';

import { Brand, BRAND_PROFILES } from '@/lib/types';
import { motion } from 'framer-motion';

interface BrandSelectorProps {
  selected: Brand | 'all';
  onSelect: (brand: Brand | 'all') => void;
}

export default function BrandSelector({ selected, onSelect }: BrandSelectorProps) {
  const brands: { id: Brand | 'all'; label: string; color: string; icon: string }[] = [
    { id: 'all', label: 'All Brands', color: '#8B5CF6', icon: '🎯' },
    { id: 'MuscleBlaze', label: 'MuscleBlaze', color: BRAND_PROFILES['MuscleBlaze'].color, icon: '💪' },
    { id: 'HK Vitals', label: 'HK Vitals', color: BRAND_PROFILES['HK Vitals'].color, icon: '🌿' },
    { id: 'TrueBasics', label: 'TrueBasics', color: BRAND_PROFILES['TrueBasics'].color, icon: '✨' }
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      {brands.map((brand, index) => {
        const isSelected = selected === brand.id;
        
        return (
          <motion.button
            key={brand.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(brand.id)}
            className={`
              relative px-4 py-2 rounded-xl text-sm font-medium 
              transition-all duration-300 flex items-center gap-2
              ${isSelected 
                ? 'text-white' 
                : 'text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50'
              }
            `}
            style={isSelected ? {
              backgroundColor: `${brand.color}20`,
              color: brand.color,
              border: `2px solid ${brand.color}60`,
              boxShadow: `0 0 25px ${brand.color}25`
            } : undefined}
          >
            <span className="text-base">{brand.icon}</span>
            <span className="hidden sm:inline">{brand.label}</span>
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
