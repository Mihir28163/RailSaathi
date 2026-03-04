import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Zap, CheckCircle, Clock } from 'lucide-react';
import { fetchRouteOptimization } from '../lib/api';

export default function SmartTimeCoach() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pref, setPref] = useState("balanced"); // fastest, comfortable, balanced

    const fetchRoutes = async (preference: string) => {
        setLoading(true);
        const res = await fetchRouteOptimization("Chhatrapati Shivaji Maharaj Terminus", "Thane", preference);
        if (res) setData(res);
        setLoading(false);
    };

    useEffect(() => {
        fetchRoutes(pref);
    }, [pref]);

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
                <Map className="w-8 h-8 animate-pulse" />
                <div className="text-sm tracking-widest uppercase">Calculating Multi-Objective Paths...</div>
            </div>
        );
    }

    if (!data || !data.recommendations) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-400/80 space-y-4">
                <div className="text-sm tracking-widest uppercase">Routing Engine Offline</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 h-full">
            <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-white/5 pb-4 gap-4">
                <div>
                    <div className="text-xs text-rail-muted tracking-widest uppercase mb-1">Origin → Destination</div>
                    <div className="text-xl text-white font-medium">{data.source} → {data.destination}</div>
                </div>

                {/* Preference Selector */}
                <div className="flex p-1 bg-white/5 border border-white/20 rounded-xl w-fit backdrop-blur-md">
                    {["fastest", "balanced", "comfortable"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPref(p)}
                            className={`px-4 py-2 text-xs uppercase tracking-widest rounded-lg transition-all ${pref === p ? "bg-white/10 text-white font-medium" : "text-white/40 hover:text-white/70"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-12">
                {data.recommendations.map((route: any, idx: number) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-6 rounded-2xl border flex flex-col md:flex-row gap-6 items-center justify-between ${idx === 0 ? 'bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/30' : 'bg-white/5 border-white/20 backdrop-blur-sm'}`}
                    >
                        {/* Left: Score & Type */}
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="text-center shrink-0">
                                <div className={`text-3xl font-light font-mono ${idx === 0 ? 'text-emerald-400' : 'text-white/90'}`}>{route.overall_score}</div>
                                <div className="text-[10px] uppercase tracking-widest text-rail-muted mt-1">Score</div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block" />
                            <div>
                                <div className="text-sm text-rail-muted uppercase tracking-widest">Type</div>
                                <div className="text-lg text-white font-medium flex items-center gap-2">
                                    {route.train_type} Local
                                    {idx === 0 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                </div>
                            </div>
                        </div>

                        {/* Middle: Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full md:w-auto">
                            <div>
                                <div className="text-[10px] text-rail-muted uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Window</div>
                                <div className="text-sm text-white font-mono">{route.departure_time} - {route.arrival_time}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-rail-muted uppercase tracking-widest mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Crowd</div>
                                <div className="text-sm text-white">{route.crowd_category}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-rail-muted uppercase tracking-widest mb-1">Delay Risk</div>
                                <div className="text-sm text-white font-mono">{route.delay_probability}%</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-rail-muted uppercase tracking-widest mb-1">Seat Prob</div>
                                <div className="text-sm text-white font-mono">{route.seat_probability}%</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
