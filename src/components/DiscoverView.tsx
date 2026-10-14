import React from 'react';
import type { User } from '../types';
import { UserAvatar } from './UserAvatar';
import { UserPlus, UserCheck, MapPin, Link2 } from 'lucide-react';

interface DiscoverViewProps {
  users: User[];
  activeUserId: string;
  onSelectUser: (user: User) => void;
  onToggleFollow: (targetUserId: string) => void;
  onOpenFollowers: (user: User) => void;
  onOpenFollowing: (user: User) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  users,
  activeUserId,
  onSelectUser,
  onToggleFollow,
  onOpenFollowers,
  onOpenFollowing
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Discover Creators</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Explore thoughtful designers, engineers, and storytellers on Pulse.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => {
          const isSelf = user.id === activeUserId;
          return (
            <div
              key={user.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xs transition-colors hover:border-zinc-750"
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={() => onSelectUser(user)}
                  className="flex items-start gap-4 text-left group min-w-0"
                >
                  <UserAvatar src={user.avatar} name={user.name} size="lg" />
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-zinc-100 group-hover:text-white transition-colors">
                      {user.name}
                    </div>
                    <div className="text-xs text-zinc-400">@{user.username}</div>
                    {user.bio && (
                      <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 max-w-xl pt-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </button>

                {!isSelf && (
                  <button
                    onClick={() => onToggleFollow(user.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                      user.isFollowing
                        ? 'bg-zinc-800 hover:bg-rose-950/40 text-zinc-300 hover:text-rose-300 border border-zinc-700/80 hover:border-rose-800/50'
                        : 'bg-zinc-100 hover:bg-white text-zinc-900'
                    }`}
                  >
                    {user.isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Stats & Meta footer */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
                <span className="font-mono tabular-nums text-zinc-300">
                  <strong className="text-zinc-100 font-semibold">{user.postsCount}</strong> posts
                </span>
                <button
                  onClick={() => onOpenFollowers(user)}
                  className="hover:underline font-mono tabular-nums text-zinc-300"
                >
                  <strong className="text-zinc-100 font-semibold">{user.followersCount}</strong> followers
                </button>
                <button
                  onClick={() => onOpenFollowing(user)}
                  className="hover:underline font-mono tabular-nums text-zinc-300"
                >
                  <strong className="text-zinc-100 font-semibold">{user.followingCount}</strong> following
                </button>

                {user.location && (
                  <span className="flex items-center gap-1 text-zinc-500 ml-auto">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.location}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
