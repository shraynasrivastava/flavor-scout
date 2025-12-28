'use client';

import { FlavorRecommendation, BRAND_PROFILES } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Megaphone,
  GitCompare,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface DecisionEngineProps {
  recommendations: FlavorRecommendation[];
}

const getBrandColor = (brand: string) => {
  return BRAND_PROFILES[brand as keyof typeof BRAND_PROFILES]?.color || '#6B7280';
};

function RecommendationCard({ rec, index, isSelected }: { rec: FlavorRecommendation; index: number; isSelected: boolean }) {
  const brandColor = getBrandColor(rec.targetBrand);
  const [expanded, setExpanded] = useState(false);
  const hasDetails = rec.analysis || rec.existingComparison || rec.promotionOpportunity;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      className={`
        glass-card glass-card-hover rounded-xl transition-all duration-300 overflow-hidden
        ${isSelected 
          ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-900/10 to-transparent' 
          : 'border-red-500/30 bg-gradient-to-br from-red-900/10 to-transparent'
        }
      `}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-white text-lg leading-tight flex items-center gap-2">
              {rec.flavorName}
              {isSelected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </h4>
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
            <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
            <span>{rec.whyItWorks}</span>
          </p>
        </div>

        {/* Existing Comparison */}
        {rec.existingComparison && (
          <div className="bg-blue-900/20 rounded-lg p-3 mb-3 border-l-2 border-blue-500/50">
            <p className="text-sm text-blue-300 flex items-start gap-2">
              <GitCompare className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>vs Current:</strong> {rec.existingComparison}</span>
            </p>
          </div>
        )}

        {/* Promotion Opportunity */}
        {rec.promotionOpportunity && (
          <div className="bg-purple-900/20 rounded-lg p-3 mb-3 border-l-2 border-purple-500/50">
            <p className="text-sm text-purple-300 flex items-start gap-2">
              <Megaphone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>Promotion Tip:</strong> {rec.promotionOpportunity}</span>
            </p>
          </div>
        )}
        
        {/* Rejection Reason */}
        {!isSelected && rec.rejectionReason && (
          <div className="bg-red-900/20 rounded-lg p-3 mb-3 border-l-2 border-red-500/50">
            <p className="text-sm text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{rec.rejectionReason}</span>
            </p>
          </div>
        )}

        {/* Expand Button for Details */}
        {hasDetails && rec.analysis && (
          <motion.button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 text-slate-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" /> Hide Analysis
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> View Detailed Analysis
              </>
            )}
          </motion.button>
        )}
      </div>
      
      {/* Expandable Analysis Section */}
      <AnimatePresence>
        {expanded && rec.analysis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-700/50 bg-slate-900/50"
          >
            <div className="p-5 space-y-3">
              {/* Market Demand */}
              <div className="flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Market Demand</p>
                  <p className="text-sm text-slate-300">{rec.analysis.marketDemand}</p>
                </div>
              </div>
              
              {/* Competitor Gap */}
              <div className="flex items-start gap-3">
                <Target className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Competitor Gap</p>
                  <p className="text-sm text-slate-300">{rec.analysis.competitorGap}</p>
                </div>
              </div>
              
              {/* Consumer Pain Point */}
              <div className="flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Pain Point Addressed</p>
                  <p className="text-sm text-slate-300">{rec.analysis.consumerPainPoint}</p>
                </div>
              </div>
              
              {/* Risk Factors */}
              {rec.analysis.riskFactors && rec.analysis.riskFactors.length > 0 && (
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Risk Factors</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {rec.analysis.riskFactors.map((risk, i) => (
                        <span key={i} className="text-xs bg-red-900/30 text-red-300 px-2 py-0.5 rounded">
                          {risk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
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
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
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
