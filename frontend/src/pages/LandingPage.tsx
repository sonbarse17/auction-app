import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Tournament } from '../types';
import { Button } from '../components/Button';
import { Calendar, Play, LogIn, Gavel, Users, BarChart, CheckCircle, HelpCircle, Mail, Twitter, Linkedin, Github, TrendingUp, Award, Zap, UserPlus, DollarSign, Trophy, ArrowRight, Zap as Lightning, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingLines = lazy(() => import('../components/FloatingLines'));

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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
              <img src="/icons/trophy.png" alt="Trophy" className="w-6 h-6 md:w-8 md:h-8" loading="eager" decoding="async" />
              <h1 className="text-lg md:text-2xl font-bold text-white">Sports Auction</h1>
            </button>
            <div className="flex gap-3 md:gap-4">
              {isAuthenticated ? (
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-all" onClick={() => navigate('/organizer')}>
                  Dashboard
                </button>
              ) : (
                <>
                  <button className="px-4 py-2 text-white text-sm font-semibold hover:bg-white/10 rounded-lg transition-all flex items-center" onClick={() => navigate('/login')}>
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                  </button>
                  <button className="px-4 py-2 bg-white text-black text-sm font-semibold hover:bg-gray-100 rounded-lg transition-all" onClick={() => navigate('/register')}>
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
          <Suspense fallback={null}>
            <FloatingLines
              enabledWaves={['middle', 'bottom']}
              lineCount={[6, 8]}
              lineDistance={[8, 6]}
              bendRadius={5.0}
              bendStrength={-0.5}
              interactive={false}
              parallax={false}
            />
          </Suspense>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            variants={heroVariants}
          >
            <motion.div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6" variants={heroItemVariants}>
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Live Auctions • Real-Time Bidding</span>
            </motion.div>
            
            <motion.h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg uppercase leading-tight" style={{fontFamily: 'Montserrat, sans-serif', textShadow: '0 4px 8px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)'}} variants={heroItemVariants}>
              Real-Time Player Auctions
            </motion.h2>
            
            <motion.p className="text-lg md:text-2xl text-cyan-100 mb-10 max-w-2xl mx-auto" variants={heroItemVariants}>
              Experience the thrill of live sports player auctions. Build your dream team with strategic bidding.
            </motion.p>
            
            <motion.div className="flex flex-wrap justify-center gap-4" variants={heroItemVariants}>
              <Button onClick={() => navigate('/register')} className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                <Play className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button onClick={() => navigate('/login')} variant="secondary" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold">
                Watch Demo
              </Button>
            </motion.div>

            <motion.div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto" variants={heroItemVariants}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <p className="text-3xl md:text-4xl font-bold">10K+</p>
                </div>
                <p className="text-sm text-cyan-200">Active Users</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <p className="text-3xl md:text-4xl font-bold">500+</p>
                </div>
                <p className="text-sm text-cyan-200">Auctions Completed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <p className="text-3xl md:text-4xl font-bold">2K+</p>
                </div>
                <p className="text-sm text-cyan-200">Teams Created</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tournaments Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Live & Upcoming Tournaments</h3>
            <p className="text-gray-600 text-lg">Join exciting auctions and build your winning team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tournaments.map((tournament) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <div className="relative h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                  
                  <div className="relative p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{tournament.name}</h4>
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(tournament.status)} shadow-sm`}>
                          {tournament.status === 'active' && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                          {tournament.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <img src="/icons/trophy.png" alt="Trophy" className="w-7 h-7" loading="lazy" decoding="async" />
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6 line-clamp-2 flex-grow">{tournament.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4 bg-gray-50 rounded-lg px-3 py-2">
                      <Calendar size={16} className="mr-2 text-primary" />
                      <span className="font-medium">{new Date(tournament.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    {tournament.status === 'active' && (
                      <button onClick={() => navigate(isAuthenticated ? '/organizer' : '/login')} className="w-full px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white text-sm rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center group-hover:scale-105">
                        <Play className="w-4 h-4 mr-2" />
                        {isAuthenticated ? 'View Auction' : 'Login to Join'}
                      </button>
                    )}
                    
                    {tournament.status === 'draft' && (
                      <div className="w-full px-6 py-3 bg-gray-100 text-gray-500 text-sm rounded-xl font-semibold text-center">
                        Coming Soon
                      </div>
                    )}
                    
                    {tournament.status === 'completed' && (
                      <div className="w-full px-6 py-3 bg-green-50 text-green-700 text-sm rounded-xl font-semibold text-center flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {tournaments.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <img src="/icons/trophy.png" alt="Trophy" className="w-12 h-12 opacity-50" loading="lazy" decoding="async" />
              </div>
              <h4 className="text-xl font-bold mb-2">No Tournaments Available</h4>
              <p className="text-gray-600">Check back soon for exciting auctions!</p>
            </div>
          )}
        </div>
      </div>

      {/* Image above the features section */}
      

      {/* Features Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Everything you need to run successful player auctions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Lightning className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-bold mb-3">Real-Time Bidding</h4>
                <p className="text-gray-600 leading-relaxed">Live WebSocket-based bidding with instant updates. Experience zero-latency auctions.</p>
              </div>
            </div>
            
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-accent/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-bold mb-3">Team Management</h4>
                <p className="text-gray-600 leading-relaxed">Register teams, manage budgets, and build winning rosters with ease.</p>
              </div>
            </div>
            
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-secondary/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <BarChart className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-bold mb-3">Tournament Analytics</h4>
                <p className="text-gray-600 leading-relaxed">Detailed statistics, insights, and comprehensive auction results.</p>
              </div>
            </div>
            
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-500/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Shield className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-bold mb-3">Secure & Reliable</h4>
                <p className="text-gray-600 leading-relaxed">Bank-grade security with JWT authentication and encrypted data.</p>
              </div>
            </div>
            
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-500/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Clock className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-bold mb-3">Timer System</h4>
                <p className="text-gray-600 leading-relaxed">Redis-powered countdown with automatic player transitions.</p>
              </div>
            </div>
            
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-500/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Gavel className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-bold mb-3">Smart Bidding</h4>
                <p className="text-gray-600 leading-relaxed">Intelligent bid validation and budget tracking in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-16">How It Works</h3>
          <div className="relative">
            <div className="hidden lg:block absolute top-20 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-primary via-accent to-yellow-500" />
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 relative">
              <div className="text-center group flex-1">
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <UserPlus className="text-white" size={56} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-primary">
                    <span className="text-primary font-bold text-xl">1</span>
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-2">Register</h4>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">Create your account and choose your role</p>
              </div>
              
              <ArrowRight className="text-primary hidden lg:block flex-shrink-0" size={40} />
              
              <div className="text-center group flex-1">
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 bg-gradient-to-br from-accent to-green-600 rounded-2xl flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <Users className="text-white" size={56} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-accent">
                    <span className="text-accent font-bold text-xl">2</span>
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-2">Create Team</h4>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">Set up your team with budget and strategy</p>
              </div>
              
              <ArrowRight className="text-accent hidden lg:block flex-shrink-0" size={40} />
              
              <div className="text-center group flex-1">
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 bg-gradient-to-br from-secondary to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <DollarSign className="text-white" size={56} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-secondary">
                    <span className="text-secondary font-bold text-xl">3</span>
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-2">Join Auction</h4>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">Enter live auctions and compete</p>
              </div>
              
              <ArrowRight className="text-secondary hidden lg:block flex-shrink-0" size={40} />
              
              <div className="text-center group flex-1">
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <Trophy className="text-white" size={56} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-500">
                    <span className="text-yellow-600 font-bold text-xl">4</span>
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-2">Bid & Win</h4>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">Place bids and build your dream team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h3>
            <p className="text-gray-600 text-lg">Trusted by teams and organizers worldwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">RK</div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg">Rajesh Kumar</h4>
                  <p className="text-sm text-gray-500">Team Owner</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed italic">"Best auction platform we've used! Real-time bidding is seamless and the interface is intuitive."</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">PS</div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg">Priya Sharma</h4>
                  <p className="text-sm text-gray-500">Organizer</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed italic">"Managing tournaments has never been easier. The analytics dashboard provides great insights."</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">AM</div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg">Amit Mehta</h4>
                  <p className="text-sm text-gray-500">Team Owner</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed italic">"The budget management tools are fantastic. We built our championship team within budget!"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h3>
            <p className="text-gray-600 text-lg">Choose the plan that fits your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 text-center">
              <h4 className="text-2xl font-bold mb-2">Free</h4>
              <p className="text-4xl font-bold text-primary mb-6">₹0</p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />Join auctions as spectator</li>
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />View live bidding</li>
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />Basic analytics</li>
              </ul>
              <button onClick={() => navigate('/register')} className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-xl font-semibold transition-all">Get Started</button>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-primary text-center relative transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-lg">POPULAR</div>
              <h4 className="text-2xl font-bold mb-2 mt-2">Pro</h4>
              <p className="text-4xl font-bold text-primary mb-6">₹999<span className="text-lg text-gray-500">/month</span></p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />Create unlimited teams</li>
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />Participate in auctions</li>
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />Advanced analytics</li>
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />Priority support</li>
              </ul>
              <button onClick={() => navigate('/register')} className="w-full px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white text-sm rounded-xl font-semibold hover:shadow-lg transition-all">Start Free Trial</button>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 text-center">
              <h4 className="text-2xl font-bold mb-2">Enterprise</h4>
              <p className="text-4xl font-bold text-primary mb-6">Custom</p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />Organize tournaments</li>
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />Custom branding</li>
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />API access</li>
                <li className="flex items-center"><CheckCircle size={16} className="text-green-600 mr-2" />Dedicated support</li>
              </ul>
              <button onClick={() => navigate('/register')} className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-xl font-semibold transition-all">Contact Sales</button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h3>
            <p className="text-gray-600 text-lg">Everything you need to know</p>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-start">
                <HelpCircle className="text-primary mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-semibold mb-2">How does the bidding system work?</h4>
                  <p className="text-gray-600">Our real-time bidding system uses WebSocket technology for instant updates. Place bids during live auctions and see results immediately.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-start">
                <HelpCircle className="text-primary mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                  <p className="text-gray-600">We accept all major credit cards, debit cards, UPI, and net banking for seamless transactions.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-start">
                <HelpCircle className="text-primary mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-semibold mb-2">Can I create private auctions?</h4>
                  <p className="text-gray-600">Yes! Enterprise plan users can create private, invite-only auctions with custom rules and settings.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-start">
                <HelpCircle className="text-primary mt-1 mr-3" size={20} />
                <div>
                  <h4 className="font-semibold mb-2">Is there a mobile app available?</h4>
                  <p className="text-gray-600">Our platform is fully responsive and works seamlessly on all devices. Native mobile apps are coming soon!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="relative bg-gradient-to-r from-primary via-blue-600 to-blue-700 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Build Your Dream Team?</h3>
          <p className="text-xl md:text-2xl text-blue-100 mb-10">Join thousands of users creating winning teams through strategic bidding</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/register')} className="px-8 py-4 bg-white text-primary text-lg font-bold rounded-xl hover:bg-gray-100 hover:shadow-2xl transition-all transform hover:scale-105 flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Get Started Free
            </button>
            <button onClick={() => navigate('/login')} className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-bold rounded-xl hover:bg-white/10 transition-all flex items-center">
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/icons/trophy.png" alt="Trophy" className="w-8 h-8" loading="lazy" decoding="async" />
                <h3 className="text-white font-bold text-lg">Sports Auction</h3>
              </div>
              <p className="text-sm">Real-time player auction platform for building championship teams.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/')} className="hover:text-white">Features</button></li>
                <li><button onClick={() => navigate('/')} className="hover:text-white">Pricing</button></li>
                <li><button onClick={() => navigate('/')} className="hover:text-white">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white">About Us</button></li>
                <li><button className="hover:text-white">Contact</button></li>
                <li><button className="hover:text-white">Careers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white">Privacy Policy</button></li>
                <li><button className="hover:text-white">Terms of Service</button></li>
                <li><button className="hover:text-white">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">© 2024 Sports Auction Platform. All rights reserved.</p>
            <div className="flex gap-4">
              <button className="hover:text-white"><Twitter size={20} /></button>
              <button className="hover:text-white"><Linkedin size={20} /></button>
              <button className="hover:text-white"><Github size={20} /></button>
              <button className="hover:text-white"><Mail size={20} /></button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};