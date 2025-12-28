'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrendWall from '@/components/TrendWall';
import DecisionEngine from '@/components/DecisionEngine';
import GoldenCandidate from '@/components/GoldenCandidate';
import BrandSelector from '@/components/BrandSelector';
import LoadingState from '@/components/LoadingState';
import { AnalysisResponse, Brand, FlavorRecommendation } from '@/lib/types';

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
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-5xl">🍦</span>
                <motion.div
                  className="absolute -top-1 -right-1 text-lg"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.div>
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Flavor Scout
                </h1>
                <p className="text-sm text-slate-400 hidden sm:block">
                  AI-Powered Flavor Trend Discovery for{' '}
                  <span className="text-gradient-brand font-medium">HealthKart</span>
                </p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <BrandSelector selected={selectedBrand} onSelect={setSelectedBrand} />
              <div className="flex items-center gap-2">
                {/* Cache indicator */}
                {cacheInfo && !loading && (
                  <span className="text-xs text-slate-500 hidden sm:block">
                    {cacheInfo.usedCache 
                      ? `📦 Cached (${Math.floor(cacheInfo.cacheAgeSeconds / 60)}m ago)`
                      : '🔄 Fresh data'
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
                  <motion.span
                    animate={{ rotate: loading ? 360 : 0 }}
                    transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                  >
                    🔄
                  </motion.span>
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchAnalysis(true)}
                  className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
                  title="Force fetch new data from NewsAPI"
                >
                  ⚡
                  <span className="hidden sm:inline">Force New</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 relative z-10">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard 
            icon="📊" 
            value={data?.rawPostCount || 0} 
            label="News Articles Analyzed" 
            color="purple"
            delay={0}
          />
          <StatCard 
            icon="🔥" 
            value={data?.trendKeywords.length || 0} 
            label="Trending Keywords" 
            color="orange"
            delay={0.1}
          />
          <StatCard 
            icon="✅" 
            value={data?.recommendations.filter(r => r.status === 'selected').length || 0} 
            label="Selected Ideas" 
            color="emerald"
            delay={0.2}
          />
          <StatCard 
            icon="🕐" 
            value={data?.analyzedAt ? formatTime(data.analyzedAt) : '-'} 
            label="Last Updated" 
            color="cyan"
            delay={0.3}
          />
        </motion.div>

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
                icon="👑" 
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
              icon="📈" 
              title="Trend Wall" 
              subtitle="Trending flavor keywords from news and industry content"
            />
            <TrendWall keywords={data.trendKeywords} />
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
              icon="🧠" 
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
            <span className="text-2xl">🍦</span>
            <span className="text-slate-400 text-sm">Flavor Scout</span>
          </div>
          <p className="text-slate-500 text-sm mb-2">
            Powered by <span className="text-purple-400">Groq AI</span> + <span className="text-orange-400">NewsAPI</span>
          </p>
          <div className="flex justify-center items-center gap-4 text-sm">
            <span className="text-[#FF6B35]">● MuscleBlaze</span>
            <span className="text-[#4ECDC4]">● HK Vitals</span>
            <span className="text-[#9B59B6]">● TrueBasics</span>
          </div>
          <p className="text-slate-600 text-xs mt-4">
            Built with ❤️ for HealthKart by Shrayna Srivastava
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
  title, 
  subtitle,
  highlight = false 
}: { 
  icon: string; 
  title: string; 
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div className="mb-6">
      <motion.h2 
        className={`text-xl sm:text-2xl font-bold text-white flex items-center gap-3 ${highlight ? 'text-gradient' : ''}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span className="text-2xl sm:text-3xl">{icon}</span>
        {title}
      </motion.h2>
      <p className="text-slate-400 text-sm mt-1 ml-10 sm:ml-12">{subtitle}</p>
    </div>
  );
}

// Enhanced Stat Card Component
function StatCard({ 
  icon, 
  value, 
  label, 
  color,
  delay = 0 
}: { 
  icon: string; 
  value: string | number; 
  label: string;
  color: 'purple' | 'orange' | 'emerald' | 'cyan';
  delay?: number;
}) {
  const colorStyles = {
    purple: {
      gradient: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      glow: 'hover:shadow-purple-500/20'
    },
    orange: {
      gradient: 'from-orange-500/20 to-orange-600/5',
      border: 'border-orange-500/20',
      text: 'text-orange-400',
      glow: 'hover:shadow-orange-500/20'
    },
    emerald: {
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'hover:shadow-emerald-500/20'
    },
    cyan: {
      gradient: 'from-cyan-500/20 to-cyan-600/5',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      glow: 'hover:shadow-cyan-500/20'
    },
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        glass-card glass-card-hover rounded-xl p-4 sm:p-5 
        bg-gradient-to-br ${styles.gradient} 
        border ${styles.border}
        transition-all duration-300 ${styles.glow} hover:shadow-lg
      `}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <motion.span 
          className="text-3xl sm:text-4xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay }}
        >
          {icon}
        </motion.span>
        <div>
          <p className={`text-2xl sm:text-3xl font-bold ${styles.text} stat-number`}>
            {value}
          </p>
          <p className="text-xs sm:text-sm text-slate-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
