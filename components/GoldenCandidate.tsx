'use client';

import { GoldenCandidate as GoldenCandidateType, BRAND_PROFILES } from '@/lib/types';
import { motion } from 'framer-motion';

interface GoldenCandidateProps {
  candidate: GoldenCandidateType;
}

export default function GoldenCandidate({ candidate }: GoldenCandidateProps) {
  const { recommendation, totalMentions, sentimentScore, marketGap } = candidate;
  const brandColor = BRAND_PROFILES[recommendation.targetBrand]?.color || '#6B7280';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-yellow-500/30"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-amber-900/20 to-orange-900/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent" />
      
      {/* Sparkle decorations */}
      <div className="absolute top-4 right-4 text-4xl animate-pulse">✨</div>
      <div className="absolute bottom-4 left-4 text-2xl animate-pulse delay-500">🏆</div>
      
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">👑</span>
          <div>
            <p className="text-yellow-400 text-sm font-medium tracking-wide uppercase">
              #1 Golden Candidate
            </p>
            <h2 className="text-3xl font-bold text-white">
              {recommendation.flavorName}
            </h2>
          </div>
        </div>
        
        {/* Product & Brand */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-sm font-medium">
            {recommendation.productType}
          </span>
          <span 
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{ 
              backgroundColor: `${brandColor}30`,
              color: brandColor,
              border: `1px solid ${brandColor}50`
            }}
          >
            for {recommendation.targetBrand}
          </span>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{recommendation.confidence}%</p>
            <p className="text-xs text-slate-400 mt-1">Confidence</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{totalMentions}</p>
            <p className="text-xs text-slate-400 mt-1">Mentions</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">{Math.round(sentimentScore * 100)}%</p>
            <p className="text-xs text-slate-400 mt-1">Positive</p>
          </div>
        </div>
        
        {/* Why It Works */}
        <div className="bg-slate-800/30 rounded-xl p-4 mb-4 border border-slate-700/50">
          <h4 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
            <span>💡</span> Why This Works
          </h4>
          <p className="text-slate-200 leading-relaxed">
            {recommendation.whyItWorks}
          </p>
        </div>
        
        {/* Market Gap */}
        <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-500/30">
          <h4 className="text-emerald-400 font-medium mb-2 flex items-center gap-2">
            <span>🎯</span> Market Opportunity
          </h4>
          <p className="text-slate-200 leading-relaxed">
            {marketGap}
          </p>
        </div>
        
        {/* Supporting Quotes */}
        {recommendation.supportingData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <h4 className="text-slate-400 text-sm font-medium mb-2">What users are saying:</h4>
            <div className="space-y-2">
              {recommendation.supportingData.slice(0, 3).map((quote, i) => (
                <p key={i} className="text-sm text-slate-500 italic">
                  &quot;{quote}&quot;
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

