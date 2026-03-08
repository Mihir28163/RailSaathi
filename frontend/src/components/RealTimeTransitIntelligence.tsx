"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface AnomalyData {
  delay_minutes: number;
  is_anomaly: boolean;
  message: string;
  confidence: number;
}

interface TransitAlert {
  id: string;
  station: string;
  train_id: string;
  time: string;
  delay: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

const RealTimeTransitIntelligence: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [alerts, setAlerts] = useState<TransitAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    station: 'Dadar',
    train_id: 'WR_FAST_102',
    scheduled_time: '09:30',
    actual_time: '09:42'
  });

  // Mock live alerts
  useEffect(() => {
    const mockAlerts: TransitAlert[] = [
      {
        id: '1',
        station: 'Dadar',
        train_id: 'WR_FAST_102',
        time: '09:42',
        delay: 12,
        severity: 'medium',
        message: 'Unusual delay pattern detected'
      },
      {
        id: '2',
        station: 'Andheri',
        train_id: 'WR_SLOW_456',
        time: '08:15',
        delay: 25,
        severity: 'high',
        message: 'Major service disruption detected'
      },
      {
        id: '3',
        station: 'Bandra',
        train_id: 'WR_FAST_078',
        time: '18:30',
        delay: 8,
        severity: 'low',
        message: 'Minor delay within normal range'
      }
    ];
    
    setAlerts(mockAlerts);
  }, []);

  const handleTestAnomaly = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const mockAnomaly: AnomalyData = {
        delay_minutes: 12,
        is_anomaly: true,
        message: 'Possible service disruption detected at Dadar',
        confidence: 0.85
      };
      
      setAnomalies([mockAnomaly]);
    } catch (error) {
      console.error('Error detecting anomaly:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-400/20 border-green-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <AlertCircle className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">Real-Time Transit Intelligence</h2>
        <p className="text-gray-300 text-lg">AI-powered anomaly detection for railway disruptions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Anomaly Detection Testing */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <AlertTriangle className="mr-2" size={24} />
            Anomaly Detection Test
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Station</label>
              <input
                type="text"
                value={testData.station}
                onChange={(e) => setTestData({...testData, station: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Enter station name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Train ID</label>
              <input
                type="text"
                value={testData.train_id}
                onChange={(e) => setTestData({...testData, train_id: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Enter train ID"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Time</label>
                <input
                  type="time"
                  value={testData.scheduled_time}
                  onChange={(e) => setTestData({...testData, scheduled_time: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Actual Time</label>
                <input
                  type="time"
                  value={testData.actual_time}
                  onChange={(e) => setTestData({...testData, actual_time: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <button
              onClick={handleTestAnomaly}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Detecting...
                </>
              ) : (
                <>
                  <Activity className="mr-2" size={20} />
                  Detect Anomaly
                </>
              )}
            </button>
          </div>

          {/* Anomaly Result */}
          {anomalies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              {anomalies.map((anomaly, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Delay: {anomaly.delay_minutes} mins</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      anomaly.is_anomaly 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {anomaly.is_anomaly ? 'ANOMALY' : 'NORMAL'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{anomaly.message}</p>
                  <div className="flex items-center text-xs text-gray-400">
                    <TrendingUp className="mr-1" size={12} />
                    Confidence: {(anomaly.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Live Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Clock className="mr-2" size={24} />
            Live Transit Alerts
          </h3>

          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getSeverityIcon(alert.severity)}
                      <span className="ml-2 text-white font-medium capitalize">
                        {alert.severity} Severity
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-white/80 text-sm">
                        <span className="font-medium">{alert.station}</span> • {alert.train_id}
                      </div>
                      <div className="text-white/60 text-xs">
                        {alert.time} • {alert.delay} mins delay
                      </div>
                      <div className="text-white text-sm mt-1">{alert.message}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {alerts.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-300">No transit alerts detected</p>
              <p className="text-gray-400 text-sm mt-1">All systems operating normally</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* System Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-semibold text-white mb-6">System Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">50+</div>
            <div className="text-gray-300 text-sm">Stations Monitored</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">1000</div>
            <div className="text-gray-300 text-sm">Training Samples</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">95%</div>
            <div className="text-gray-300 text-sm">Detection Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">2.5σ</div>
            <div className="text-gray-300 text-sm">Anomaly Threshold</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeTransitIntelligence;
