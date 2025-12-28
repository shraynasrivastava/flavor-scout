'use client';

import { FlavorRecommendation, BRAND_PROFILES } from '@/lib/types';
import { motion } from 'framer-motion';

interface DecisionEngineProps {
  recommendations: FlavorRecommendation[];
}

const getBrandColor = (brand: string) => {
  return BRAND_PROFILES[brand as keyof typeof BRAND_PROFILES]?.color || '#6B7280';
};

function RecommendationCard({ rec, index, isSelected }: { rec: FlavorRecommendation; index: number; isSelected: boolean }) {
  const brandColor = getBrandColor(rec.targetBrand);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`
        glass-card glass-card-hover p-5 rounded-xl transition-all duration-300
        ${isSelected 
          ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-900/10 to-transparent' 
          : 'border-red-500/30 bg-gradient-to-br from-red-900/10 to-transparent'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-white text-lg leading-tight">{rec.flavorName}</h4>
          <p className="text-sm text-slate-400 mt-0.5">{rec.productType}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span 
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ 
              backgroundColor: `${brandColor}15`,
              color: brandColor,
              border: `1px solid ${brandColor}30`
            }}
          >
            {rec.targetBrand}
          </span>
          <ConfidenceBadge confidence={rec.confidence} />
        </div>
      </div>
      
      {/* Why It Works */}
      <div className={`
        rounded-lg p-3 mb-3
        ${isSelected ? 'bg-emerald-900/20' : 'bg-slate-800/30'}
      `}>
        <p className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
          <span className="text-base mt-0.5">💡</span>
          <span>{rec.whyItWorks}</span>
        </p>
      </div>
      
      {/* Rejection Reason */}
      {!isSelected && rec.rejectionReason && (
        <div className="bg-red-900/20 rounded-lg p-3 mb-3 border-l-2 border-red-500/50">
          <p className="text-sm text-red-300 flex items-start gap-2">
            <span className="text-base">⚠️</span>
            <span>{rec.rejectionReason}</span>
          </p>
        </div>
      )}
      
      {/* Supporting Data */}
      {rec.supportingData.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {rec.supportingData.slice(0, 2).map((data, i) => (
            <span 
              key={i} 
              className="text-xs text-slate-500 bg-slate-800/50 px-2.5 py-1.5 rounded-lg line-clamp-1 max-w-full"
              title={data}
            >
              &ldquo;{data.length > 60 ? data.substring(0, 60) + '...' : data}&rdquo;
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getConfidenceStyle = () => {
    if (confidence >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (confidence >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getConfidenceStyle()}`}>
      {confidence}%
    </span>
  );
}

export default function DecisionEngine({ recommendations }: DecisionEngineProps) {
  const selected = recommendations.filter(r => r.status === 'selected');
  const rejected = recommendations.filter(r => r.status === 'rejected');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Selected Ideas */}
        <div>
          <motion.div 
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-2xl">✅</span>
            <div>
              <h4 className="font-semibold text-emerald-400 text-lg">
                Selected Ideas
              </h4>
              <p className="text-xs text-slate-500">{selected.length} recommendations ready for review</p>
            </div>
          </motion.div>
          <div className="space-y-4">
            {selected.map((rec, index) => (
              <RecommendationCard key={rec.id} rec={rec} index={index} isSelected />
            ))}
            {selected.length === 0 && (
              <p className="text-slate-500 text-sm italic text-center py-8">
                No selected ideas yet
              </p>
            )}
          </div>
        </div>
        
        {/* Rejected Ideas */}
        <div>
          <motion.div 
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-2xl">❌</span>
            <div>
              <h4 className="font-semibold text-red-400 text-lg">
                Rejected Ideas
              </h4>
              <p className="text-xs text-slate-500">{rejected.length} ideas deemed too risky</p>
            </div>
          </motion.div>
          <div className="space-y-4">
            {rejected.length > 0 ? (
              rejected.map((rec, index) => (
                <RecommendationCard key={rec.id} rec={rec} index={index} isSelected={false} />
              ))
            ) : (
              <p className="text-slate-500 text-sm italic text-center py-8">
                No rejected ideas
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
