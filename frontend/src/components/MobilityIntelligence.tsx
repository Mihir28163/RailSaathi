"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Clock, Users, AlertTriangle, ArrowRight, Search, MapPin } from 'lucide-react';
import { fetchMobilityOptimalRoute } from '../lib/api';

// Helper functions for map coordinates
const getStationX = (station: string): number => {
  const coordinates: { [key: string]: number } = {
    'Churchgate': 50, 'Marine Lines': 60, 'Charni Road': 70, 'Grant Road': 80,
    'Mumbai Central': 90, 'Mahalaxmi': 100, 'Lower Parel': 110, 'Elphinstone Road': 120,
    'Dadar': 130, 'Matunga Road': 140, 'Mahim': 150, 'Matunga': 160,
    'Sion': 170, 'Kurla': 180, 'Vidyavihar': 190, 'Ghatkopar': 200,
    'Andheri': 210, 'Vile Parle': 220, 'Santacruz': 230, 'Khar Road': 240,
    'Borivali': 250, 'Dahisar': 260, 'Mira Road': 270, 'Vasai Road': 280,
    'Nallasopara': 290, 'Chhatrapati Shivaji Terminus': 100, 'Masjid Bunder': 110,
    'Sandhurst Road': 120, 'Parel': 130, 'Currey Road': 140, 'Chinchpokli': 150,
    'Byculla': 160, 'Mazgaon': 170, 'Lalbaug': 180, 'Vashi': 300,
    'Sanpada': 310, 'Nerul': 320, 'Belapur': 330, 'Kharghar': 340,
    'Jogeshwari': 190, 'Goregaon': 180, 'Malad': 170, 'Kandivali': 160,
    'Gorai': 150, 'Vikhroli': 140, 'Kanjurmarg': 130, 'Bhandup': 120,
    'Nahur': 110, 'Mulund': 100, 'Thane': 90, 'Mumbra': 80,
    'Diwa': 70, 'Mansarovar': 60, 'Seawoods': 320, 'Bhiwandi': 50
  };
  return coordinates[station] || 200; // Default to center if not found
};

const getStationY = (station: string): number => {
  const coordinates: { [key: string]: number } = {
    'Churchgate': 100, 'Marine Lines': 90, 'Charni Road': 110, 'Grant Road': 120,
    'Mumbai Central': 80, 'Mahalaxmi': 70, 'Lower Parel': 90, 'Elphinstone Road': 110,
    'Dadar': 130, 'Matunga Road': 150, 'Mahim': 170, 'Matunga': 140,
    'Sion': 120, 'Kurla': 110, 'Vidyavihar': 100, 'Ghatkopar': 90,
    'Andheri': 80, 'Vile Parle': 70, 'Santacruz': 60, 'Khar Road': 50,
    'Borivali': 40, 'Dahisar': 30, 'Mira Road': 20, 'Vasai Road': 10,
    'Nallasopara': 150, 'Chhatrapati Shivaji Terminus': 50, 'Masjid Bunder': 60,
    'Sandhurst Road': 70, 'Parel': 90, 'Currey Road': 110, 'Chinchpokli': 130,
    'Byculla': 150, 'Mazgaon': 170, 'Lalbaug': 190, 'Vashi': 200,
    'Sanpada': 210, 'Nerul': 220, 'Belapur': 230, 'Kharghar': 240,
    'Jogeshwari': 70, 'Goregaon': 60, 'Malad': 50, 'Kandivali': 40,
    'Gorai': 30, 'Vikhroli': 20, 'Kanjurmarg': 10, 'Bhandup': 190,
    'Nahur': 180, 'Mulund': 170, 'Thane': 160, 'Mumbra': 150,
    'Diwa': 140, 'Mansarovar': 130, 'Seawoods': 220, 'Bhiwandi': 110
  };
  return coordinates[station] || 150; // Default to center if not found
};

interface RouteSegment {
  from_station: string;
  to_station: string;
  train_type: string;
  departure_time: string;
  arrival_time: string;
  duration_mins: number;
}

interface MobilityRouteResponse {
  recommended_route: RouteSegment[];
  estimated_travel_time: number;
  crowd_score: number;
  delay_probability: number;
  transfers: number;
  overall_score: number;
}

const MobilityIntelligence: React.FC = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('09:30');
  const [preference, setPreference] = useState<'fastest' | 'comfortable' | 'balanced'>('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MobilityRouteResponse | null>(null);
  const [error, setError] = useState('');

  const allMumbaiStations = [
    'Churchgate', 'Marine Lines', 'Charni Road', 'Grant Road', 'Mumbai Central', 'Mahalaxmi', 'Lower Parel', 'Elphinstone Road', 'Dadar', 'Matunga Road', 'Mahim', 'Matunga', 'Sion', 'Kurla', 'Vidyavihar', 'Ghatkopar', 'Andheri', 'Vile Parle', 'Santacruz', 'Khar Road', 'Borivali', 'Dahisar', 'Mira Road', 'Vasai Road', 'Nallasopara', 'Chhatrapati Shivaji Terminus', 'Masjid Bunder', 'Sandhurst Road', 'Parel', 'Currey Road', 'Chinchpokli', 'Byculla', 'Mazgaon', 'Lalbaug', 'Vashi', 'Sanpada', 'Nerul', 'Belapur', 'Kharghar', 'Jogeshwari', 'Goregaon', 'Malad', 'Kandivali', 'Gorai', 'Vikhroli', 'Kanjurmarg', 'Bhandup', 'Nahur', 'Mulund', 'Thane', 'Mumbra', 'Diwa', 'Mansarovar', 'Seawoods', 'Bhiwandi'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination) {
      setError('Please enter both source and destination stations');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetchMobilityOptimalRoute(source, destination, time, preference);
      if (response) {
        setResult(response);
      } else {
        setError('Unable to find route. Please try different stations.');
      }
    } catch (err) {
      setError('Failed to get route recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Moderate';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">Mobility Intelligence</h2>
        <p className="text-gray-300 text-lg">AI-powered route optimization with multi-objective analysis</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Map className="mr-2" size={24} />
            Route Planner
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Source Station</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Enter source station"
                  list="source-stations"
                />
                <datalist id="source-stations">
                  {allMumbaiStations.map(station => (
                    <option key={station} value={station} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Destination Station</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Enter destination station"
                  list="dest-stations"
                />
                <datalist id="dest-stations">
                  {allMumbaiStations.map(station => (
                    <option key={station} value={station} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Departure Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preference</label>
                <select
                  value={preference}
                  onChange={(e) => setPreference(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="fastest">Fastest</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="balanced">Balanced</option>
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
                  Calculating Route...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2" size={20} />
                  Find Optimal Route
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {result ? (
            <>
              {/* Overall Score */}
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Route Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Overall Score</span>
                    <span className={`font-bold ${getScoreColor(result.overall_score)}`}>
                      {result.overall_score}/100 - {getScoreLabel(result.overall_score)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Travel Time</span>
                    <span className="text-white font-medium">{result.estimated_travel_time} mins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Transfers</span>
                    <span className="text-white font-medium">{result.transfers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <Users className="mr-1" size={16} />
                      Crowd Score
                    </span>
                    <span className="text-white font-medium">{result.crowd_score}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <AlertTriangle className="mr-1" size={16} />
                      Delay Risk
                    </span>
                    <span className="text-white font-medium">{result.delay_probability}%</span>
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Recommended Route</h4>
                <div className="space-y-3">
                  {result.recommended_route.map((segment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${
                          segment.train_type === 'fast' ? 'bg-green-400' : 'bg-yellow-400'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {segment.from_station} → {segment.to_station}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {segment.train_type.toUpperCase()} • {segment.duration_mins} mins
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">{segment.departure_time}</div>
                        <div className="text-gray-400 text-xs">→ {segment.arrival_time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mumbai Map Visualization */}
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Route Map</h4>
                <div className="relative bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-lg p-4 h-64 overflow-hidden">
                  <svg viewBox="0 0 400 300" className="w-full h-full">
                    {/* Mumbai Map Background */}
                    <rect width="400" height="300" fill="url(#mapGradient)" />
                    <defs>
                      <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e3a8a" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                    </defs>
                    
                    {/* Station markers - simplified Mumbai coordinates */}
                    {source && (
                      <g>
                        <circle
                          cx={getStationX(source)}
                          cy={getStationY(source)}
                          r="6"
                          fill="#10b981"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text
                          x={getStationX(source)}
                          y={getStationY(source) - 12}
                          fill="white"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {source}
                        </text>
                        <text
                          x={getStationX(source)}
                          y={getStationY(source) - 24}
                          fill="#10b981"
                          fontSize="8"
                          textAnchor="middle"
                        >
                          SOURCE
                        </text>
                      </g>
                    )}
                    
                    {destination && (
                      <g>
                        <circle
                          cx={getStationX(destination)}
                          cy={getStationY(destination)}
                          r="6"
                          fill="#ef4444"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text
                          x={getStationX(destination)}
                          y={getStationY(destination) - 12}
                          fill="white"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {destination}
                        </text>
                        <text
                          x={getStationX(destination)}
                          y={getStationY(destination) - 24}
                          fill="#ef4444"
                          fontSize="8"
                          textAnchor="middle"
                        >
                          DESTINATION
                        </text>
                      </g>
                    )}
                    
                    {/* Route line */}
                    {source && destination && (
                      <motion.path
                        d={`M ${getStationX(source)} ${getStationY(source)} Q 200 ${(getStationY(source) + getStationY(destination)) / 2} ${getStationX(destination)} ${getStationY(destination)}`}
                        stroke="#fbbf24"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="8,4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    )}
                    
                    {/* Additional visual elements */}
                    <text x="200" y="20" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">
                      Mumbai Railway Network
                    </text>
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">Enter your route details to get AI-powered recommendations</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MobilityIntelligence;
