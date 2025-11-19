import { LayoutDashboard, Trophy, Users, Shield, Settings, BarChart, Play } from 'lucide-react';

export const getNavigationLinks = (userRoles: string[]) => {
  const isAdmin = userRoles.includes('admin');
  const isOrganizer = userRoles.includes('organizer');
  const isTeamOwner = userRoles.includes('team_owner');

  if (isAdmin) {
    return {
      title: 'Admin Panel',
      links: [
        { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Users', href: '/admin', icon: <Users className="h-5 w-5" /> },
        { label: 'Tournaments', href: '/organizer', icon: <Trophy className="h-5 w-5" /> },
        { label: 'Teams', href: '/team-management', icon: <Users className="h-5 w-5" /> },
        { label: 'Players', href: '/players', icon: <Shield className="h-5 w-5" /> },
        { label: 'Settings', href: '/profile', icon: <Settings className="h-5 w-5" /> },
      ]
    };
  }

  if (isOrganizer) {
    return {
      title: 'Organizer',
      links: [
        { label: 'Dashboard', href: '/organizer', icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Tournaments', href: '/organizer', icon: <Trophy className="h-5 w-5" /> },
        { label: 'Teams', href: '/team-management', icon: <Users className="h-5 w-5" /> },
        { label: 'Players', href: '/players', icon: <Shield className="h-5 w-5" /> },
        { label: 'Analytics', href: '/multi-auction', icon: <BarChart className="h-5 w-5" /> },
        { label: 'Settings', href: '/profile', icon: <Settings className="h-5 w-5" /> },
      ]
    };
  }

  if (isTeamOwner) {
    return {
      title: 'Team Owner',
      links: [
        { label: 'My Teams', href: '/teams', icon: <Users className="h-5 w-5" /> },
        { label: 'Auctions', href: '/multi-auction', icon: <Play className="h-5 w-5" /> },
        { label: 'Settings', href: '/profile', icon: <Settings className="h-5 w-5" /> },
      ]
    };
  }

  return {
    title: 'Dashboard',
    links: [
      { label: 'Home', href: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    ]
  };
};
