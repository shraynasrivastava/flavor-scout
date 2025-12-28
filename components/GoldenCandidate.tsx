'use client';

import { GoldenCandidate as GoldenCandidateType, BRAND_PROFILES } from '@/lib/types';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Trophy, 
  Sparkles, 
  Lightbulb, 
  Target, 
  TrendingUp,
  ThumbsDown,
  Shield,
  Zap,
  MessageSquare
} from 'lucide-react';

interface GoldenCandidateProps {
  candidate: GoldenCandidateType;
}

export default function GoldenCandidate({ candidate }: GoldenCandidateProps) {
  const { recommendation, totalMentions, sentimentScore, negativeMentions, marketGap, competitiveAdvantage } = candidate;
  const brandColor = BRAND_PROFILES[recommendation.targetBrand]?.color || '#6B7280';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl gradient-border"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-amber-900/10 to-orange-900/20" />
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      {/* Sparkle decorations */}
      <motion.div 
        className="absolute top-6 right-6"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="w-8 h-8 text-yellow-400" />
      </motion.div>
      <motion.div 
        className="absolute bottom-6 left-6 opacity-60"
        animate={{ 
          y: [0, -5, 0],
          rotate: [0, -5, 5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Trophy className="w-7 h-7 text-yellow-500" />
      </motion.div>
      
      <div className="relative p-6 sm:p-8 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="p-3 rounded-2xl bg-yellow-500/20 border border-yellow-500/40"
          >
            <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400" />
          </motion.div>
          <div className="flex-1">
            <motion.p 
              className="text-yellow-400/80 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              #1 Golden Candidate
            </motion.p>
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {recommendation.flavorName}
            </motion.h2>
          </div>
        </div>
        
        {/* Product & Brand Tags */}
        <motion.div 
          className="flex flex-wrap gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-slate-800/80 text-slate-300 text-sm font-medium border border-slate-700/50">
            {recommendation.productType}
          </span>
          <span 
            className="px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{ 
              backgroundColor: `${brandColor}20`,
              color: brandColor,
              border: `1px solid ${brandColor}40`,
              boxShadow: `0 0 20px ${brandColor}15`
            }}
          >
            for {recommendation.targetBrand}
          </span>
        </motion.div>
        
        {/* Stats Row */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StatBox 
            icon={<TrendingUp className="w-4 h-4" />}
            value={`${recommendation.confidence}%`}
            label="Confidence"
            color="yellow"
          />
          <StatBox 
            icon={<MessageSquare className="w-4 h-4" />}
            value={totalMentions.toString()}
            label="Mentions"
            color="emerald"
          />
          <StatBox 
            icon={<ThumbsDown className="w-4 h-4" />}
            value={negativeMentions?.toString() || '0'}
            label="Pain Points"
            color="red"
          />
          <StatBox 
            icon={<Zap className="w-4 h-4" />}
            value={`${Math.round(sentimentScore * 100)}%`}
            label="Positive"
            color="cyan"
          />
        </motion.div>
        
        {/* Why It Works */}
        <motion.div 
          className="glass-card rounded-xl p-5 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5" /> Why This Works
          </h4>
          <p className="text-slate-200 leading-relaxed text-base">
            {recommendation.whyItWorks}
          </p>
        </motion.div>
        
        {/* Market Gap */}
        <motion.div 
          className="glass-card rounded-xl p-5 mb-4 bg-emerald-900/10 border-emerald-500/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2 text-lg">
            <Target className="w-5 h-5" /> Market Opportunity
          </h4>
          <p className="text-slate-200 leading-relaxed text-base">
            {marketGap}
          </p>
        </motion.div>

        {/* Competitive Advantage */}
        {competitiveAdvantage && (
          <motion.div 
            className="glass-card rounded-xl p-5 mb-4 bg-orange-900/10 border-orange-500/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75 }}
          >
            <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" /> Competitive Advantage
            </h4>
            <p className="text-slate-200 leading-relaxed text-base">
              {competitiveAdvantage}
            </p>
          </motion.div>
        )}

        {/* Existing Comparison */}
        {recommendation.existingComparison && (
          <motion.div 
            className="glass-card rounded-xl p-5 mb-4 bg-blue-900/10 border-blue-500/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h4 className="text-blue-400 font-semibold mb-3 text-sm uppercase tracking-wider">
              vs Current Products
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {recommendation.existingComparison}
            </p>
          </motion.div>
        )}
        
        {/* Supporting Quotes */}
        {recommendation.supportingData.length > 0 && (
          <motion.div 
            className="mt-6 pt-6 border-t border-slate-700/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
          >
            <h4 className="text-slate-400 text-sm font-medium mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> What Real Users Are Saying:
            </h4>
            <div className="space-y-2">
              {recommendation.supportingData.slice(0, 3).map((quote, i) => (
                <motion.p 
                  key={i} 
                  className="text-sm text-slate-400 italic bg-slate-800/30 rounded-lg p-3 border-l-2 border-yellow-500/30"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  &ldquo;{quote}&rdquo;
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function StatBox({ icon, value, label, color }: { 
  icon: React.ReactNode;
  value: string; 
  label: string; 
  color: 'yellow' | 'emerald' | 'cyan' | 'red' 
}) {
  const colorClasses = {
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    red: { text: 'text-red-400', bg: 'bg-red-500/20' }
  };

  const styles = colorClasses[color];

  return (
    <motion.div 
      className="glass-card rounded-xl p-4 text-center"
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`inline-flex p-2 rounded-lg ${styles.bg} ${styles.text} mb-2`}>
        {icon}
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${styles.text} stat-number`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </motion.div>
  );
}
