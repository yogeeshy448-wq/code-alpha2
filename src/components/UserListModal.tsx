import React from 'react';
import type { User } from '../types';
import { UserAvatar } from './UserAvatar';
import { X, UserPlus, UserCheck } from 'lucide-react';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: User[];
  activeUserId: string;
  onToggleFollow: (targetUserId: string) => void;
  onSelectUser: (user: User) => void;
}

export const UserListModal: React.FC<UserListModalProps> = ({
  isOpen,
  onClose,
  title,
  users,
  activeUserId,
  onToggleFollow,
  onSelectUser
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
            <span className="text-xs font-mono text-zinc-400 tabular-nums">({users.length})</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-2 grow">
          {users.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-sm">
              No users found in this list yet.
            </div>
          ) : (
            users.map((user) => {
              const isSelf = user.id === activeUserId;
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-800"
                >
                  <button
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className="flex items-center gap-3 text-left group min-w-0"
                  >
                    <UserAvatar src={user.avatar} name={user.name} size="sm" />
                    <div className="truncate">
                      <div className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">@{user.username}</div>
                    </div>
                  </button>

                  {!isSelf && (
                    <button
                      onClick={() => onToggleFollow(user.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
