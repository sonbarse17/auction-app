import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Trophy, LogOut, Menu, X, User } from 'lucide-react';

interface LayoutWithSidebarProps {
  children: React.ReactNode;
  links: { label: string; href: string; icon: React.ReactNode }[];
  title: string;
}

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ children, links, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        {/* Logo */}
        <div className="h-[72px] px-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">{title}</span>
            </div>
          ) : (
            <Trophy className="h-6 w-6 text-primary mx-auto" />
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link, idx) => (
            <Link
              key={idx}
              to={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {link.icon}
              {sidebarOpen && <span className="text-sm font-medium">{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full">
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Sticky */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-[72px] px-6 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{user?.full_name}</span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={20} />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
