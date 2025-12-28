'use client';

import { motion } from 'framer-motion';

const loadingSteps = [
  { text: 'Connecting to NewsAPI', icon: '🔌' },
  { text: 'Fetching supplement & fitness news', icon: '📡' },
  { text: 'Searching HealthKart, MuscleBlaze articles', icon: '🔍' },
  { text: 'Running AI flavor analysis', icon: '🧠' },
  { text: 'Generating recommendations', icon: '✨' }
];

export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-orange-900/10" />
      <div className="noise-overlay" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-10 max-w-md w-full text-center relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10"
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: 'center center' }}
        />
        
        <div className="relative z-10">
          {/* Animated Logo */}
          <motion.div
            className="relative inline-block mb-8"
          >
            <motion.span
              className="text-7xl block"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🍦
            </motion.span>
            <motion.span
              className="absolute -top-2 -right-2 text-2xl"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Scouting Flavors...
          </motion.h2>
          <motion.p 
            className="text-slate-400 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Analyzing news & industry trends with AI
          </motion.p>
          
          {/* Loading Steps */}
          <div className="space-y-3 text-left">
            {loadingSteps.map((step, index) => (
              <LoadingStep 
                key={index} 
                text={step.text} 
                icon={step.icon}
                delay={index * 0.8} 
                index={index}
              />
            ))}
          </div>
          
          {/* Progress bar */}
          <motion.div 
            className="mt-8 h-1.5 bg-slate-800 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function LoadingStep({ text, icon, delay, index }: { text: string; icon: string; delay: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: [0, 1, 1, 0.5], x: 0 }}
      transition={{ 
        delay, 
        duration: 3,
        repeat: Infinity,
        repeatDelay: loadingSteps.length * 0.8 - 3
      }}
      className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/30"
    >
      <motion.span
        animate={{ 
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          delay: delay + 0.2,
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: loadingSteps.length * 0.8 - 0.5
        }}
        className="text-xl"
      >
        {icon}
      </motion.span>
      <span className="text-slate-300 text-sm">{text}</span>
      <motion.div
        className="ml-auto flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-purple-500"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 0.8,
              repeat: Infinity,
              delay: delay + i * 0.15
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
