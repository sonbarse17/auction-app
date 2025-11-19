import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Trophy, Users, Settings, LogOut, Gavel, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/organizer', label: 'Dashboard', icon: Home, roles: ['admin', 'organizer'] },
    { path: '/multi-auction', label: 'Auctions', icon: Gavel, roles: ['admin', 'organizer'] },
    { path: '/teams', label: 'Teams', icon: Users, roles: ['admin', 'organizer', 'team_owner'] },
    { path: '/players', label: 'Players', icon: Trophy, roles: ['admin', 'organizer'] },
    { path: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
  ];

  const visibleLinks = navLinks.filter(link => 
    link.roles.some(role => user?.roles.includes(role))
  );

  return (
    <nav className="bg-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/organizer" className="flex items-center space-x-2">
              <Gavel className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">Auction Pro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-primary-dark text-white'
                    : 'text-white hover:bg-primary-light'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-white hover:bg-primary-light rounded-md transition-colors"
            >
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-semibold text-sm">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="font-medium">{user?.email}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-4 top-14 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-text">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-primary rounded text-xs">
                    {user?.roles[0]}
                  </span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-text hover:bg-background"
                >
                  <User className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-white hover:bg-primary-light"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-primary border-t border-primary-dark">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {visibleLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive(path)
                    ? 'bg-primary-dark text-white'
                    : 'text-white hover:bg-primary-light'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-primary-dark px-4 py-3">
            <div className="flex items-center space-x-3 mb-3">
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt={user.full_name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-semibold text-lg">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-sm text-white flex-1">
                <div className="font-medium">{user?.full_name}</div>
                <div className="text-xs text-gray-300 mt-1">{user?.email}</div>
                <span className="inline-block mt-1 px-2 py-1 bg-secondary text-white rounded text-xs">
                  {user?.roles.join(', ')}
                </span>
              </div>
            </div>
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-white hover:bg-primary-light rounded-md mb-2"
            >
              <User className="h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500 rounded-md"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
