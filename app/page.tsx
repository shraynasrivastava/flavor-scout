'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrendWall from '@/components/TrendWall';
import DecisionEngine from '@/components/DecisionEngine';
import GoldenCandidate from '@/components/GoldenCandidate';
import BrandSelector from '@/components/BrandSelector';
import LoadingState from '@/components/LoadingState';
import { AnalysisResponse, Brand, FlavorRecommendation } from '@/lib/types';

export default function Dashboard() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | 'all'>('all');

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze');
      if (!response.ok) throw new Error('Failed to fetch analysis');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Filter recommendations by brand
  const filteredRecommendations: FlavorRecommendation[] = data?.recommendations 
    ? selectedBrand === 'all' 
      ? data.recommendations 
      : data.recommendations.filter(r => r.targetBrand === selectedBrand)
    : [];

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 max-w-md text-center"
        >
          <span className="text-5xl mb-4 block">😕</span>
          <h2 className="text-xl font-semibold text-red-400 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalysis}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.span 
                className="text-4xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🍦
              </motion.span>
              <div>
                <h1 className="text-2xl font-bold text-white">Flavor Scout</h1>
                <p className="text-sm text-slate-400">AI-Powered Flavor Trend Discovery</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <BrandSelector selected={selectedBrand} onSelect={setSelectedBrand} />
              <button
                onClick={fetchAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <span>🔄</span> Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard 
            icon="📊" 
            value={data?.rawPostCount || 0} 
            label="Posts Analyzed" 
            color="purple"
          />
          <StatCard 
            icon="🔥" 
            value={data?.trendKeywords.length || 0} 
            label="Trending Keywords" 
            color="orange"
          />
          <StatCard 
            icon="✅" 
            value={data?.recommendations.filter(r => r.status === 'selected').length || 0} 
            label="Selected Ideas" 
            color="emerald"
          />
          <StatCard 
            icon="⏱️" 
            value={data?.analyzedAt ? new Date(data.analyzedAt).toLocaleTimeString() : '-'} 
            label="Last Updated" 
            color="cyan"
          />
        </motion.div>

        {/* Golden Candidate - Hero Section */}
        {data?.goldenCandidate && (
          <section>
            <SectionHeader 
              icon="👑" 
              title="Top Recommendation" 
              subtitle="The #1 flavor opportunity based on AI analysis"
            />
            <GoldenCandidate candidate={data.goldenCandidate} />
          </section>
        )}

        {/* Trend Wall */}
        {data?.trendKeywords && data.trendKeywords.length > 0 && (
          <section>
            <SectionHeader 
              icon="📈" 
              title="Trend Wall" 
              subtitle="What consumers are talking about right now"
            />
            <TrendWall keywords={data.trendKeywords} />
          </section>
        )}

        {/* Decision Engine */}
        {filteredRecommendations.length > 0 && (
          <section>
            <SectionHeader 
              icon="🧠" 
              title="All Recommendations" 
              subtitle={selectedBrand === 'all' 
                ? "AI-curated flavor ideas for all brands" 
                : `Flavor ideas for ${selectedBrand}`}
            />
            <DecisionEngine recommendations={filteredRecommendations} />
          </section>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>Built for HealthKart • Powered by Groq AI + Reddit Data</p>
          <p className="mt-1">
            Brands: 
            <span className="text-[#FF6B35] mx-2">MuscleBlaze</span>•
            <span className="text-[#4ECDC4] mx-2">HK Vitals</span>•
            <span className="text-[#9B59B6] mx-2">TrueBasics</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

// Helper Components
function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
      <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { 
  icon: string; 
  value: string | number; 
  label: string;
  color: 'purple' | 'orange' | 'emerald' | 'cyan';
}) {
  const colorClasses = {
    purple: 'from-purple-900/30 to-purple-800/20 border-purple-500/30',
    orange: 'from-orange-900/30 to-orange-800/20 border-orange-500/30',
    emerald: 'from-emerald-900/30 to-emerald-800/20 border-emerald-500/30',
    cyan: 'from-cyan-900/30 to-cyan-800/20 border-cyan-500/30',
  };

  const textColors = {
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className={`text-xl font-bold ${textColors[color]}`}>{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
