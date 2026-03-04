import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { fetchCrowdPrediction } from '../lib/api';

interface CrowdData {
  category: string;
  probability_score: number;
  confidence_interval: number[];
}

export default function CrowdCoach() {
  const [data, setData] = useState<CrowdData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCrowdPrediction("Chhatrapati Shivaji Maharaj Terminus", "Fast").then((res) => {
      if (!mounted) return;
      if (res) {
        setData(res);
      } else {
        // Fallback
        setData({ category: "Medium", probability_score: 0.5, confidence_interval: [40, 60] });
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="animate-pulse flex space-x-4">Loading Data Model...</div>;
  if (!data) return null;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-white text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 bg-red-500/20 blur-[50px] rounded-full" />
        <div className="relative border border-white/10 bg-[#121214]/60 p-12 rounded-[3rem] backdrop-blur-xl flex flex-col items-center">
          <Activity className="w-12 h-12 text-red-400 mb-6" />
          <h3 className="text-xl font-light tracking-widest text-rail-muted uppercase mb-4">Current Density</h3>
          <div className="text-7xl font-light mb-2">{data.category}</div>
          <div className="text-sm tracking-widest text-rail-muted">
            Probability: {(data.probability_score * 100).toFixed(0)}%
          </div>
        </div>
      </motion.div>

      {/* Metrics Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6"
      >
        <div className="flex justify-between text-sm text-rail-muted mb-2 tracking-widest uppercase">
          <span>Confidence Interval</span>
          <span>{data.confidence_interval[0]} - {data.confidence_interval[1]} index</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${data.confidence_interval[0]}% ` }}
            transition={{ duration: 1, delay: 0.6 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
