import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const getLabel = (path: string) => {
    if (!isNaN(Number(path))) return `#${path}`;
    
    const labels: Record<string, string> = {
      organizer: 'Dashboard',
      'multi-auction': 'Auctions',
      teams: 'Teams',
      players: 'Players',
      admin: 'Admin',
      live: 'Live Auction',
      control: 'Control Panel',
      owner: 'Owner View',
      results: 'Results',
      replay: 'Replay',
      analytics: 'Analytics',
    };
    return labels[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link to="/organizer" className="hover:text-blue-600 transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {pathnames.map((path, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">{getLabel(path)}</span>
            ) : (
              <Link to={to} className="hover:text-blue-600 transition-colors">
                {getLabel(path)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
