import React, { useState, useEffect, useCallback } from 'react';
import type { User, Post, CreatePostPayload, CreateCommentPayload, UpdateProfilePayload } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { CreatePostCard } from './components/CreatePostCard';
import { PostCard } from './components/PostCard';
import { UserProfileView } from './components/UserProfileView';
import { DiscoverView } from './components/DiscoverView';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { UserListModal } from './components/UserListModal';
import { EditProfileModal } from './components/EditProfileModal';
import { Sparkles, Users, TrendingUp, Search, RefreshCw, X } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation & Filtering
  const [currentView, setCurrentView] = useState<'feed' | 'discover' | 'profile' | 'bookmarks'>('feed');
  const [feedFilter, setFeedFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userListModal, setUserListModal] = useState<{
    isOpen: boolean;
    title: string;
    users: User[];
  }>({
    isOpen: false,
    title: '',
    users: []
  });

  // Load users & initial active persona
  const fetchUsers = useCallback(async (activeId?: string) => {
    try {
      const fetched = await api.getUsers(activeId);
      setUsers(fetched);
      if (!activeUser && fetched.length > 0) {
        setActiveUser(fetched[0]);
      } else if (activeId) {
        const current = fetched.find(u => u.id === activeId);
        if (current) setActiveUser(current);
      }
      return fetched;
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message);
      return [];
    }
  }, [activeUser]);

  // Load posts based on current filters
  const fetchPosts = useCallback(async (userId?: string) => {
    try {
      setLoading(true);
      const fetched = await api.getPosts({
        feed: feedFilter,
        tag: selectedTag || undefined,
        search: searchQuery || undefined,
        activeUserId: userId || activeUser?.id
      });
      setPosts(fetched);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [feedFilter, selectedTag, searchQuery, activeUser?.id]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const initialUsers = await fetchUsers();
      if (initialUsers.length > 0) {
        await fetchPosts(initialUsers[0].id);
      }
    };
    init();
  }, []);

  // Refetch posts when filters or active user changes
  useEffect(() => {
    if (activeUser) {
      fetchPosts(activeUser.id);
    }
  }, [feedFilter, selectedTag, searchQuery, activeUser?.id]);

  // Handle Likes
  const handleToggleLike = async (postId: string) => {
    if (!activeUser) return;

    // Optimistic UI update
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          const likesCount = isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
          const likedBy = isLiked
            ? [...p.likedBy, activeUser.id]
            : p.likedBy.filter(id => id !== activeUser.id);
          return { ...p, isLiked, likesCount, likedBy };
        }
        return p;
      })
    );

    try {
      await api.toggleLikePost(postId, activeUser.id);
    } catch (err) {
      console.error('Like toggle failed:', err);
      fetchPosts();
    }
  };

  // Handle Bookmarks
  const handleToggleBookmark = async (postId: string) => {
    if (!activeUser) return;

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isBookmarked = !p.isBookmarked;
          const bookmarkedBy = isBookmarked
            ? [...(p.bookmarkedBy || []), activeUser.id]
            : (p.bookmarkedBy || []).filter(id => id !== activeUser.id);
          return { ...p, isBookmarked, bookmarkedBy };
        }
        return p;
      })
    );

    try {
      await api.toggleBookmarkPost(postId, activeUser.id);
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
      fetchPosts();
    }
  };

  // Handle Create Post
  const handleCreatePost = async (payload: CreatePostPayload) => {
    const newPost = await api.createPost(payload);
    setPosts(prev => [newPost, ...prev]);

    // Update active user post count
    if (activeUser) {
      setActiveUser(prev => prev ? { ...prev, postsCount: prev.postsCount + 1 } : null);
      setUsers(prev =>
        prev.map(u => u.id === activeUser.id ? { ...u, postsCount: u.postsCount + 1 } : u)
      );
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!activeUser) return;
    try {
      await api.deletePost(postId, activeUser.id);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setActiveUser(prev => prev ? { ...prev, postsCount: Math.max(0, prev.postsCount - 1) } : null);
      setUsers(prev =>
        prev.map(u => u.id === activeUser.id ? { ...u, postsCount: Math.max(0, u.postsCount - 1) } : u)
      );
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  // Comments
  const handleAddComment = async (postId: string, payload: CreateCommentPayload) => {
    await api.createComment(postId, payload);
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p)
    );
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activeUser) return;
    await api.deleteComment(commentId, activeUser.id);
  };

  const handleLikeComment = async (commentId: string) => {
    if (!activeUser) return;
    await api.toggleLikeComment(commentId, activeUser.id);
  };

  // Handle Follow / Unfollow
  const handleToggleFollow = async (targetUserId: string) => {
    if (!activeUser || activeUser.id === targetUserId) return;

    try {
      const result = await api.toggleFollow(targetUserId, activeUser.id);

      // Update users state
      setUsers(prev =>
        prev.map(u => {
          if (u.id === targetUserId) {
            return {
              ...u,
              isFollowing: result.isFollowing,
              followersCount: result.targetUser.followersCount
            };
          }
          if (u.id === activeUser.id) {
            return {
              ...u,
              followingCount: result.isFollowing
                ? u.followingCount + 1
                : Math.max(0, u.followingCount - 1)
            };
          }
          return u;
        })
      );

      // Update active user state
      setActiveUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          followingCount: result.isFollowing
            ? prev.followingCount + 1
            : Math.max(0, prev.followingCount - 1)
        };
      });

      // Update viewing user if open
      if (viewingUser && viewingUser.id === targetUserId) {
        setViewingUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            isFollowing: result.isFollowing,
            followersCount: result.targetUser.followersCount
          };
        });
      }

      // If in UserListModal, update the user list inside modal
      setUserListModal(prev => ({
        ...prev,
        users: prev.users.map(u =>
          u.id === targetUserId ? { ...u, isFollowing: result.isFollowing } : u
        )
      }));

      // If feed filter is 'following', refresh
      if (feedFilter === 'following') {
        fetchPosts(activeUser.id);
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (payload: UpdateProfilePayload) => {
    if (!activeUser) return;
    const updated = await api.updateUser(activeUser.id, payload);
    setActiveUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (viewingUser?.id === updated.id) {
      setViewingUser(updated);
    }
  };

  // Switch Active Account
  const handleSelectActiveUser = (user: User) => {
    setActiveUser(user);
    fetchUsers(user.id);
    fetchPosts(user.id);
  };

  // Create new Persona
  const handleCreatePersona = async (payload: { username: string; name: string; bio?: string }) => {
    const created = await api.createUser(payload);
    setUsers(prev => [...prev, created]);
    setActiveUser(created);
    fetchPosts(created.id);
  };

  // Open User Profile view
  const handleViewUserProfile = async (user: User) => {
    try {
      const refreshedUser = await api.getUser(user.id, activeUser?.id);
      setViewingUser(refreshedUser);
    } catch {
      setViewingUser(user);
    }
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Followers modal
  const handleOpenFollowersModal = async (targetUser: User) => {
    try {
      const list = await api.getFollowers(targetUser.id, activeUser?.id);
      setUserListModal({
        isOpen: true,
        title: `${targetUser.name}'s Followers`,
        users: list
      });
    } catch (err) {
      console.error('Failed to load followers:', err);
    }
  };

  // Open Following modal
  const handleOpenFollowingModal = async (targetUser: User) => {
    try {
      const list = await api.getFollowing(targetUser.id, activeUser?.id);
      setUserListModal({
        isOpen: true,
        title: `${targetUser.name}'s Following`,
        users: list
      });
    } catch (err) {
      console.error('Failed to load following list:', err);
    }
  };

  // Reset database demo
  const handleResetDemo = async () => {
    if (window.confirm('Reset the social media database to default seed data?')) {
      await api.resetData();
      const freshUsers = await fetchUsers();
      if (freshUsers.length > 0) {
        setActiveUser(freshUsers[0]);
        await fetchPosts(freshUsers[0].id);
      }
      setCurrentView('feed');
      setFeedFilter('all');
      setSelectedTag(null);
      setSearchQuery('');
    }
  };

  // Active view posts
  const filteredPosts = posts.filter(p => {
    if (currentView === 'bookmarks' && activeUser) {
      return (p.bookmarkedBy || []).includes(activeUser.id);
    }
    return true;
  });

  if (!activeUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-zinc-500" />
          <span>Starting Pulse Social...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-zinc-800 selection:text-white">
      {/* Top Bar Contract Navbar */}
      <Navbar
        activeUser={activeUser}
        onOpenNewPost={() => {
          setCurrentView('feed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUserSwitcher={() => setShowUserSwitcher(true)}
        onNavigateHome={() => {
          setCurrentView('feed');
          setViewingUser(null);
          setSelectedTag(null);
        }}
        onNavigateDiscover={() => {
          setCurrentView('discover');
          setViewingUser(null);
        }}
        onNavigateProfile={() => {
          setViewingUser(activeUser);
          setCurrentView('profile');
        }}
        onResetData={handleResetDemo}
        currentView={currentView}
      />

      {/* Main 3-Column Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Sidebar) */}
          <div className="hidden md:block lg:col-span-3">
            <div className="sticky top-22">
              <Sidebar
                activeUser={activeUser}
                feedFilter={feedFilter}
                onSelectFeed={(feed) => {
                  setFeedFilter(feed);
                  setSelectedTag(null);
                }}
                currentView={currentView}
                onNavigateHome={() => {
                  setCurrentView('feed');
                  setViewingUser(null);
                  setSelectedTag(null);
                }}
                onNavigateDiscover={() => {
                  setCurrentView('discover');
                  setViewingUser(null);
                }}
                onNavigateProfile={() => {
                  setViewingUser(activeUser);
                  setCurrentView('profile');
                }}
                onNavigateBookmarks={() => {
                  setCurrentView('bookmarks');
                  setViewingUser(null);
                }}
                onOpenNewPost={() => {
                  setCurrentView('feed');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenUserSwitcher={() => setShowUserSwitcher(true)}
              />
            </div>
          </div>

          {/* Center Column (Feed / Profile / Discover) */}
          <div className="lg:col-span-6">
            {/* Tag or Search filter badge */}
            {(selectedTag || searchQuery) && currentView === 'feed' && (
              <div className="mb-4 flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
                <span className="text-zinc-300">
                  Filtering by:{' '}
                  {selectedTag && <strong className="text-zinc-100">#{selectedTag}</strong>}
                  {selectedTag && searchQuery && ' and '}
                  {searchQuery && <strong className="text-zinc-100">"{searchQuery}"</strong>}
                </span>
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear filter</span>
                </button>
              </div>
            )}

            {/* Profile View */}
            {currentView === 'profile' && (
              <UserProfileView
                user={viewingUser || activeUser}
                activeUser={activeUser}
                posts={posts}
                onBack={() => {
                  setCurrentView('feed');
                  setViewingUser(null);
                }}
                onToggleFollow={handleToggleFollow}
                onOpenFollowers={handleOpenFollowersModal}
                onOpenFollowing={handleOpenFollowingModal}
                onOpenEditProfile={() => setShowEditProfile(true)}
                onLikePost={handleToggleLike}
                onBookmarkPost={handleToggleBookmark}
                onDeletePost={handleDeletePost}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onLikeComment={handleLikeComment}
                onSelectUser={handleViewUserProfile}
                onSelectTag={(tag) => {
                  setSelectedTag(tag);
                  setCurrentView('feed');
                }}
              />
            )}

            {/* Discover View */}
            {currentView === 'discover' && (
              <DiscoverView
                users={users}
                activeUserId={activeUser.id}
                onSelectUser={handleViewUserProfile}
                onToggleFollow={handleToggleFollow}
                onOpenFollowers={handleOpenFollowersModal}
                onOpenFollowing={handleOpenFollowingModal}
              />
            )}

            {/* Feed View & Bookmarks View */}
            {(currentView === 'feed' || currentView === 'bookmarks') && (
              <div>
                {/* Mobile Feed Tabs Switcher */}
                <div className="md:hidden flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-4">
                  <button
                    onClick={() => {
                      setCurrentView('feed');
                      setFeedFilter('all');
                    }}
                    className={`grow py-2 text-xs font-semibold rounded-lg transition-colors ${
                      currentView === 'feed' && feedFilter === 'all'
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400'
                    }`}
                  >
                    For You
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('feed');
                      setFeedFilter('following');
                    }}
                    className={`grow py-2 text-xs font-semibold rounded-lg transition-colors ${
                      currentView === 'feed' && feedFilter === 'following'
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400'
                    }`}
                  >
                    Following
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('feed');
                      setFeedFilter('trending');
                    }}
                    className={`grow py-2 text-xs font-semibold rounded-lg transition-colors ${
                      currentView === 'feed' && feedFilter === 'trending'
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400'
                    }`}
                  >
                    Trending
                  </button>
                </div>

                {/* Feed header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-zinc-100">
                      {currentView === 'bookmarks'
                        ? 'Saved Posts'
                        : feedFilter === 'following'
                        ? 'Following Feed'
                        : feedFilter === 'trending'
                        ? 'Trending Conversations'
                        : 'Main Feed'}
                    </h2>
                    <span className="text-xs font-mono text-zinc-500 tabular-nums">
                      ({filteredPosts.length})
                    </span>
                  </div>

                  {feedFilter === 'following' && (
                    <span className="text-2xs text-zinc-500">
                      Posts from {activeUser.followingCount} followed creators
                    </span>
                  )}
                </div>

                {/* Composer (only on feed view) */}
                {currentView === 'feed' && (
                  <CreatePostCard
                    activeUser={activeUser}
                    onPostCreated={handleCreatePost}
                  />
                )}

                {/* Posts List */}
                {loading ? (
                  <div className="py-12 flex justify-center text-zinc-500 text-sm">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Loading posts...</span>
                    </div>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400 space-y-3">
                    <p className="text-sm">
                      {currentView === 'bookmarks'
                        ? 'No saved posts yet. Tap the bookmark icon on any post to read it later.'
                        : feedFilter === 'following'
                        ? 'None of the creators you follow have posted yet, or you are not following anyone.'
                        : 'No posts match your search criteria.'}
                    </p>
                    {feedFilter === 'following' && (
                      <button
                        onClick={() => setCurrentView('discover')}
                        className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Discover People to Follow
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        activeUser={activeUser}
                        onLike={handleToggleLike}
                        onBookmark={handleToggleBookmark}
                        onDelete={handleDeletePost}
                        onAddComment={handleAddComment}
                        onDeleteComment={handleDeleteComment}
                        onLikeComment={handleLikeComment}
                        onSelectUser={handleViewUserProfile}
                        onSelectTag={(tag) => setSelectedTag(tag)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column (Search, Who to follow, Trending tags) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-22">
              <RightSidebar
                users={users}
                activeUserId={activeUser.id}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectUser={handleViewUserProfile}
                onToggleFollow={handleToggleFollow}
                onSelectTag={(tag) => {
                  setSelectedTag(tag);
                  setCurrentView('feed');
                }}
                selectedTag={selectedTag}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <UserSwitcherModal
        isOpen={showUserSwitcher}
        onClose={() => setShowUserSwitcher(false)}
        users={users}
        activeUser={activeUser}
        onSelectUser={handleSelectActiveUser}
        onCreateUser={handleCreatePersona}
      />

      <UserListModal
        isOpen={userListModal.isOpen}
        onClose={() => setUserListModal(prev => ({ ...prev, isOpen: false }))}
        title={userListModal.title}
        users={userListModal.users}
        activeUserId={activeUser.id}
        onToggleFollow={handleToggleFollow}
        onSelectUser={handleViewUserProfile}
      />

      {showEditProfile && (
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          user={activeUser}
          onSave={handleUpdateProfile}
        />
      )}
    </div>
  );
}
