"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Clock, TrendingUp, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';

interface SmartAlert {
  id: string;
  station: string;
  time: string;
  alert_type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
}

interface AlertGeneration {
  alerts: string[];
  severity: string;
  recommendations: string[];
}

const SmartAlertSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    user_id: 1,
    station: 'Dadar',
    time: '09:30'
  });
  const [newAlerts, setNewAlerts] = useState<AlertGeneration | null>(null);

  // Mock initial alerts
  useEffect(() => {
    const mockAlerts: SmartAlert[] = [
      {
        id: '1',
        station: 'Dadar',
        time: '09:30',
        alert_type: 'crowd_prediction',
        message: 'High crowd expected at Dadar around 9:30 AM',
        severity: 'high',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        station: 'Andheri',
        time: '08:15',
        alert_type: 'delay_prediction',
        message: 'Your route may experience delays',
        severity: 'medium',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        station: 'Bandra',
        time: '18:45',
        alert_type: 'seat_availability',
        message: 'Seat probability low',
        severity: 'medium',
        is_read: true,
        created_at: new Date().toISOString()
      }
    ];
    
    setAlerts(mockAlerts);
  }, []);

  const handleGenerateAlerts = async () => {
    setIsLoading(true);
    setNewAlerts(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const mockGeneration: AlertGeneration = {
        alerts: [
          'High crowd expected at Dadar around 9:30',
          'Your route may experience delays',
          'Seat probability low'
        ],
        severity: 'high',
        recommendations: [
          'Recommended alternate train: 9:42 Fast',
          'Consider booking advance tickets',
          'Try earlier trains for better seating'
        ]
      };
      
      setNewAlerts(mockGeneration);
      
      // Add new alerts to the list
      const newSmartAlerts: SmartAlert[] = mockGeneration.alerts.map((alert, index) => ({
        id: Date.now().toString() + index,
        station: testData.station,
        time: testData.time,
        alert_type: 'prediction',
        message: alert,
        severity: mockGeneration.severity as 'low' | 'medium' | 'high',
        is_read: false,
        created_at: new Date().toISOString()
      }));
      
      setAlerts(prev => [...newSmartAlerts, ...prev]);
    } catch (error) {
      console.error('Error generating alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ));
  };

  const handleClearAll = () => {
    setAlerts([]);
    setNewAlerts(null);
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
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">Smart Alert System</h2>
        <p className="text-gray-300 text-lg">Intelligent notifications for your commute</p>
        {unreadCount > 0 && (
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
            <Bell className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-red-400 text-sm font-medium">{unreadCount} unread alerts</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Alert Generation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Bell className="mr-2" size={24} />
            Generate Smart Alerts
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
              <input
                type="time"
                value={testData.time}
                onChange={(e) => setTestData({...testData, time: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <button
              onClick={handleGenerateAlerts}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2" size={20} />
                  Generate Alerts
                </>
              )}
            </button>
          </div>

          {/* Generated Alerts */}
          {newAlerts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <h4 className="text-white font-medium mb-3">Generated Alerts</h4>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${
                newAlerts.severity === 'high' 
                  ? 'bg-red-500/20 text-red-400' 
                  : newAlerts.severity === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {newAlerts.severity.toUpperCase()} SEVERITY
              </div>
              
              <div className="space-y-2 mb-4">
                {newAlerts.alerts.map((alert, index) => (
                  <div key={index} className="text-gray-300 text-sm flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 text-yellow-400 flex-shrink-0" />
                    {alert}
                  </div>
                ))}
              </div>
              
              {newAlerts.recommendations.length > 0 && (
                <div>
                  <h5 className="text-white font-medium mb-2">Recommendations:</h5>
                  <div className="space-y-1">
                    {newAlerts.recommendations.map((rec, index) => (
                      <div key={index} className="text-gray-400 text-sm flex items-start">
                        <TrendingUp className="w-4 h-4 mr-2 mt-0.5 text-blue-400 flex-shrink-0" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Active Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <AlertCircle className="mr-2" size={24} />
              Active Alerts
            </h3>
            {alerts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Clear all alerts"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${
                  !alert.is_read ? 'ring-2 ring-white/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getSeverityIcon(alert.severity)}
                      <span className="ml-2 text-white font-medium capitalize">
                        {alert.severity} Severity
                      </span>
                      {!alert.is_read && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-white/80 text-sm">
                        <span className="font-medium">{alert.station}</span> • {alert.time}
                      </div>
                      <div className="text-white text-sm">{alert.message}</div>
                      <div className="text-white/60 text-xs">
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  {!alert.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="ml-3 text-white/60 hover:text-white transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {alerts.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-300">No active alerts</p>
              <p className="text-gray-400 text-sm mt-1">Generate alerts to see notifications</p>
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
        <h3 className="text-xl font-semibold text-white mb-6">System Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">3+</div>
            <div className="text-gray-300 text-sm">Alert Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">AI</div>
            <div className="text-gray-300 text-sm">Smart Predictions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">Real-time</div>
            <div className="text-gray-300 text-sm">Live Updates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">Personal</div>
            <div className="text-gray-300 text-sm">User-specific</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">Smart</div>
            <div className="text-gray-300 text-sm">Recommendations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-2">Fast</div>
            <div className="text-gray-300 text-sm">Instant Alerts</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SmartAlertSystem;
