'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Flame, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  Crown,
  Brain,
  Sparkles,
  IceCream,
  ThumbsDown,
  Package,
  ChevronDown,
  Lightbulb,
  AlertCircle,
  WifiOff
} from 'lucide-react';
import TrendWall from '@/components/TrendWall';
import DecisionEngine from '@/components/DecisionEngine';
import GoldenCandidate from '@/components/GoldenCandidate';
import BrandSelector from '@/components/BrandSelector';
import LoadingState from '@/components/LoadingState';
import { AnalysisResponse, Brand, FlavorRecommendation, NegativeMention } from '@/lib/types';

interface ApiError {
  error: string;
  message: string;
  hint?: string;
  missingVars?: string[];
}

interface CacheInfo {
  usedCache: boolean;
  cacheAgeSeconds: number;
  totalApiFetches: number;
  isFallback?: boolean;
  fallbackReason?: string;
}

export default function Dashboard() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | 'all'>('all');
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);

  const fetchAnalysis = useCallback(async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = forceRefresh ? '/api/analyze?refresh=true' : '/api/analyze';
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        setError(result as ApiError);
        return;
      }
      
      setData(result);
      if (result.cacheInfo) {
        setCacheInfo(result.cacheInfo);
      }
    } catch (err) {
      setError({
        error: 'Network Error',
        message: err instanceof Error ? err.message : 'Failed to connect to server',
        hint: 'Please check your internet connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis(false);
  }, [fetchAnalysis]);

  // Filter recommendations by brand
  const filteredRecommendations: FlavorRecommendation[] = data?.recommendations 
    ? selectedBrand === 'all' 
      ? data.recommendations 
      : data.recommendations.filter(r => r.targetBrand === selectedBrand)
    : [];

  // Filter golden candidate by brand - only show if matches selected brand or 'all' is selected
  const filteredGoldenCandidate = data?.goldenCandidate && 
    (selectedBrand === 'all' || data.goldenCandidate.recommendation.targetBrand === selectedBrand)
    ? data.goldenCandidate
    : null;

  if (loading) return <LoadingState />;

  if (error) {
  return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="noise-overlay" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 max-w-lg text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
          <div className="relative z-10">
            <motion.span 
              className="text-6xl block mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚠️
            </motion.span>
            <h2 className="text-2xl font-bold text-white mb-2">{error.error}</h2>
            <p className="text-slate-300 mb-4">{error.message}</p>
            
            {error.missingVars && error.missingVars.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-slate-400 mb-2">Missing environment variables:</p>
                <div className="flex flex-wrap gap-2">
                  {error.missingVars.map(v => (
                    <code key={v} className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
                      {v}
                    </code>
                  ))}
                </div>
              </div>
            )}
            
            {error.hint && (
              <p className="text-sm text-slate-500 mb-6">💡 {error.hint}</p>
            )}
            
            <button
              onClick={() => fetchAnalysis(false)}
              className="btn-primary px-8 py-3 rounded-xl text-white font-medium"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="noise-overlay" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-5">
              <motion.div 
                className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-600/25 border border-amber-500/40 shadow-lg shadow-amber-500/20"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <IceCream className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
              <motion.div
                className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </motion.div>
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  Flavor Scout
                </h1>
                <p className="text-base sm:text-lg text-slate-400 mt-1">
                  AI-Powered Flavor Trend Discovery for{' '}
                  <span className="text-gradient-brand font-semibold">HealthKart</span>
                </p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <BrandSelector selected={selectedBrand} onSelect={setSelectedBrand} />
              <div className="flex items-center gap-2">
                {/* Cache indicator */}
                {cacheInfo && !loading && (
                  <span className={`text-xs hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                    cacheInfo.isFallback 
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
                      : cacheInfo.usedCache 
                        ? 'text-slate-400 bg-slate-700/30' 
                        : 'text-emerald-400 bg-emerald-500/10'
                  }`}>
                    {cacheInfo.isFallback ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <Package className="w-3 h-3" />
                    )}
                    {cacheInfo.isFallback 
                      ? `Fallback (${Math.floor(cacheInfo.cacheAgeSeconds / 60)}m ago)`
                      : cacheInfo.usedCache 
                        ? `Cached (${Math.floor(cacheInfo.cacheAgeSeconds / 60)}m ago)`
                        : 'Fresh data'
                    }
                  </span>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchAnalysis(false)}
                  className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-slate-300 text-sm font-medium"
                  title="Use cached data if available"
                >
                  <motion.div
                    animate={{ rotate: loading ? 360 : 0 }}
                    transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchAnalysis(true)}
                  className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
                  title="Force fetch new data from NewsAPI"
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Force New</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fallback Data Banner */}
      <AnimatePresence>
        {cacheInfo?.isFallback && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-b border-amber-500/30"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                    <WifiOff className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-amber-300 font-medium text-sm">
                      Showing Cached Data
                    </p>
                    <p className="text-amber-400/70 text-xs">
                      {cacheInfo.fallbackReason || 'API temporarily unavailable'} • 
                      Data from {Math.floor(cacheInfo.cacheAgeSeconds / 60)}m {cacheInfo.cacheAgeSeconds % 60}s ago
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchAnalysis(true)}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-medium flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 relative z-10">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <StatCard 
            icon={<BarChart3 className="w-6 h-6" />}
            value={data?.rawPostCount || 0} 
            label="Articles Analyzed" 
            color="purple"
            delay={0}
          />
          <StatCard 
            icon={<Flame className="w-6 h-6" />}
            value={data?.trendKeywords.length || 0} 
            label="Trending Keywords" 
            color="orange"
            delay={0.1}
          />
          <StatCard 
            icon={<CheckCircle2 className="w-6 h-6" />}
            value={data?.recommendations.filter(r => r.status === 'selected').length || 0} 
            label="Selected Ideas" 
            color="emerald"
            delay={0.2}
          />
          <StatCard 
            icon={<ThumbsDown className="w-6 h-6" />}
            value={data?.negativeMentions?.length || 0} 
            label="Pain Points Found" 
            color="red"
            delay={0.25}
          />
          <StatCard 
            icon={<Clock className="w-6 h-6" />}
            value={data?.analyzedAt ? formatTime(data.analyzedAt) : '-'} 
            label="Last Updated" 
            color="cyan"
            delay={0.3}
          />
        </motion.div>

        {/* Analysis Insights Summary */}
        {data?.analysisInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-2xl p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Market Analysis</h3>
                <p className="text-slate-300 leading-relaxed">{data.analysisInsights}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Golden Candidate - Hero Section (filtered by selected brand) */}
        <AnimatePresence>
          {filteredGoldenCandidate && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SectionHeader 
                icon={<Crown className="w-6 h-6 text-yellow-400" />}
                iconBg="bg-yellow-500/20 border-yellow-500/30"
                title="Golden Recommendation" 
                subtitle={selectedBrand === 'all' 
                  ? "The #1 flavor opportunity based on AI analysis of industry news"
                  : `Top recommendation for ${selectedBrand}`}
                highlight
              />
              <GoldenCandidate candidate={filteredGoldenCandidate} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Trend Wall */}
        {data?.trendKeywords && data.trendKeywords.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SectionHeader 
              icon={<TrendingUp className="w-7 h-7 text-emerald-400" />}
              iconBg="bg-emerald-500/20 border-emerald-500/30"
              title="Flavor Trend Wall" 
              subtitle="Real-time flavor keywords trending in health & fitness industry — click any tag for details"
            />
            <TrendWall keywords={data.trendKeywords} />
          </motion.section>
        )}

        {/* Negative Mentions / Pain Points */}
        {data?.negativeMentions && data.negativeMentions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <SectionHeader 
              icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
              iconBg="bg-red-500/20 border-red-500/30"
              title="Consumer Pain Points" 
              subtitle="Complaints and issues to address with new flavors"
            />
            <NegativeMentionsPanel mentions={data.negativeMentions} />
          </motion.section>
        )}

        {/* Decision Engine */}
        {filteredRecommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SectionHeader 
              icon={<Brain className="w-6 h-6 text-purple-400" />}
              iconBg="bg-purple-500/20 border-purple-500/30"
              title="AI Decision Engine" 
              subtitle={selectedBrand === 'all' 
                ? "All AI-curated flavor recommendations with reasoning" 
                : `Flavor opportunities for ${selectedBrand}`}
            />
            <DecisionEngine recommendations={filteredRecommendations} />
          </motion.section>
        )}

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-12 pb-6 border-t border-slate-800/50 text-center"
        >
          <div className="flex justify-center items-center gap-2 mb-4">
            <IceCream className="w-6 h-6 text-amber-400" />
            <span className="text-slate-400 text-sm font-medium">Flavor Scout</span>
          </div>
          <p className="text-slate-500 text-sm mb-2">
            Powered by <span className="text-purple-400">Groq AI</span> + <span className="text-orange-400">NewsAPI</span>
          </p>
          <div className="flex justify-center items-center gap-4 text-sm">
            <span className="text-[#FF6B35] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF6B35]" /> MuscleBlaze</span>
            <span className="text-[#4ECDC4] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4ECDC4]" /> HK Vitals</span>
            <span className="text-[#9B59B6] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#9B59B6]" /> TrueBasics</span>
        </div>
          <p className="text-slate-600 text-xs mt-4">
            Built for HealthKart by Shrayna Srivastava
          </p>
        </motion.footer>
      </main>
    </div>
  );
}

// Helper function to format time
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

// Section Header Component
function SectionHeader({ 
  icon, 
  iconBg,
  title, 
  subtitle,
  highlight = false 
}: { 
  icon: React.ReactNode; 
  iconBg?: string;
  title: string; 
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div className="mb-8">
      <motion.h2 
        className={`text-2xl sm:text-3xl font-bold text-white flex items-center gap-4 ${highlight ? 'text-gradient' : ''}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className={`p-3 rounded-xl border ${iconBg || 'bg-slate-500/20 border-slate-500/30'}`}>
          {icon}
        </div>
        {title}
      </motion.h2>
      <p className="text-slate-400 text-base mt-2 ml-16">{subtitle}</p>
    </div>
  );
}

// Negative Mentions Panel Component - Enhanced with clickable cards
function NegativeMentionsPanel({ mentions }: { mentions: NegativeMention[] }) {
  const [selectedMention, setSelectedMention] = useState<NegativeMention | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxFrequency = Math.max(...mentions.map(m => m.frequency), 1);
  
  // Sort by frequency descending
  const sortedMentions = [...mentions].sort((a, b) => b.frequency - a.frequency);

  // Generate opportunity suggestion based on complaint
  const getOpportunity = (mention: NegativeMention) => {
    const complaint = mention.complaint.toLowerCase();
    if (complaint.includes('sweet')) return `Launch a "Less Sweet" or "Dark" variant of ${mention.flavor} to address this demand`;
    if (complaint.includes('artificial')) return `Introduce a "Natural" or "Clean Label" version with real ${mention.flavor} extract`;
    if (complaint.includes('bland')) return `Create an "Intense" or "Bold" ${mention.flavor} variant with stronger flavor profile`;
    if (complaint.includes('chalky')) return `Reformulate with improved texture using premium ingredients`;
    if (complaint.includes('expensive')) return `Consider a value pack or subscription discount for loyal customers`;
    return `Address feedback with improved ${mention.flavor} formula based on user preferences`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card rounded-2xl p-6"
    >
      {/* Summary stats */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/30">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{mentions.length}</p>
            <p className="text-xs text-slate-500">Flavor Issues</p>
          </div>
          <div className="h-10 w-px bg-slate-700/50" />
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-400">
              {mentions.reduce((acc, m) => acc + m.frequency, 0)}
            </p>
            <p className="text-xs text-slate-500">Total Reviews</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
          <Lightbulb className="w-4 h-4" />
          <span>Click to see opportunity</span>
        </div>
      </div>

      {/* Grid of pain point cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {sortedMentions.map((mention, index) => {
          const barWidth = (mention.frequency / maxFrequency) * 100;
          const isHovered = hoveredIndex === index;
          const isSelected = selectedMention?.flavor === mention.flavor;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => setSelectedMention(isSelected ? null : mention)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative cursor-pointer rounded-xl overflow-hidden
                border-2 transition-all duration-300
                ${isSelected 
                  ? 'border-emerald-500/60 bg-emerald-900/20 shadow-lg shadow-emerald-500/20' 
                  : isHovered 
                    ? 'border-red-500/50 bg-red-900/20 shadow-lg shadow-red-500/10' 
                    : 'border-slate-700/30 bg-slate-800/30'
                }
              `}
            >
              {/* Progress bar background */}
              <motion.div
                className={`absolute inset-y-0 left-0 ${isSelected ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/5' : 'bg-gradient-to-r from-red-500/20 to-red-600/5'}`}
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ delay: index * 0.08 + 0.2, duration: 0.5, ease: "easeOut" }}
              />
              
              {/* Content */}
              <div className="relative p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`
                      flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg
                      ${isSelected ? 'bg-emerald-500/30 text-emerald-400' : 'bg-red-500/20 text-red-400'}
                      transition-colors
                    `}>
                      {mention.frequency}×
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg capitalize">{mention.flavor}</h4>
                      <span className="text-xs text-slate-500">{mention.source}</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isSelected ? 180 : 0 }}
                    className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}
                  >
                    <ChevronDown className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </motion.div>
                </div>
                
                {/* Complaint */}
                <p className={`text-sm mb-3 ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                  <span className="text-red-400 font-medium">Issue: </span>
                  {mention.complaint}
                </p>
                
                {/* Expanded opportunity */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pt-3 border-t border-slate-700/50"
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                            Opportunity
                          </p>
                          <p className="text-sm text-emerald-200">
                            {getOpportunity(mention)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary insight */}
      {mentions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-slate-700/30 flex items-center justify-between"
        >
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Every complaint is a potential product improvement</span>
          </p>
          <span className="text-xs text-slate-500">Based on customer reviews</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// Enhanced Stat Card Component with micro-interactions
function StatCard({ 
  icon, 
  value, 
  label, 
  color,
  delay = 0 
}: { 
  icon: React.ReactNode; 
  value: string | number; 
  label: string;
  color: 'purple' | 'orange' | 'emerald' | 'cyan' | 'red';
  delay?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const colorStyles = {
    purple: {
      gradient: 'from-purple-500/20 via-purple-600/10 to-transparent',
      border: 'border-purple-500/30',
      hoverBorder: 'hover:border-purple-400/50',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/25',
      iconBg: 'bg-purple-500/20',
      ring: 'ring-purple-500/20'
    },
    orange: {
      gradient: 'from-orange-500/20 via-orange-600/10 to-transparent',
      border: 'border-orange-500/30',
      hoverBorder: 'hover:border-orange-400/50',
      text: 'text-orange-400',
      glow: 'shadow-orange-500/25',
      iconBg: 'bg-orange-500/20',
      ring: 'ring-orange-500/20'
    },
    emerald: {
      gradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
      border: 'border-emerald-500/30',
      hoverBorder: 'hover:border-emerald-400/50',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/25',
      iconBg: 'bg-emerald-500/20',
      ring: 'ring-emerald-500/20'
    },
    cyan: {
      gradient: 'from-cyan-500/20 via-cyan-600/10 to-transparent',
      border: 'border-cyan-500/30',
      hoverBorder: 'hover:border-cyan-400/50',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/25',
      iconBg: 'bg-cyan-500/20',
      ring: 'ring-cyan-500/20'
    },
    red: {
      gradient: 'from-red-500/20 via-red-600/10 to-transparent',
      border: 'border-red-500/30',
      hoverBorder: 'hover:border-red-400/50',
      text: 'text-red-400',
      glow: 'shadow-red-500/25',
      iconBg: 'bg-red-500/20',
      ring: 'ring-red-500/20'
    },
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-xl p-4 sm:p-5 cursor-pointer
        bg-gradient-to-br ${styles.gradient} 
        border ${styles.border} ${styles.hoverBorder}
        transition-all duration-300
        ${isHovered ? `shadow-lg ${styles.glow}` : ''}
      `}
    >
      {/* Animated background glow */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-r ${styles.gradient} opacity-0`}
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shimmer effect on hover */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      )}
      
      <div className="relative flex items-center gap-3 sm:gap-4">
        <motion.div 
          className={`p-2.5 rounded-xl ${styles.iconBg} ${styles.text} ring-1 ${styles.ring}`}
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? [0, -5, 5, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <div>
          <motion.p 
            className={`text-2xl sm:text-3xl font-bold ${styles.text} stat-number`}
            animate={{ scale: isHovered ? 1.05 : 1 }}
          >
            {value}
          </motion.p>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
