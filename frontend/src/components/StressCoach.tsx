import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { fetchStressIndex } from '../lib/api';

const STRESS_IMAGE_URL = "https://images.livemint.com/img/2022/09/04/original/Mumbai_local_train_1662254235510.jpg";

export default function StressCoach() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const res = await fetchStressIndex("Chhatrapati Shivaji Maharaj Terminus", "Fast");
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
                <div className="text-sm tracking-widest uppercase">Analyzing Stress Factors...</div>
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

    // Determine stress visualizer color
    let stressColor = "rgb(16, 185, 129)"; // Green
    let stressGlow = "rgba(16, 185, 129, 0.2)";

    if (data.stress_score > 75) {
        stressColor = "rgb(239, 68, 68)"; // Red
        stressGlow = "rgba(239, 68, 68, 0.2)";
    } else if (data.stress_score > 40) {
        stressColor = "rgb(245, 158, 11)"; // Amber
        stressGlow = "rgba(245, 158, 11, 0.2)";
    }

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-10">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                    <div className="text-xs text-rail-muted tracking-widest uppercase mb-1">Target Station</div>
                    <div className="text-xl text-white font-medium">{data.station}</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12 py-8">

                {/* Left Side: Score Visualizer */}
                <div className="flex-shrink-0">
                    <motion.div
                        className="w-40 h-40 rounded-full flex flex-col items-center justify-center border border-white/10"
                        animate={{
                            boxShadow: [`0 0 0 0 ${stressGlow}`, `0 0 40px 10px ${stressGlow}`, `0 0 0 0 ${stressGlow}`]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ borderColor: stressColor }}
                    >
                        <div className="text-6xl font-light text-white font-mono" style={{ color: stressColor }}>
                            {data.stress_score.toFixed(0)}
                        </div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-white/40 mt-2">Index</div>
                    </motion.div>
                </div>

                {/* Middle: Readout & Recommendation */}
                <div className="flex-1 w-full space-y-6">
                    <div>
                        <h3 className="text-sm text-rail-muted uppercase tracking-widest mb-3">Model Analysis</h3>
                        <div className="text-2xl text-white/90 font-light leading-relaxed">
                            {data.stress_score > 75 ? "Severe commuter tension detected based on density, delay risk, and weather patterns." :
                                data.stress_score > 40 ? "Moderate stress expected. Standing journey highly probable." :
                                    "Smooth travel conditions expected. Low physical tension."}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h4 className="text-[10px] text-rail-muted uppercase tracking-[0.2em] mb-2 font-semibold">Recommendation</h4>
                        <p className="text-white/80 text-sm leading-relaxed">{data.recommendation}</p>
                    </div>
                </div>

                {/* Right Side: Context Image */}
                <motion.div
                    className="w-full md:w-64 h-48 md:h-56 rounded-3xl overflow-hidden border border-white/15 relative group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${STRESS_IMAGE_URL})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                        <div className="text-[10px] tracking-[0.2em] text-white/70 uppercase">
                            Mumbai Local – Real World Stress
                        </div>
                        <div className="mt-1 h-px w-10 bg-gradient-to-r from-amber-400 to-transparent" />
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
