import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-background flex">
      <div 
        className="w-1/2 bg-cover bg-center" 
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1510915362834-b83c749b57a5)' }}
      >
        <div className="h-full w-full bg-primary bg-opacity-70 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white text-center p-12"
          >
            <h2 className="text-4xl font-bold mb-4">Join the Action</h2>
            <p className="text-xl">Bid, win, and build your ultimate team.</p>
          </motion.div>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          <Link to="/" className="absolute top-4 left-4 flex items-center">
            <span className="relative text-black text-sm font-semibold pb-1 flex items-center after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </span>
          </Link>
          <Card>
            <h1 className="text-3xl font-bold text-center mb-6 text-text">
              {isRegister ? 'Create an Account' : 'Welcome Back'}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
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
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
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
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
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
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <button type="submit" className="w-full px-8 py-2 bg-black text-white text-sm rounded-md font-semibold hover:bg-black/[0.8] hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  {isRegister ? 'Register' : 'Login'}
                </button>
              </motion.div>
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

