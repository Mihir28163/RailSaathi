import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { fetchSeatPrediction } from '../lib/api';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes safely
export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function SeatCoach() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const res = await fetchSeatPrediction("Chhatrapati Shivaji Maharaj Terminus", "Fast");
            if (res) setData(res);
            setLoading(false);
        };
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
                <Activity className="w-8 h-8 animate-pulse" />
                <div className="text-sm tracking-widest uppercase">Initializing Probability Models...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-400/80 space-y-4">
                <div className="text-sm tracking-widest uppercase">Connection Lost to ML Service</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-12">
            {/* Target Info */}
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                    <div className="text-xs text-rail-muted tracking-widest uppercase mb-1">Target Station</div>
                    <div className="text-xl text-white font-medium">{data.station}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-rail-muted tracking-widest uppercase mb-1">Update Time</div>
                    <div className="text-xl text-white font-mono">{data.time}</div>
                </div>
            </div>

            {/* Main Metric */}
            <div className="flex flex-col items-center justify-center py-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 1.5 }}
                    className="relative flex items-center justify-center"
                >
                    {/* Outer Ring */}
                    <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="94"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="4"
                                fill="none"
                            />
                            <motion.circle
                                initial={{ strokeDasharray: "0 600" }}
                                animate={{ strokeDasharray: `${(data.seat_probability / 100) * 590} 600` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                cx="96"
                                cy="96"
                                r="94"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                className={cn(
                                    data.seat_probability > 70 ? "text-emerald-400" :
                                        data.seat_probability > 30 ? "text-amber-400" : "text-rose-500"
                                )}
                            />
                        </svg>
                        <div className="text-center">
                            <div className="text-4xl font-light text-white font-mono">
                                {data.seat_probability.toFixed(0)}<span className="text-xl text-white/50">%</span>
                            </div>
                            <div className="text-[10px] tracking-widest uppercase text-rail-muted mt-2">Likelihood</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Stats Board */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/20 p-4 flex flex-col items-center justify-center rounded-xl">
                    <div className="text-xs text-rail-muted tracking-[0.2em] uppercase mb-2">Model Confidence</div>
                    <div className="text-lg text-white font-medium">{data.confidence}</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/20 p-4 flex flex-col items-center justify-center rounded-xl">
                    <div className="text-xs text-rail-muted tracking-[0.2em] uppercase mb-2">Service Type</div>
                    <div className="text-lg text-white font-medium">{data.train_type}</div>
                </div>
            </div>
        </div>
    );
}
