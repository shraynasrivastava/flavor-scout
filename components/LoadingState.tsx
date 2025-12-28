'use client';

import { motion } from 'framer-motion';

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          className="text-6xl mb-6"
        >
          🍦
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          Scouting Flavors...
        </h2>
        <p className="text-slate-400 mb-6">
          Analyzing social media trends with AI
        </p>
        
        {/* Loading Steps */}
        <div className="space-y-3 text-left max-w-xs mx-auto">
          <LoadingStep text="Fetching Reddit discussions" delay={0} />
          <LoadingStep text="Analyzing flavor mentions" delay={0.5} />
          <LoadingStep text="Generating recommendations" delay={1} />
        </div>
      </motion.div>
    </div>
  );
}

function LoadingStep({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          delay
        }}
        className="w-2 h-2 rounded-full bg-purple-500"
      />
      <span className="text-slate-400 text-sm">{text}</span>
    </motion.div>
  );
}

