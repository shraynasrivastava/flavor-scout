'use client';

import { FlavorRecommendation, BRAND_PROFILES } from '@/lib/types';
import { motion } from 'framer-motion';

interface DecisionEngineProps {
  recommendations: FlavorRecommendation[];
}

const getBrandColor = (brand: string) => {
  return BRAND_PROFILES[brand as keyof typeof BRAND_PROFILES]?.color || '#6B7280';
};

function RecommendationCard({ rec, index }: { rec: FlavorRecommendation; index: number }) {
  const isSelected = rec.status === 'selected';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isSelected ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`p-4 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] ${
        isSelected 
          ? 'bg-emerald-900/20 border-emerald-500/30 hover:border-emerald-500/50' 
          : 'bg-red-900/20 border-red-500/30 hover:border-red-500/50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-white text-lg">{rec.flavorName}</h4>
          <p className="text-sm text-slate-400">{rec.productType}</p>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${getBrandColor(rec.targetBrand)}20`,
              color: getBrandColor(rec.targetBrand),
              border: `1px solid ${getBrandColor(rec.targetBrand)}50`
            }}
          >
            {rec.targetBrand}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            rec.confidence >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
            rec.confidence >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {rec.confidence}%
          </span>
        </div>
      </div>
      
      <p className="text-sm text-slate-300 mb-3 leading-relaxed">
        💡 {rec.whyItWorks}
      </p>
      
      {rec.status === 'rejected' && rec.rejectionReason && (
        <p className="text-sm text-red-400 mb-3 flex items-start gap-2">
          <span>⚠️</span>
          <span>{rec.rejectionReason}</span>
        </p>
      )}
      
      <div className="flex flex-wrap gap-1.5">
        {rec.supportingData.slice(0, 2).map((data, i) => (
          <span 
            key={i} 
            className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg line-clamp-1"
            title={data}
          >
            &quot;{data.length > 50 ? data.substring(0, 50) + '...' : data}&quot;
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function DecisionEngine({ recommendations }: DecisionEngineProps) {
  const selected = recommendations.filter(r => r.status === 'selected');
  const rejected = recommendations.filter(r => r.status === 'rejected');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
    >
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">🧠</span> Decision Engine
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Selected Ideas */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-emerald-400 text-lg">✅</span>
            <h4 className="font-medium text-emerald-400">
              Selected Ideas ({selected.length})
            </h4>
          </div>
          <div className="space-y-4">
            {selected.map((rec, index) => (
              <RecommendationCard key={rec.id} rec={rec} index={index} />
            ))}
          </div>
        </div>
        
        {/* Rejected Ideas */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-400 text-lg">❌</span>
            <h4 className="font-medium text-red-400">
              Rejected Ideas ({rejected.length})
            </h4>
          </div>
          <div className="space-y-4">
            {rejected.length > 0 ? (
              rejected.map((rec, index) => (
                <RecommendationCard key={rec.id} rec={rec} index={index} />
              ))
            ) : (
              <p className="text-slate-500 text-sm italic">No rejected ideas</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

