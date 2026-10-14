import React from 'react';
import type { User } from '../types';
import { UserAvatar } from './UserAvatar';
import { Plus, Users, RotateCcw } from 'lucide-react';

interface NavbarProps {
  activeUser: User;
  onOpenNewPost: () => void;
  onOpenUserSwitcher: () => void;
  onNavigateHome: () => void;
  onNavigateDiscover: () => void;
  onNavigateProfile: () => void;
  onResetData: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeUser,
  onOpenNewPost,
  onOpenUserSwitcher,
  onNavigateHome,
  onNavigateDiscover,
  onNavigateProfile,
  onResetData,
  currentView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-850">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={onNavigateHome}
          className="text-lg font-bold tracking-tight text-zinc-100 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-left"
        >
          <span className="w-2.5 h-2.5 bg-zinc-100 rounded-sm inline-block" />
          <span>Pulse</span>
        </button>

        {/* Zone 2: Concise navigation links with hover states */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <button
            onClick={onNavigateHome}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'feed' ? 'text-zinc-100 font-semibold' : 'hover:text-zinc-200'
            }`}
          >
            Feed
          </button>
          <button
            onClick={onNavigateDiscover}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'discover' ? 'text-zinc-100 font-semibold' : 'hover:text-zinc-200'
            }`}
          >
            Discover
          </button>
          <button
            onClick={onNavigateProfile}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'profile' ? 'text-zinc-100 font-semibold' : 'hover:text-zinc-200'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={onResetData}
            className="hover:text-zinc-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-zinc-500"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action + Persona quick switch */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewPost}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 rounded-lg hover:bg-white transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Post</span>
          </button>

          {/* Switch persona trigger */}
          <button
            onClick={onOpenUserSwitcher}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-300 transition-colors whitespace-nowrap shrink-0"
            title="Switch Active Persona"
          >
            <UserAvatar src={activeUser.avatar} name={activeUser.name} size="xs" />
            <span className="hidden sm:inline font-medium text-zinc-200 truncate max-w-28">
              {activeUser.name.split(' ')[0]}
            </span>
            <Users className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
