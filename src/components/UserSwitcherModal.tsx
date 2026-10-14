import React, { useState } from 'react';
import type { User } from '../types';
import { UserAvatar } from './UserAvatar';
import { Plus, Check, X } from 'lucide-react';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  activeUser: User;
  onSelectUser: (user: User) => void;
  onCreateUser: (payload: { username: string; name: string; bio?: string }) => Promise<void>;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUser,
  onSelectUser,
  onCreateUser
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      setError('Username and Display Name are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onCreateUser({
        username: newUsername.trim(),
        name: newName.trim(),
        bio: newBio.trim() || undefined
      });
      setIsCreating(false);
      setNewUsername('');
      setNewName('');
      setNewBio('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Switch Active Account</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Test social actions (likes, follows, posts) as different users</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!isCreating ? (
            <div className="space-y-3">
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {users.map((u) => {
                  const isActive = u.id === activeUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors border ${
                        isActive
                          ? 'bg-zinc-800/80 border-zinc-600'
                          : 'bg-zinc-900 border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar src={u.avatar} name={u.name} size="sm" />
                        <div>
                          <div className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
                            {u.name}
                            {isActive && (
                              <span className="text-2xs text-emerald-400 font-normal">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400">@{u.username}</div>
                        </div>
                      </div>

                      {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Persona / Account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kai Nygard"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Username Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">@</span>
                  <input
                    type="text"
                    required
                    placeholder="kainygard"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Short Bio (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="A short note about your interests..."
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Persona'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
