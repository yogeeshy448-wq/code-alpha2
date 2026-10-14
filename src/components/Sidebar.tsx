import React from 'react';
import type { User } from '../types';
import { UserAvatar } from './UserAvatar';
import {
  Compass,
  Users,
  Bookmark,
  Sparkles,
  TrendingUp,
  User as UserIcon,
  Plus
} from 'lucide-react';

interface SidebarProps {
  activeUser: User;
  feedFilter: 'all' | 'following' | 'trending';
  onSelectFeed: (feed: 'all' | 'following' | 'trending') => void;
  currentView: string;
  onNavigateHome: () => void;
  onNavigateDiscover: () => void;
  onNavigateProfile: () => void;
  onNavigateBookmarks: () => void;
  onOpenNewPost: () => void;
  onOpenUserSwitcher: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeUser,
  feedFilter,
  onSelectFeed,
  currentView,
  onNavigateHome,
  onNavigateDiscover,
  onNavigateProfile,
  onNavigateBookmarks,
  onOpenNewPost,
  onOpenUserSwitcher
}) => {
  return (
    <aside className="space-y-6">
      {/* Primary Navigation Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-xs space-y-1">
        <button
          onClick={() => {
            onNavigateHome();
            onSelectFeed('all');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            currentView === 'feed' && feedFilter === 'all'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
        >
          <Sparkles className="w-4 h-4 text-zinc-300" />
          <span>For You</span>
        </button>

        <button
          onClick={() => {
            onNavigateHome();
            onSelectFeed('following');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            currentView === 'feed' && feedFilter === 'following'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
        >
          <Users className="w-4 h-4 text-zinc-300" />
          <span>Following Feed</span>
        </button>

        <button
          onClick={() => {
            onNavigateHome();
            onSelectFeed('trending');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            currentView === 'feed' && feedFilter === 'trending'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-zinc-300" />
          <span>Trending</span>
        </button>

        <button
          onClick={onNavigateDiscover}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            currentView === 'discover'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
        >
          <Compass className="w-4 h-4 text-zinc-300" />
          <span>Discover Creators</span>
        </button>

        <button
          onClick={onNavigateBookmarks}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            currentView === 'bookmarks'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
        >
          <Bookmark className="w-4 h-4 text-zinc-300" />
          <span>Saved Posts</span>
        </button>

        <button
          onClick={onNavigateProfile}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            currentView === 'profile'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
          }`}
        >
          <UserIcon className="w-4 h-4 text-zinc-300" />
          <span>My Profile</span>
        </button>
      </div>

      {/* New Post Button */}
      <button
        onClick={onOpenNewPost}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl text-xs font-semibold shadow-xs transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Create Post</span>
      </button>

      {/* Active Persona Switcher Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xs">
        <div className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          Active Persona
        </div>

        <button
          onClick={onNavigateProfile}
          className="flex items-center gap-3 text-left w-full group mb-3"
        >
          <UserAvatar src={activeUser.avatar} name={activeUser.name} size="md" />
          <div className="truncate">
            <div className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
              {activeUser.name}
            </div>
            <div className="text-xs text-zinc-400 truncate">@{activeUser.username}</div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-2 text-center py-2.5 px-3 bg-zinc-850/60 rounded-lg border border-zinc-800/80 mb-3">
          <div>
            <div className="text-xs font-semibold text-zinc-100 font-mono tabular-nums">
              {activeUser.followersCount}
            </div>
            <div className="text-2xs text-zinc-500">Followers</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-100 font-mono tabular-nums">
              {activeUser.followingCount}
            </div>
            <div className="text-2xs text-zinc-500">Following</div>
          </div>
        </div>

        <button
          onClick={onOpenUserSwitcher}
          className="w-full py-2 px-3 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-750 rounded-lg border border-zinc-700/80 transition-colors text-center"
        >
          Switch Account
        </button>
      </div>
    </aside>
  );
};
