import React, { useState } from 'react';
import type { User, Post, CreateCommentPayload } from '../types';
import { UserAvatar } from './UserAvatar';
import { PostCard } from './PostCard';
import {
  MapPin,
  Link2,
  Calendar,
  UserCheck,
  UserPlus,
  Edit3,
  ArrowLeft
} from 'lucide-react';

interface UserProfileViewProps {
  user: User;
  activeUser: User;
  posts: Post[];
  onBack: () => void;
  onToggleFollow: (targetUserId: string) => void;
  onOpenFollowers: (user: User) => void;
  onOpenFollowing: (user: User) => void;
  onOpenEditProfile: () => void;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onAddComment: (postId: string, payload: CreateCommentPayload) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  onSelectUser: (user: User) => void;
  onSelectTag: (tag: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  activeUser,
  posts,
  onBack,
  onToggleFollow,
  onOpenFollowers,
  onOpenFollowing,
  onOpenEditProfile,
  onLikePost,
  onBookmarkPost,
  onDeletePost,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onSelectUser,
  onSelectTag
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');

  const isOwnProfile = user.id === activeUser.id;

  // Filter posts according to active tab
  const displayedPosts = posts.filter((p) => {
    if (activeTab === 'posts') {
      return p.authorId === user.id;
    }
    if (activeTab === 'media') {
      return p.authorId === user.id && Boolean(p.mediaUrl);
    }
    if (activeTab === 'likes') {
      return p.likedBy.includes(user.id);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to feed</span>
      </button>

      {/* Profile Card Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-36 sm:h-44 bg-zinc-850 relative overflow-hidden">
          {user.banner ? (
            <img
              src={user.banner}
              alt="Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-800 via-zinc-850 to-zinc-800" />
          )}
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            <div className="ring-4 ring-zinc-900 rounded-full inline-block">
              <UserAvatar
                src={user.avatar}
                name={user.name}
                size="xl"
                className="w-20 h-20 sm:w-24 sm:h-24"
              />
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={onOpenEditProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700/80 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => onToggleFollow(user.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    user.isFollowing
                      ? 'bg-zinc-800 hover:bg-rose-950/40 text-zinc-300 hover:text-rose-300 border border-zinc-700/80 hover:border-rose-800/50'
                      : 'bg-zinc-100 hover:bg-white text-zinc-900'
                  }`}
                >
                  {user.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Name & Handle */}
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{user.name}</h1>
            <p className="text-xs text-zinc-400 mt-0.5">@{user.username}</p>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed max-w-2xl">
              {user.bio}
            </p>
          )}

          {/* Metadata Row: Location, Website, Joined Date (Unboxed, clean) */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs text-zinc-400">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {user.location}
              </span>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-zinc-300 hover:underline"
              >
                <Link2 className="w-3.5 h-3.5 text-zinc-500" />
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1 text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              Joined {user.joinedDate}
            </span>
          </div>

          {/* Followers / Following metrics with tabular numerals */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-zinc-800/80 text-xs">
            <div>
              <span className="font-semibold text-zinc-100 font-mono tabular-nums mr-1">
                {user.postsCount}
              </span>
              <span className="text-zinc-400">Posts</span>
            </div>

            <button
              onClick={() => onOpenFollowers(user)}
              className="hover:underline text-left"
            >
              <span className="font-semibold text-zinc-100 font-mono tabular-nums mr-1">
                {user.followersCount}
              </span>
              <span className="text-zinc-400">Followers</span>
            </button>

            <button
              onClick={() => onOpenFollowing(user)}
              className="hover:underline text-left"
            >
              <span className="font-semibold text-zinc-100 font-mono tabular-nums mr-1">
                {user.followingCount}
              </span>
              <span className="text-zinc-400">Following</span>
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center border-t border-zinc-800 px-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-zinc-100 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'media'
                ? 'border-zinc-100 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Media
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'likes'
                ? 'border-zinc-100 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Liked
          </button>
        </div>
      </div>

      {/* Tabbed Posts List */}
      <div>
        {displayedPosts.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">
            {activeTab === 'posts' && 'No posts published yet.'}
            {activeTab === 'media' && 'No media or photos published yet.'}
            {activeTab === 'likes' && 'No liked posts yet.'}
          </div>
        ) : (
          displayedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              activeUser={activeUser}
              onLike={onLikePost}
              onBookmark={onBookmarkPost}
              onDelete={onDeletePost}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onLikeComment={onLikeComment}
              onSelectUser={onSelectUser}
              onSelectTag={onSelectTag}
            />
          ))
        )}
      </div>
    </div>
  );
};
