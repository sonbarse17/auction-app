import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, Menu, X, User } from 'lucide-react';

interface LayoutWithSidebarProps {
  children: React.ReactNode;
  links: { label: string; href: string; icon: React.ReactNode }[];
  title: string;
}

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ children, links, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} w-64 md:w-20 md:hover:w-64 flex flex-col`}>
        {/* Logo */}
        <div className="h-[72px] px-4 border-b border-gray-200 flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <img src="/icons/trophy.png" alt="Trophy" className="h-6 w-6" loading="lazy" decoding="async" />
            <span className="font-bold text-lg md:hidden md:group-hover:block">{title}</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 group">
          {links.map((link, idx) => (
            <Link key={idx} to={link.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setSidebarOpen(false)}>
              {link.icon}
              <span className="text-sm font-medium md:hidden md:group-hover:block">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 group">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full">
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium md:hidden md:group-hover:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        {/* Top Bar - Sticky */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-[72px] px-4 md:px-6 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xs md:text-sm font-medium text-gray-700 truncate max-w-[120px] md:max-w-none">{user?.full_name}</span>
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
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
