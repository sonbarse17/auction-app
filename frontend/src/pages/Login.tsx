import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const SplineScene = lazy(() => import('../components/ui/spline').then(m => ({ default: m.SplineScene })));
const Spotlight = lazy(() => import('../components/ui/spotlight').then(m => ({ default: m.Spotlight })));

interface LoginProps {
  initialState?: 'login' | 'register';
}

export const Login: React.FC<LoginProps> = ({ initialState = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(initialState === 'register');
  const [fullName, setFullName] = useState('');
  
  const { login, register } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isRegister) {
        await register(email, password, fullName);
        addToast('Registration successful! Please login.', 'success');
        setEmail('');
        setPassword('');
        setFullName('');
        setIsRegister(false);
      } else {
        await login(email, password);
        addToast('Login successful!', 'success');
        navigate('/dashboard');
      }
    } catch (err: any) {
      let errorMsg = 'Authentication failed';
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errorMsg = detail.map((e: any) => e.msg || e.message).join(', ');
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        } else {
          errorMsg = JSON.stringify(detail);
        }
      }
      
      addToast(errorMsg, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="hidden md:block md:w-1/2 bg-black/[0.96] relative overflow-hidden">
        <Suspense fallback={null}>
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        </Suspense>
        <div className="h-full flex">
          <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Join the Action
            </h1>
            <p className="mt-4 text-neutral-300 max-w-lg">
              Bid, win, and build your ultimate team with real-time auctions and strategic bidding.
            </p>
          </div>
          <div className="flex-1 relative">
            <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20" />}>
              <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="w-full h-full" />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          <Link to="/" className="absolute -top-8 left-0 flex items-center text-black text-sm font-semibold hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
          <Card>
            <h1 className="text-3xl font-bold text-center mb-6 text-text">
              {isRegister ? 'Create an Account' : 'Welcome Back'}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div>
                <button type="submit" className="w-full px-8 py-2 bg-black text-white text-sm rounded-md font-semibold hover:bg-black/[0.8] hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  {isRegister ? 'Register' : 'Login'}
                </button>
              </div>
            </form>
            
            <p className="text-center mt-4 text-sm">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => setIsRegister(!isRegister)} className="text-primary hover:underline">
                {isRegister ? 'Login' : 'Register'}
              </button>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

