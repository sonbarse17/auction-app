import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Tournament } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Calendar, Play, LogIn, Gavel, Users, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { EncryptedText } from '../components/EncryptedText';
import FloatingLines from '../components/FloatingLines';

export const LandingPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const { data } = await tournamentApi.list();
      setTournaments(data.filter(t => t.status !== 'cancelled'));
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent text-white';
      case 'draft': return 'bg-secondary text-white';
      case 'completed': return 'bg-gray-400 text-white';
      default: return 'bg-primary text-white';
    }
  };

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const heroItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
              <img src="/icons/trophy.png" alt="Trophy" className="w-6 h-6 md:w-8 md:h-8" loading="eager" decoding="async" />
              <h1 className="text-lg md:text-2xl font-bold text-white">Sports Auction</h1>
            </button>
            <div className="flex gap-3 md:gap-6">
              {isAuthenticated ? (
                <button className="relative text-white text-sm font-semibold pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full" onClick={() => navigate('/organizer')}>
                  Dashboard
                </button>
              ) : (
                <>
                  <button className="relative text-white text-sm font-semibold pb-1 flex items-center after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full" onClick={() => navigate('/login')}>
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                  </button>
                  <button className="relative text-white text-sm font-semibold pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full" onClick={() => navigate('/register')}>
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div 
        className="relative text-white min-h-[600px] pt-20"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black">
          <FloatingLines
            enabledWaves={['middle', 'bottom']}
            lineCount={[8, 12]}
            lineDistance={[8, 6]}
            bendRadius={5.0}
            bendStrength={-0.5}
            interactive={false}
            parallax={false}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">

          
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            variants={heroVariants}
          >
            <motion.h2 className="text-3xl md:text-5xl font-bold mb-12 text-white drop-shadow-lg uppercase" style={{textShadow: '0 4px 8px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)'}} variants={heroItemVariants}>
              Real-Time Player Auctions
            </motion.h2>
            <motion.p className="text-base md:text-xl text-cyan-100 mb-8 mt-6" variants={heroItemVariants}>
              <EncryptedText
                text="Experience the thrill of live sports player auctions. Build your dream team with strategic bidding."
                encryptedClassName="text-purple-300/50"
                revealedClassName="text-cyan-100"
                revealDelayMs={50}
              />
            </motion.p>
            <motion.div className="flex flex-wrap justify-center gap-4 md:gap-8" variants={heroItemVariants}>
              <button className="relative text-white text-base md:text-lg font-semibold pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full" onClick={() => navigate('/login')}>
                Get Started
              </button>
              <button className="relative text-white text-base md:text-lg font-semibold pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full" onClick={() => navigate('/register')}>
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tournaments Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="mb-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">Live & Upcoming Tournaments</h3>
          <p className="text-gray-600">Join exciting auctions and build your winning team</p>
        </div>

        {/* Image for visual separation and engagement */}
        
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map((tournament, i) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="h-full flex flex-col">
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-semibold mb-2">{tournament.name}</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                        {tournament.status.toUpperCase()}
                      </span>
                    </div>
                    <img src="/icons/trophy.png" alt="Trophy" className="w-8 h-8" loading="lazy" decoding="async" />
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{tournament.description}</p>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar size={16} className="mr-2" />
                  {new Date(tournament.start_date).toLocaleDateString()}
                </div>

                {tournament.status === 'active' && (
                  <Button onClick={() => navigate(isAuthenticated ? '/organizer' : '/login')} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    {isAuthenticated ? 'View Auction' : 'Login to Join'}
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-12">
            <img src="/icons/trophy.png" alt="Trophy" className="w-16 h-16 mx-auto mb-4 opacity-40" loading="lazy" decoding="async" />
            <p className="text-gray-600 text-lg">No tournaments available at the moment</p>
          </div>
        )}
      </div>

      {/* Image above the features section */}
      

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div className="text-center" whileHover={{ y: -10 }}>
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="text-primary" size={40} />
              </div>
              <h4 className="text-xl font-semibold mb-2">Real-Time Bidding</h4>
              <p className="text-gray-600">Live WebSocket-based bidding with instant updates</p>
            </motion.div>
            <motion.div className="text-center" whileHover={{ y: -10 }}>
              <div className="bg-accent/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-accent" size={40} />
              </div>
              <h4 className="text-xl font-semibold mb-2">Team Management</h4>
              <p className="text-gray-600">Register teams, manage budgets, and build rosters</p>
            </motion.div>
            <motion.div className="text-center" whileHover={{ y: -10 }}>
              <div className="bg-secondary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="text-secondary" size={40} />
              </div>
              <h4 className="text-xl font-semibold mb-2">Tournament Analytics</h4>
              <p className="text-gray-600">Detailed statistics and auction results</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};