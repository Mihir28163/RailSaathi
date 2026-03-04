"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Clock, Map, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import CrowdCoach from '../components/CrowdCoach';
import DelayCoach from '../components/DelayCoach';
import SmartTimeCoach from '../components/SmartTimeCoach';
import SeatCoach from '../components/SeatCoach';
import StressCoach from '../components/StressCoach';

const DEFAULT_BACKGROUND = "https://static.toiimg.com/photo/msid-104951887,width-96,height-65.cms";
const AERIAL_TRAIN_BG = "data:image/jpeg;base64,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";
const COMPARTMENT_BG = "https://mytriphack.com/wp-content/uploads/2018/08/Mumbai-local-train-seats.jpg.webp";
const SEAT_PROBABILITY_BG = "https://c8.alamy.com/comp/DH1KCN/empty-local-train-coach-mumbai-maharashtra-india-asia-DH1KCN.jpg";
const SEAT_PROBABILITY_OLD_BG = "https://miro.medium.com/1*TgAiMo_vAajruQKbdntFEA.jpeg";
const STRESS_INDEX_BG = "https://images.livemint.com/img/2022/09/04/original/Mumbai_local_train_1662254235510.jpg";
const CROWD_DENSITY_BG = "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202506/mumbai-local-train-094434938-16x9_0.jpg?VersionId=u6n8u87hbncXWQssI0XJ7E.r_G.VADe5&size=690:388";
const OPTIMAL_ROUTES_BG = "https://images.pexels.com/photos/4805704/pexels-photo-4805704.jpeg?cs=srgb&dl=pexels-bala-4805704.jpg&fm=jpg";

// Ambient local train sound (placeholder free sound)
const TRAIN_AUDIO_URL = "https://cdn.pixabay.com/download/audio/2022/10/30/audio_510de1fdcd.mp3?filename=train-pass-by-01-122978.mp3";

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const [activeCoach, setActiveCoach] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const coaches = [
    { id: 1, title: 'Commute Profile', icon: Activity, description: 'Personalized route analysis', bg: COMPARTMENT_BG },
    { id: 2, title: 'Optimal Routes', icon: Map, description: 'Multi-objective pathing', bg: OPTIMAL_ROUTES_BG },
    { id: 3, title: 'Seat Probability', icon: Activity, description: 'Likelihood of scoring a seat', bg: SEAT_PROBABILITY_BG },
    { id: 4, title: 'Stress Index', icon: Activity, description: 'Commuter tension analysis', bg: STRESS_INDEX_BG },
    { id: 5, title: 'Crowd Density', icon: Activity, description: 'Live platform crowding', bg: CROWD_DENSITY_BG },
  ];

  // Initialize and manage audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(TRAIN_AUDIO_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
    }

    if (hasEntered && !isMuted) {
      audioRef.current.play().catch(e => console.log("Audio autoplay blocked by browser:", e));
    } else {
      audioRef.current.pause();
    }
  }, [hasEntered, isMuted]);

  // Use a single clear background for both screens
  const currentBg = "https://static.toiimg.com/photo/msid-104951887,width-96,height-65.cms";

  return (
    <main className="relative min-h-screen bg-[#050505] overflow-hidden">
      {/* Dynamic Background with crossfade and subtle motion accents */}
      <AnimatePresence>
        <motion.div
          key={currentBg}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentBg})` }}
          />
          {/* Darkening overlay without blur to keep image crisp */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Animated ambient light streaks */}
          <motion.div
            className="absolute -top-32 -right-24 w-72 h-72 rounded-full bg-amber-500/12"
            animate={{ y: [0, 30, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[-6rem] left-[-4rem] w-80 h-80 rounded-full bg-emerald-400/10"
            animate={{ y: [0, -25, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <motion.div
            key="landing"
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-center max-w-3xl mx-auto px-6 py-10 bg-black/65 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] border border-white/15"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-5 leading-tight drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
                Rail
                <span className="ml-1 bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                  Saathi
                </span>
              </h1>
              <p className="text-base md:text-xl lg:text-2xl text-rail-text/90 tracking-wide font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                Intelligence Behind Every Commute.
              </p>

              <button
                onClick={() => setHasEntered(true)}
                className="group relative inline-flex items-center gap-4 px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/60 rounded-full transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <span className="text-white text-base font-medium tracking-[0.2em] uppercase">Board RailSaathi</span>
                <ArrowRight className="w-5 h-5 text-rail-muted group-hover:text-white transition-colors duration-300" />
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            className="relative z-10 min-h-screen flex flex-col p-6 md:p-12 max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            {/* Header Navigation */}
            <motion.header
              className="flex justify-between items-center mb-16"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500/80 animate-pulse" />
                  <span className="text-sm tracking-[0.2em] text-white/70 uppercase">Mumbai Local Network Active</span>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/50 hover:text-white transition-colors"
                  title="Toggle Ambient Sounds"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    setHasEntered(false);
                    setActiveCoach(null);
                  }}
                  className="text-sm text-white/50 hover:text-white transition-colors uppercase tracking-widest text-xs"
                >
                  Disembark
                </button>
              </div>
            </motion.header>

            <AnimatePresence mode="wait">
              {activeCoach === null ? (
                <motion.div
                  key="coach-selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6 }}
                  className="flex-1 flex flex-col justify-center"
                >
                  <h2 className="text-3xl md:text-5xl font-light mb-12 text-white/90">
                    Choose Your <span className="font-semibold text-white">RailSaathi Module</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {/* Connecting line to simulate train cars */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 -z-10" />

                    {coaches.map((coach, idx) => (
                      <motion.div
                        key={coach.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + (idx * 0.15), duration: 0.8 }}
                        onClick={() => setActiveCoach(coach.id)}
                        className="group cursor-pointer bg-black/40 backdrop-blur-lg border border-white/15 hover:border-amber-400/60 p-8 rounded-3xl transition-all duration-500 hover:-translate-y-3 hover:bg-black/60 relative overflow-hidden flex flex-col justify-between shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
                      >
                        {/* Thematic Background Reveal on Hover */}
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
                          style={{ backgroundImage: `url(${coach.bg})` }}
                        />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110 z-0" />

                        <div className="relative z-10">
                          <coach.icon className="w-8 h-8 text-white/40 mb-6 group-hover:text-white transition-colors duration-500" />
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-xs tracking-[0.2em] text-white/60 uppercase">RailSaathi Module</div>
                          </div>
                          <h3 className="text-xl font-medium text-white/90 mb-3">{coach.title}</h3>
                          <p className="text-sm text-white/50 leading-relaxed font-light">{coach.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="active-coach"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 flex flex-col"
                >
                  <button
                    onClick={() => setActiveCoach(null)}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 w-fit bg-black/60 px-4 py-2 rounded-full border border-white/25"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest">Back to Train</span>
                  </button>

                  <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col shadow-2xl">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-px bg-gradient-to-l from-transparent via-white/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                    <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6 shrink-0">
                      <h2 className="text-3xl font-light text-white uppercase tracking-widest">
                        {coaches.find(c => c.id === activeCoach)?.title}
                      </h2>
                      <div className="text-right">
                        <div className="text-[10px] tracking-[0.2em] uppercase text-[#ffb000] mb-1">Active Module</div>
                        <div className="text-xs tracking-widest uppercase text-white/50">RailSaathi Intelligence</div>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center overflow-y-auto">
                      {activeCoach === 1 && <div className="text-white/50 text-sm tracking-widest uppercase">Commute Profile Engine [In Development]</div>}
                      {activeCoach === 2 && <SmartTimeCoach />} {/* Repurposed optimal routes */}
                      {activeCoach === 3 && <SeatCoach />}
                      {activeCoach === 4 && <StressCoach />}
                      {activeCoach === 5 && <CrowdCoach />}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
