"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Armchair, Brain, TrendingUp, Clock, Search } from 'lucide-react';
import { fetchComfortPrediction } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ComfortData {
  crowd_level: number;
  seat_probability: number;
  stress_index: number;
}

interface TimeSeriesData {
  time: string;
  crowd_level: number;
  seat_probability: number;
  stress_index: number;
}

const PredictiveComfortAnalytics: React.FC = () => {
  const [station, setStation] = useState('');
  const [time, setTime] = useState('09:30');
  const [trainType, setTrainType] = useState<'fast' | 'slow'>('fast');
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState<ComfortData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [error, setError] = useState('');

  const allMumbaiStations = [
    'Churchgate', 'Marine Lines', 'Charni Road', 'Grant Road', 'Mumbai Central', 'Mahalaxmi', 'Lower Parel', 'Elphinstone Road', 'Dadar', 'Matunga Road', 'Mahim', 'Matunga', 'Sion', 'Kurla', 'Vidyavihar', 'Ghatkopar', 'Andheri', 'Vile Parle', 'Santacruz', 'Khar Road', 'Borivali', 'Dahisar', 'Mira Road', 'Vasai Road', 'Nallasopara', 'Chhatrapati Shivaji Terminus', 'Masjid Bunder', 'Sandhurst Road', 'Parel', 'Currey Road', 'Chinchpokli', 'Byculla', 'Mazgaon', 'Lalbaug', 'Vashi', 'Sanpada', 'Nerul', 'Belapur', 'Kharghar', 'Jogeshwari', 'Goregaon', 'Malad', 'Kandivali', 'Gorai', 'Vikhroli', 'Kanjurmarg', 'Bhandup', 'Nahur', 'Mulund', 'Thane', 'Mumbra', 'Diwa', 'Mansarovar', 'Seawoods', 'Bhiwandi'
  ];

  const generateTimeSeriesData = (baseData: ComfortData): TimeSeriesData[] => {
    const data: TimeSeriesData[] = [];
    const baseHour = parseInt(time.split(':')[0]);
    
    for (let i = -2; i <= 2; i++) {
      const hour = baseHour + i;
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      
      // Simulate variations around the base prediction
      const variation = Math.sin(i * 0.5) * 10;
      const crowdLevel = Math.max(0, Math.min(100, baseData.crowd_level + variation));
      const seatProbability = Math.max(0, Math.min(100, baseData.seat_probability - variation));
      const stressIndex = Math.max(0, Math.min(100, baseData.stress_index + variation * 0.8));
      
      data.push({
        time: hourStr,
        crowd_level: Math.round(crowdLevel),
        seat_probability: Math.round(seatProbability),
        stress_index: Math.round(stressIndex)
      });
    }
    
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station) {
      setError('Please enter a station name');
      return;
    }

    setIsLoading(true);
    setError('');
    setCurrentData(null);
    setTimeSeriesData([]);

    try {
      const response = await fetchComfortPrediction(station, time, trainType);
      if (response) {
        setCurrentData(response);
        setTimeSeriesData(generateTimeSeriesData(response));
      } else {
        setError('Unable to get comfort predictions. Please try again.');
      }
    } catch (err) {
      setError('Failed to get comfort predictions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricColor = (value: number, inverse: boolean = false) => {
    const adjustedValue = inverse ? 100 - value : value;
    if (adjustedValue >= 70) return '#10b981'; // green
    if (adjustedValue >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getMetricLabel = (value: number, inverse: boolean = false) => {
    const adjustedValue = inverse ? 100 - value : value;
    if (adjustedValue >= 70) return 'Good';
    if (adjustedValue >= 40) return 'Moderate';
    return 'High';
  };

  const radarData = currentData ? [
    { metric: 'Crowd Level', value: currentData.crowd_level, fullMark: 100 },
    { metric: 'Seat Availability', value: 100 - currentData.seat_probability, fullMark: 100 },
    { metric: 'Stress Level', value: currentData.stress_index, fullMark: 100 },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">Predictive Comfort Analytics</h2>
        <p className="text-gray-300 text-lg">Unified comfort predictions using advanced ML algorithms</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Brain className="mr-2" size={24} />
              Comfort Predictor
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Station</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={station}
                    onChange={(e) => setStation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Enter station name"
                    list="stations"
                  />
                  <datalist id="stations">
                    {allMumbaiStations.map(station => (
                      <option key={station} value={station} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Train Type</label>
                  <select
                    value={trainType}
                    onChange={(e) => setTrainType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="fast">Fast</option>
                    <option value="slow">Slow</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2" size={20} />
                    Predict Comfort
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {currentData ? (
            <>
              {/* Current Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="text-blue-400" size={20} />
                    <span className="text-xs text-gray-400">CROWD</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{currentData.crowd_level}%</div>
                  <div className="text-sm" style={{ color: getMetricColor(currentData.crowd_level) }}>
                    {getMetricLabel(currentData.crowd_level)}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Armchair className="text-green-400" size={20} />
                    <span className="text-xs text-gray-400">SEAT</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{currentData.seat_probability}%</div>
                  <div className="text-sm" style={{ color: getMetricColor(currentData.seat_probability, true) }}>
                    {getMetricLabel(currentData.seat_probability, true)}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="text-orange-400" size={20} />
                    <span className="text-xs text-gray-400">STRESS</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{currentData.stress_index}%</div>
                  <div className="text-sm" style={{ color: getMetricColor(currentData.stress_index) }}>
                    {getMetricLabel(currentData.stress_index)}
                  </div>
                </motion.div>
              </div>

              {/* Time Series Chart */}
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Comfort Trends (±2 hours)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="crowd_level" stroke="#3b82f6" strokeWidth={2} name="Crowd Level" />
                    <Line type="monotone" dataKey="seat_probability" stroke="#10b981" strokeWidth={2} name="Seat Probability" />
                    <Line type="monotone" dataKey="stress_index" stroke="#f59e0b" strokeWidth={2} name="Stress Index" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Radar Chart */}
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Comfort Radar</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                    <Radar
                      name="Current"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">Enter station details to get unified comfort predictions</p>
              <p className="text-gray-400 text-sm mt-2">Advanced ML algorithms analyze crowd, seat availability, and stress levels</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PredictiveComfortAnalytics;
