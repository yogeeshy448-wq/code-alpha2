import React from 'react';
import type { User } from '../types';
import { UserAvatar } from './UserAvatar';
import { Search, UserPlus, UserCheck, TrendingUp, Hash, Server } from 'lucide-react';

interface RightSidebarProps {
  users: User[];
  activeUserId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectUser: (user: User) => void;
  onToggleFollow: (targetUserId: string) => void;
  onSelectTag: (tag: string) => void;
  selectedTag?: string | null;
}

const TRENDING_TAGS = [
  { tag: 'architecture', count: 18 },
  { tag: 'design', count: 24 },
  { tag: 'systems', count: 14 },
  { tag: 'photography', count: 9 },
  { tag: 'minimalism', count: 12 }
];

export const RightSidebar: React.FC<RightSidebarProps> = ({
  users,
  activeUserId,
  searchQuery,
  onSearchChange,
  onSelectUser,
  onToggleFollow,
  onSelectTag,
  selectedTag
}) => {
  // Filter out the active user for recommendations
  const suggestedUsers = users.filter((u) => u.id !== activeUserId).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
        <input
          type="text"
          placeholder="Search posts or #tags..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-600 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2.5 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Suggested Creators */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Who to Follow
        </h3>

        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectUser(user)}
                className="flex items-center gap-2.5 text-left group min-w-0"
              >
                <UserAvatar src={user.avatar} name={user.name} size="sm" />
                <div className="truncate">
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                    {user.name}
                  </div>
                  <div className="text-2xs text-zinc-500 truncate">@{user.username}</div>
                </div>
              </button>

              <button
                onClick={() => onToggleFollow(user.id)}
                className={`p-1.5 rounded-lg text-xs transition-colors shrink-0 ${
                  user.isFollowing
                    ? 'bg-zinc-800 hover:bg-rose-950/40 text-zinc-300 hover:text-rose-300 border border-zinc-700/80 hover:border-rose-800/50'
                    : 'bg-zinc-100 hover:bg-white text-zinc-900 font-semibold'
                }`}
                title={user.isFollowing ? 'Unfollow' : 'Follow'}
              >
                {user.isFollowing ? (
                  <UserCheck className="w-3.5 h-3.5" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
          <span>Trending Tags</span>
        </div>

        <div className="space-y-2">
          {TRENDING_TAGS.map((item) => {
            const isActive = selectedTag?.toLowerCase() === item.tag.toLowerCase();
            return (
              <button
                key={item.tag}
                onClick={() => onSelectTag(item.tag)}
                className={`w-full flex items-center justify-between text-left p-1.5 rounded-lg text-xs transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-zinc-500" />
                  {item.tag}
                </span>
                <span className="font-mono text-2xs text-zinc-500 tabular-nums">
                  {item.count} posts
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Backend Architecture Badge */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 text-2xs text-zinc-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>Express.js Backend & Database</span>
        </div>
        <p className="text-zinc-500 leading-normal">
          Full REST endpoints for profiles, posts, comments, likes, and followers with persistent storage.
        </p>
      </div>
    </div>
  );
};
