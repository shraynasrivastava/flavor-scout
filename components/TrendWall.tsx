'use client';

import { useState } from 'react';
import { TrendKeyword } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, BarChart3, TrendingUp, TrendingDown, Minus, Info, Sparkles, Star, IceCream, Zap } from 'lucide-react';

interface TrendWallProps {
  keywords: TrendKeyword[];
}

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return '#10B981';
    case 'negative':
      return '#EF4444';
    default:
      return '#64748B';
  }
};

const getSentimentGradient = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'from-emerald-500/20 to-emerald-600/5';
    case 'negative':
      return 'from-red-500/20 to-red-600/5';
    default:
      return 'from-slate-500/20 to-slate-600/5';
  }
};

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return <TrendingUp className="w-3 h-3" />;
    case 'negative':
      return <TrendingDown className="w-3 h-3" />;
    default:
      return <Minus className="w-3 h-3" />;
  }
};

export default function TrendWall({ keywords }: TrendWallProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<TrendKeyword | null>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  
  const sortedKeywords = [...keywords].sort((a, b) => b.value - a.value).slice(0, 12);
  
  const maxValue = Math.max(...keywords.map(k => k.value), 1);
  const minValue = Math.min(...keywords.map(k => k.value));
  const getFontSize = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue || 1);
    return 16 + ratio * 24; // Bigger range for more visual impact
  };

  // Calculate stats
  const positiveCount = keywords.filter(k => k.sentiment === 'positive').length;
  const negativeCount = keywords.filter(k => k.sentiment === 'negative').length;
  const totalMentions = keywords.reduce((acc, k) => acc + k.value, 0);
  const topFlavor = sortedKeywords[0];

  return (
    <div className="space-y-6">
      {/* Top Trending Flavor Highlight */}
      {topFlavor && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 bg-gradient-to-r from-orange-900/20 via-yellow-900/10 to-transparent border-orange-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/30 to-yellow-500/20 border border-orange-500/40">
                <Star className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-orange-400 uppercase tracking-wider font-semibold mb-1">
                  🔥 #1 Trending Flavor
                </p>
                <h3 className="text-2xl font-bold text-white capitalize">{topFlavor.text}</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-orange-400">{topFlavor.value}</p>
              <p className="text-xs text-slate-500">mentions</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Word Cloud Section - ENHANCED */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/20 border border-orange-500/40">
                <IceCream className="w-6 h-6 text-orange-400" />
              </div>
              <span>Flavor Trends</span>
            </h3>
            {/* Stats badges */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-3.5 h-3.5" /> {positiveCount}
              </span>
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                <TrendingDown className="w-3.5 h-3.5" /> {negativeCount}
              </span>
            </div>
          </div>

          {/* Interactive Flavor Tags - BIGGER & MORE BEAUTIFUL */}
          <div className="flex flex-wrap gap-3 justify-center py-6 min-h-[280px] items-center content-center">
            {keywords.map((keyword, index) => {
              const isSelected = selectedKeyword?.text === keyword.text;
              const size = getFontSize(keyword.value);
              const isTop3 = index < 3;
              
              return (
                <motion.button
                  key={keyword.text}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: index * 0.04, 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.12, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedKeyword(isSelected ? null : keyword)}
                  className={`
                    relative px-4 py-2 rounded-xl border-2 cursor-pointer
                    transition-all duration-300 font-semibold
                    ${isSelected 
                      ? 'ring-2 ring-offset-4 ring-offset-slate-900 shadow-xl'
                      : ''
                    }
                    ${isTop3 ? 'shadow-lg' : ''}
                  `}
                  style={{ 
                    fontSize: `${size}px`,
                    color: getSentimentColor(keyword.sentiment),
                    background: `linear-gradient(135deg, ${getSentimentColor(keyword.sentiment)}15, ${getSentimentColor(keyword.sentiment)}08)`,
                    borderColor: `${getSentimentColor(keyword.sentiment)}50`,
                    ringColor: getSentimentColor(keyword.sentiment),
                    boxShadow: isTop3 ? `0 8px 32px -8px ${getSentimentColor(keyword.sentiment)}40` : undefined
                  }}
                >
                  {isTop3 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold bg-orange-500 text-white">
                      {index + 1}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    {getSentimentIcon(keyword.sentiment)}
                    <span className="capitalize">{keyword.text}</span>
                  </span>
                  <span className="ml-2 text-xs opacity-70 font-mono bg-black/20 px-1.5 py-0.5 rounded">
                    {keyword.value}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Selected keyword detail - ENHANCED */}
          <AnimatePresence mode="wait">
            {selectedKeyword && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-4 pt-4 border-t border-slate-700/30"
              >
                <div className={`
                  flex items-start gap-4 p-4 rounded-xl 
                  bg-gradient-to-r ${getSentimentGradient(selectedKeyword.sentiment)}
                  border border-slate-700/30
                `}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${getSentimentColor(selectedKeyword.sentiment)}20` }}>
                    <Info className="w-5 h-5" style={{ color: getSentimentColor(selectedKeyword.sentiment) }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-lg text-white font-bold capitalize">{selectedKeyword.text}</p>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ 
                          backgroundColor: `${getSentimentColor(selectedKeyword.sentiment)}25`,
                          color: getSentimentColor(selectedKeyword.sentiment)
                        }}
                      >
                        {selectedKeyword.sentiment}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      {selectedKeyword.context || `This flavor has ${selectedKeyword.value} mentions across recent market discussions`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: getSentimentColor(selectedKeyword.sentiment) }}>
                      {selectedKeyword.value}
                    </p>
                    <p className="text-xs text-slate-500">mentions</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-5 pt-4 border-t border-slate-700/30">
            <LegendItem icon={<TrendingUp className="w-4 h-4" />} color="#10B981" label="Positive Buzz" />
            <LegendItem icon={<TrendingDown className="w-4 h-4" />} color="#EF4444" label="Needs Attention" />
            <LegendItem icon={<Minus className="w-4 h-4" />} color="#64748B" label="Neutral" />
          </div>
        </motion.div>

        {/* Enhanced Frequency Chart Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 border border-purple-500/40">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <span>Flavor Frequency</span>
            </h3>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-400">{totalMentions}</span>
              <span className="text-xs text-slate-500">total</span>
            </div>
          </div>

          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedKeywords}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                onMouseMove={(e) => {
                  if (e?.activePayload?.[0]) {
                    setHoveredBar(e.activePayload[0].payload.text);
                  }
                }}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <XAxis 
                  type="number" 
                  stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="text" 
                  stroke="#475569"
                  width={100}
                  tick={{ fill: '#e2e8f0', fontSize: 13, fontWeight: 500 }}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.98)', 
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '16px',
                    color: '#f1f5f9',
                    padding: '14px 18px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                  }}
                  formatter={(value) => [`${value} mentions`, 'Count']}
                  labelFormatter={(label) => {
                    const item = sortedKeywords.find(k => k.text === label);
                    return (
                      <span>
                        <strong style={{ fontSize: '14px' }}>{label}</strong>
                        <span style={{ 
                          marginLeft: 8, 
                          color: getSentimentColor(item?.sentiment || 'neutral'),
                          textTransform: 'capitalize',
                          fontSize: '12px'
                        }}>
                          {item?.sentiment}
                        </span>
                      </span>
                    );
                  }}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)', radius: 6 }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 10, 10, 0]}
                  maxBarSize={32}
                  animationDuration={1200}
                >
                  {sortedKeywords.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getSentimentColor(entry.sentiment)}
                      opacity={hoveredBar === entry.text ? 1 : 0.85}
                      style={{ 
                        transition: 'all 0.2s ease',
                        filter: hoveredBar === entry.text ? 'brightness(1.25)' : 'none'
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LegendItem({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <motion.span 
      className="flex items-center gap-2 text-sm text-slate-400 cursor-default"
      whileHover={{ scale: 1.05, color: color }}
    >
      <span style={{ color }}>{icon}</span>
      <span>{label}</span>
    </motion.span>
  );
}
