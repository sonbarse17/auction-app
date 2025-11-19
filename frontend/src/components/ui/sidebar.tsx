import React, { createContext, useContext } from 'react';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';

interface SidebarContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within Sidebar');
  return context;
};

export const Sidebar = ({ children, open, setOpen }: { children: React.ReactNode; open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className={cn('flex flex-col h-screen bg-gray-100 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 transition-all duration-300 fixed left-0 top-0 z-40 pointer-events-auto', open ? 'w-64' : 'w-20')}>
        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-4 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-600 z-10 pointer-events-auto"
        >
          <svg className={cn('w-4 h-4 transition-transform', open ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

export const SidebarBody = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn('flex flex-col h-full p-4', className)}>{children}</div>;
};

export const SidebarLink = ({ link }: { link: { label: string; href: string; icon: React.ReactNode } }) => {
  const { open } = useSidebar();
  return (
    <Link to={link.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors pointer-events-auto">
      {link.icon}
      {open && <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{link.label}</span>}
    </Link>
  );
};
