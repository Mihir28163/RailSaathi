"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Server, CheckCircle, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

const dummyCrowdData = [
    { time: '06:00', load: 15 },
    { time: '08:00', load: 65 },
    { time: '10:00', load: 95 },
    { time: '12:00', load: 45 },
    { time: '14:00', load: 35 },
    { time: '16:00', load: 55 },
    { time: '18:00', load: 85 },
    { time: '20:00', load: 60 },
    { time: '22:00', load: 20 },
];

const dummyDelayData = [
    { station: 'CSMT', delay: 12 },
    { station: 'Dadar', delay: 24 },
    { station: 'Thane', delay: 18 },
    { station: 'Andheri', delay: 22 },
    { station: 'Borivali', delay: 15 },
];

export default function AdminDashboard() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex justify-between items-center pb-8 border-b border-white/10">
                    <div>
                        <h1 className="text-3xl font-light mb-2">System <span className="font-medium">Analytics</span></h1>
                        <p className="text-rail-muted text-sm tracking-widest uppercase">RailSaathi Infrastructure Monitor</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">All Systems Operational</span>
                    </div>
                </header>

                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Active Predictions', val: '142.5K', icon: Activity, color: 'text-blue-400' },
                        { label: 'Avg API Latency', val: '84ms', icon: Server, color: 'text-emerald-400' },
                        { label: 'Prophet Accuracy', val: '92.4%', icon: BarChart2, color: 'text-purple-400' },
                        { label: 'XGBoost ROC-AUC', val: '0.88', icon: Clock, color: 'text-orange-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#121214] border border-white/5 p-6 rounded-2xl"
                        >
                            <stat.icon className={`w-6 h-6 mb-4 ${stat.color}`} />
                            <div className="text-3xl font-light mb-1">{stat.val}</div>
                            <div className="text-xs text-rail-muted tracking-widest uppercase">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: Crowd Distribution */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#121214] border border-white/5 p-8 rounded-2xl"
                    >
                        <h3 className="text-sm tracking-widest uppercase text-rail-muted mb-8">Daily Crowd Index Over Time</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dummyCrowdData}>
                                    <defs>
                                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e4e4e7' }}
                                    />
                                    <Area type="monotone" dataKey="load" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Chart 2: Delay Dist */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-[#121214] border border-white/5 p-8 rounded-2xl"
                    >
                        <h3 className="text-sm tracking-widest uppercase text-rail-muted mb-8">Average Delay % by Station</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dummyDelayData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="station" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="delay" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
