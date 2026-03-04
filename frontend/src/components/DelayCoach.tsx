import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { fetchDelayPrediction } from '../lib/api';

export default function DelayCoach() {
    const [loading, setLoading] = useState(true);
    const [probability, setProbability] = useState<number>(10.0);

    useEffect(() => {
        let mounted = true;
        fetchDelayPrediction("Chhatrapati Shivaji Maharaj Terminus", "Fast").then((res) => {
            if (!mounted) return;
            if (res && res.delay_probability !== undefined) {
                setProbability(res.delay_probability);
            }
            setLoading(false);
        });
        return () => { mounted = false; };
    }, []);

    if (loading) return <div className="animate-pulse flex space-x-4">Running ML Inference...</div>;

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-white text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
            >
                <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full" />
                <div className="relative border border-white/10 bg-[#121214]/60 p-16 w-80 h-80 rounded-full backdrop-blur-xl flex flex-col justify-center items-center">
                    <Clock className="w-8 h-8 text-blue-400 mb-6 animate-pulse" />
                    <div className="text-6xl font-light mb-2">{probability}%</div>
                    <h3 className="text-sm font-light tracking-[0.2em] text-rail-muted uppercase">Delay Risk</h3>
                </div>
            </motion.div>
        </div>
    );
}
