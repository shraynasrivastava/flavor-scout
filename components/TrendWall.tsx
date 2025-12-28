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
      return '#6B7280'; // gray-500
  }
};

const getSentimentBg = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-emerald-500/20 border-emerald-500/50';
    case 'negative':
      return 'bg-red-500/20 border-red-500/50';
    default:
      return 'bg-gray-500/20 border-gray-500/50';
  }
};

export default function TrendWall({ keywords }: TrendWallProps) {
  // Sort keywords by value for the chart
  const sortedKeywords = [...keywords].sort((a, b) => b.value - a.value).slice(0, 10);
  
  // Calculate font sizes for word cloud effect (scaled 16px to 48px)
  const maxValue = Math.max(...keywords.map(k => k.value));
  const minValue = Math.min(...keywords.map(k => k.value));
  const getFontSize = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue || 1);
    return 16 + ratio * 32;
  };

  return (
    <div className="space-y-8">
      {/* Word Cloud Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🔥</span> Trending Flavors
        </h3>
        <div className="flex flex-wrap gap-3 justify-center py-4">
          {keywords.map((keyword, index) => (
            <motion.span
              key={keyword.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`px-3 py-1.5 rounded-full border cursor-default transition-transform hover:scale-110 ${getSentimentBg(keyword.sentiment)}`}
              style={{ 
                fontSize: `${getFontSize(keyword.value)}px`,
                color: getSentimentColor(keyword.sentiment)
              }}
            >
              {keyword.text}
              <span className="ml-1 text-xs opacity-70">({keyword.value})</span>
            </motion.span>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            Positive
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            Negative
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span>
            Neutral
          </span>
        </div>
      </motion.div>

      {/* Frequency Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span> Mention Frequency
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedKeywords}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis 
                type="category" 
                dataKey="text" 
                stroke="#94a3b8"
                width={90}
                tick={{ fill: '#e2e8f0', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value) => [`${value} mentions`, 'Count']}
                labelFormatter={(label) => {
                  const item = sortedKeywords.find(k => k.text === label);
                  return item ? `${label} (${item.sentiment})` : label;
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {sortedKeywords.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getSentimentColor(entry.sentiment)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

