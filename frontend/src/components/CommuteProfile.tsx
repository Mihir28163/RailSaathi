"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Route, Clock, TrendingUp, MessageCircle, Send, X, Users, Train, History as HistoryIcon, Bookmark, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TravelHistory {
  id: string;
  date: string;
  source: string;
  destination: string;
  time: string;
  duration: number;
  crowd_level: number;
}

interface ChatMessage {
  id: string;
  user_id: number | string;
  user_name: string;
  message: string;
  timestamp: string;
  train_id?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  train_id?: string;
  active_users: number;
}

interface SavedStation {
  id: string;
  name: string;
  frequency: number;
  last_visited: string;
}

interface PreferredRoute {
  id: string;
  source: string;
  destination: string;
  preference: string;
  usage_count: number;
}

const CommuteProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'saved' | 'routes' | 'chat'>('history');
  const [isLoading, setIsLoading] = useState(false);
  const [travelHistory, setTravelHistory] = useState<TravelHistory[]>([]);
  const [savedStations, setSavedStations] = useState<SavedStation[]>([]);
  const [preferredRoutes, setPreferredRoutes] = useState<PreferredRoute[]>([]);
  const [stats, setStats] = useState({
    totalJourneys: 0,
    averageCrowdLevel: 0,
    favoriteStation: 'Dadar',
    mostUsedRoute: 'Dadar - Andheri'
  });
  
  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoom | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatRooms] = useState<ChatRoom[]>([
    { id: '1', name: 'WR_FAST_102', train_id: 'WR_FAST_102', active_users: 12 },
    { id: '2', name: 'Dadar-9:30', active_users: 8 },
    { id: '3', name: 'Andheri-Express', active_users: 15 },
    { id: '4', name: 'Harbour Line', active_users: 20 }
  ]);

  useEffect(() => {
    const loadMockData = () => {
      setTimeout(() => {
        setTravelHistory([
          {
            id: '1',
            date: '2024-03-08',
            source: 'Dadar',
            destination: 'Churchgate',
            time: '09:15',
            duration: 25,
            crowd_level: 75
          },
          {
            id: '2',
            date: '2024-03-07',
            source: 'Andheri',
            destination: 'Bandra',
            time: '18:30',
            duration: 15,
            crowd_level: 82
          },
          {
            id: '3',
            date: '2024-03-06',
            source: 'Borivali',
            destination: 'Dadar',
            time: '08:45',
            duration: 35,
            crowd_level: 90
          },
          {
            id: '4',
            date: '2024-03-05',
            source: 'Kurla',
            destination: 'Vashi',
            time: '17:20',
            duration: 28,
            crowd_level: 65
          }
        ]);

        setSavedStations([
          { id: '1', name: 'Dadar', frequency: 45, last_visited: '2024-03-08' },
          { id: '2', name: 'Andheri', frequency: 32, last_visited: '2024-03-07' },
          { id: '3', name: 'Bandra', frequency: 28, last_visited: '2024-03-06' },
          { id: '4', name: 'Churchgate', frequency: 25, last_visited: '2024-03-05' }
        ]);

        setPreferredRoutes([
          {
            id: '1',
            source: 'Dadar',
            destination: 'Churchgate',
            preference: 'Fastest',
            usage_count: 23
          },
          {
            id: '2',
            source: 'Andheri',
            destination: 'Bandra',
            preference: 'Balanced',
            usage_count: 15
          },
          {
            id: '3',
            source: 'Borivali',
            destination: 'Dadar',
            preference: 'Comfortable',
            usage_count: 12
          }
        ]);

        setStats({
          totalJourneys: 4,
          averageCrowdLevel: 78,
          favoriteStation: 'Dadar',
          mostUsedRoute: 'Dadar - Churchgate'
        });

        setChatMessages([
          {
            id: '1',
            user_id: 'user1',
            user_name: 'Rahul',
            message: 'Train is running 10 mins late today',
            timestamp: '09:25',
            train_id: 'WR_FAST_102'
          },
          {
            id: '2',
            user_id: 'user2',
            user_name: 'Priya',
            message: 'Thanks for the update! Taking the 9:45 train instead',
            timestamp: '09:28',
            train_id: 'WR_FAST_102'
          }
        ]);

        setIsLoading(false);
      }, 1000);
    };

    loadMockData();
  }, []);

  const handleSendMessage = () => {
    if (chatMessage.trim() && currentChatRoom) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        user_id: String(user?.id ?? 'current'),
        user_name: user?.email?.split('@')[0] || 'You',
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        train_id: currentChatRoom.train_id
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    }
  };

  const joinChatRoom = (room: ChatRoom) => {
    setCurrentChatRoom(room);
    setIsChatOpen(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Please log in to view your commute profile</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your commute profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">Commute Profile</h2>
        <p className="text-gray-300 text-lg">Your personalized travel insights and preferences</p>
        {user && (
          <p className="text-gray-400 text-sm mt-2">Welcome back, {user.email}</p>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <HistoryIcon className="text-blue-400" size={20} />
            <span className="text-xs text-gray-400">TOTAL</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalJourneys}</div>
          <div className="text-sm text-gray-300">Journeys</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <User className="text-orange-400" size={20} />
            <span className="text-xs text-gray-400">AVERAGE</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.averageCrowdLevel}%</div>
          <div className="text-sm text-gray-300">Crowd Level</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <MapPin className="text-green-400" size={20} />
            <span className="text-xs text-gray-400">FAVORITE</span>
          </div>
          <div className="text-lg font-bold text-white truncate">{stats.favoriteStation}</div>
          <div className="text-sm text-gray-300">Station</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <Route className="text-purple-400" size={20} />
            <span className="text-xs text-gray-400">TOP ROUTE</span>
          </div>
          <div className="text-sm font-bold text-white truncate">{stats.mostUsedRoute}</div>
          <div className="text-sm text-gray-300">Most Used</div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-black/30 backdrop-blur-xl rounded-2xl p-1 border border-white/10">
        {[
          { id: 'history', label: 'Travel History', icon: HistoryIcon },
          { id: 'saved', label: 'Saved Stations', icon: Bookmark },
          { id: 'routes', label: 'Preferred Routes', icon: Route },
          { id: 'chat', label: 'Community Chat', icon: MessageCircle }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon size={18} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Recent Journeys</h3>
            <div className="space-y-4">
              {travelHistory.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <div className="text-white font-medium">{trip.source} → {trip.destination}</div>
                    <div className="text-gray-400 text-sm">{trip.date} • {trip.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">{trip.duration} mins</div>
                    <div className="text-gray-400 text-xs">Crowd: {trip.crowd_level}%</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Saved Stations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedStations.map((station) => (
                <div key={station.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{station.name}</div>
                      <div className="text-gray-400 text-sm">Visited {station.frequency} times</div>
                    </div>
                    <Star className="text-yellow-400" size={20} />
                  </div>
                  <div className="text-gray-500 text-xs mt-2">Last: {station.last_visited}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'routes' && (
          <motion.div
            key="routes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Preferred Routes</h3>
            <div className="space-y-4">
              {preferredRoutes.length > 0 ? (
                preferredRoutes.map((route) => (
                  <div key={route.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1">
                      <div className="text-white font-medium">{route.source} → {route.destination}</div>
                      <div className="text-gray-400 text-sm">Used {route.usage_count} times</div>
                    </div>
                    <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {route.preference}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Route className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No preferred routes yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Community Chat</h3>
            
            {!isChatOpen ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chatRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => joinChatRoom(room)}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Train className="text-blue-400" size={20} />
                        <span className="text-white font-medium">{room.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="text-green-400" size={16} />
                        <span className="text-green-400 text-sm">{room.active_users}</span>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm">Join the conversation</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Train className="text-blue-400" size={20} />
                    <span className="text-white font-medium">{currentChatRoom?.name}</span>
                    <Users className="text-green-400" size={16} />
                    <span className="text-green-400 text-sm">{currentChatRoom?.active_users} online</span>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="h-64 overflow-y-auto space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${String(msg.user_id) === String(user?.id) ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs ${String(msg.user_id) === String(user?.id) ? 'bg-blue-600' : 'bg-white/10'} rounded-lg p-3`}>
                        <div className="text-xs text-gray-300 mb-1">{msg.user_name}</div>
                        <div className="text-white text-sm">{msg.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommuteProfile;
