'use client';

import { TrendKeyword } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface TrendWallProps {
  keywords: TrendKeyword[];
}

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return '#10B981'; // emerald-500
    case 'negative':
      return '#EF4444'; // red-500
    default:
      return '#64748B'; // slate-500
  }
};

const getSentimentStyles = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-emerald-500/15 border-emerald-500/40 hover:bg-emerald-500/25 hover:border-emerald-500/60';
    case 'negative':
      return 'bg-red-500/15 border-red-500/40 hover:bg-red-500/25 hover:border-red-500/60';
    default:
      return 'bg-slate-500/15 border-slate-500/40 hover:bg-slate-500/25 hover:border-slate-500/60';
  }
};

export default function TrendWall({ keywords }: TrendWallProps) {
  // Sort keywords by value for the chart
  const sortedKeywords = [...keywords].sort((a, b) => b.value - a.value).slice(0, 12);
  
  // Calculate font sizes for word cloud effect (scaled 14px to 36px)
  const maxValue = Math.max(...keywords.map(k => k.value));
  const minValue = Math.min(...keywords.map(k => k.value));
  const getFontSize = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue || 1);
    return 14 + ratio * 22;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Word Cloud Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <span className="text-2xl">🔥</span> Trending Flavors
        </h3>
        <div className="flex flex-wrap gap-2.5 justify-center py-4 min-h-[200px] items-center">
          {keywords.map((keyword, index) => (
            <motion.span
              key={keyword.text}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.03, 
                duration: 0.4,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ scale: 1.1, y: -2 }}
              className={`
                px-3 py-1.5 rounded-full border cursor-default 
                transition-all duration-200 
                ${getSentimentStyles(keyword.sentiment)}
              `}
              style={{ 
                fontSize: `${getFontSize(keyword.value)}px`,
                color: getSentimentColor(keyword.sentiment)
              }}
            >
              {keyword.text}
              <span className="ml-1.5 text-[10px] opacity-60 font-mono">
                {keyword.value}
              </span>
            </motion.span>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-slate-700/30">
          <LegendItem color="#10B981" label="Positive" />
          <LegendItem color="#EF4444" label="Negative" />
          <LegendItem color="#64748B" label="Neutral" />
        </div>
      </motion.div>

      {/* Frequency Chart Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <span className="text-2xl">📊</span> Mention Frequency
        </h3>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedKeywords}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                stroke="#475569"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                type="category" 
                dataKey="text" 
                stroke="#475569"
                width={100}
                tick={{ fill: '#e2e8f0', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  padding: '12px 16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
                formatter={(value) => [`${value} mentions`, 'Count']}
                labelFormatter={(label) => {
                  const item = sortedKeywords.find(k => k.text === label);
                  const sentiment = item?.sentiment || 'neutral';
                  return `${label} (${sentiment})`;
                }}
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 6, 6, 0]}
                maxBarSize={24}
              >
                {sortedKeywords.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getSentimentColor(entry.sentiment)}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-sm text-slate-400">
      <span 
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
