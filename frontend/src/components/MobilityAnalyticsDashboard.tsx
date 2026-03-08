"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  crowd_trends: any[];
  delay_patterns: any[];
  peak_hours: any[];
  station_congestion: any[];
}

const MobilityAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    crowd_trends: [],
    delay_patterns: [],
    peak_hours: [],
    station_congestion: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      // Crowd trends over 24 hours
      const crowdTrends = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        crowd_level: Math.sin((i - 6) * Math.PI / 12) * 40 + 50 + Math.random() * 10,
        normal_level: Math.sin((i - 6) * Math.PI / 12) * 30 + 40
      }));

      // Delay patterns by station
      const delayPatterns = [
        { station: 'Dadar', avg_delay: 12, peak_delay: 25, normal_delay: 8 },
        { station: 'Andheri', avg_delay: 10, peak_delay: 20, normal_delay: 6 },
        { station: 'Bandra', avg_delay: 8, peak_delay: 18, normal_delay: 5 },
        { station: 'Borivali', avg_delay: 7, peak_delay: 15, normal_delay: 4 },
        { station: 'Churchgate', avg_delay: 9, peak_delay: 22, normal_delay: 6 }
      ];

      // Peak hours analysis
      const peakHours = [
        { time_range: '6-8 AM', crowd: 45, delays: 5, stress: 30 },
        { time_range: '8-10 AM', crowd: 85, delays: 18, stress: 75 },
        { time_range: '10-12 PM', crowd: 60, delays: 8, stress: 45 },
        { time_range: '5-7 PM', crowd: 80, delays: 15, stress: 70 },
        { time_range: '7-9 PM', crowd: 65, delays: 10, stress: 50 },
        { time_range: '9-11 PM', crowd: 40, delays: 4, stress: 25 }
      ];

      // Station congestion ranking
      const stationCongestion = [
        { station: 'Dadar', congestion_score: 92, daily_trains: 450 },
        { station: 'Andheri', congestion_score: 85, daily_trains: 380 },
        { station: 'Bandra', congestion_score: 78, daily_trains: 320 },
        { station: 'Churchgate', congestion_score: 88, daily_trains: 410 },
        { station: 'Borivali', congestion_score: 72, daily_trains: 290 },
        { station: 'Kurla', congestion_score: 68, daily_trains: 260 }
      ];

      setAnalyticsData({
        crowd_trends: crowdTrends,
        delay_patterns: delayPatterns,
        peak_hours: peakHours,
        station_congestion: stationCongestion
      });
    };

    generateMockData();
  }, []);

  const handleRefreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/20">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">Mobility Analytics Dashboard</h2>
        <p className="text-gray-300 text-lg">Comprehensive insights for railway operations</p>
        <button
          onClick={handleRefreshData}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center mx-auto"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Refreshing...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2" size={16} />
              Refresh Data
            </>
          )}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">78%</span>
          </div>
          <div className="text-gray-300 text-sm">Average Crowd Level</div>
          <div className="text-green-400 text-xs mt-1">↓ 5% from yesterday</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">12min</span>
          </div>
          <div className="text-gray-300 text-sm">Average Delay</div>
          <div className="text-red-400 text-xs mt-1">↑ 2min from yesterday</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">65%</span>
          </div>
          <div className="text-gray-300 text-sm">Seat Availability</div>
          <div className="text-green-400 text-xs mt-1">↑ 8% from yesterday</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <span className="text-2xl font-bold text-white">3</span>
          </div>
          <div className="text-gray-300 text-sm">Active Alerts</div>
          <div className="text-red-400 text-xs mt-1">High priority</div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Crowd Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">24-Hour Crowd Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.crowd_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="crowd_level" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Current Crowd"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="normal_level" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Normal Level"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Delay Patterns */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Station Delay Patterns</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.delay_patterns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="station" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="normal_delay" fill="#10b981" name="Normal Delay" />
              <Bar dataKey="avg_delay" fill="#f59e0b" name="Average Delay" />
              <Bar dataKey="peak_delay" fill="#ef4444" name="Peak Delay" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Peak Hours Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Peak Hours Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.peak_hours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time_range" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="crowd" fill="#3b82f6" name="Crowd Level" />
              <Bar dataKey="delays" fill="#f59e0b" name="Delays" />
              <Bar dataKey="stress" fill="#ef4444" name="Stress Index" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Station Congestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Station Congestion Ranking</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.station_congestion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="station" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="congestion_score" fill="#8b5cf6" name="Congestion Score" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-semibold text-white mb-6">System Health Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
              <span className="text-green-400 font-medium">Operational</span>
            </div>
            <div className="text-gray-300 text-sm">All Systems</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-blue-400 mr-2" />
              <span className="text-blue-400 font-medium">98.5%</span>
            </div>
            <div className="text-gray-300 text-sm">Prediction Accuracy</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-medium">Real-time</span>
            </div>
            <div className="text-gray-300 text-sm">Data Updates</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-purple-400 mr-2" />
              <span className="text-purple-400 font-medium">50+</span>
            </div>
            <div className="text-gray-300 text-sm">Stations Tracked</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MobilityAnalyticsDashboard;
