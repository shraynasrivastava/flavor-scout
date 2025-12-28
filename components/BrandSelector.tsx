'use client';

import { Brand, BRAND_PROFILES } from '@/lib/types';
import { motion } from 'framer-motion';

interface BrandSelectorProps {
  selected: Brand | 'all';
  onSelect: (brand: Brand | 'all') => void;
}

export default function BrandSelector({ selected, onSelect }: BrandSelectorProps) {
  const brands: (Brand | 'all')[] = ['all', 'MuscleBlaze', 'HK Vitals', 'TrueBasics'];
  
  return (
    <div className="flex flex-wrap gap-2">
      {brands.map((brand) => {
        const isSelected = selected === brand;
        const color = brand === 'all' 
          ? '#8B5CF6' 
          : BRAND_PROFILES[brand as Brand]?.color || '#6B7280';
        
        return (
          <motion.button
            key={brand}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(brand)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isSelected 
                ? 'text-white shadow-lg' 
                : 'text-slate-400 bg-slate-800/50 hover:bg-slate-700/50'
            }`}
            style={isSelected ? {
              backgroundColor: `${color}30`,
              color: color,
              border: `2px solid ${color}`,
              boxShadow: `0 0 20px ${color}30`
            } : {
              border: '2px solid transparent'
            }}
          >
            {brand === 'all' ? '🎯 All Brands' : brand}
          </motion.button>
        );
      })}
    </div>
  );
}

