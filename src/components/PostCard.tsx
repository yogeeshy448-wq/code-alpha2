import React, { useState } from 'react';
import type { Post, Comment, User, CreateCommentPayload } from '../types';
import { UserAvatar } from './UserAvatar';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Trash2,
  Send,
  CornerDownRight,
  Check
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  activeUser: User;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onDelete: (postId: string) => void;
  onAddComment: (postId: string, payload: CreateCommentPayload) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  onSelectUser: (user: User) => void;
  onSelectTag: (tag: string) => void;
  initialComments?: Comment[];
}

function formatTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  activeUser,
  onLike,
  onBookmark,
  onDelete,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onSelectUser,
  onSelectTag,
  initialComments = []
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync initial comments if provided
  React.useEffect(() => {
    if (initialComments.length > 0) {
      setComments(initialComments);
    }
  }, [initialComments]);

  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0) {
      try {
        const res = await fetch(`/api/posts/${post.id}/comments?activeUserId=${activeUser.id}`);
        const data = await res.json();
        if (data.success) {
          setComments(data.comments);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      await onAddComment(post.id, {
        authorId: activeUser.id,
        content: commentInput.trim()
      });

      // Optimistically append comment
      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        postId: post.id,
        authorId: activeUser.id,
        author: activeUser,
        content: commentInput.trim(),
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedBy: [],
        isLiked: false
      };
      setComments(prev => [...prev, newComment]);
      setCommentInput('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteCommentLocal = async (commentId: string) => {
    try {
      await onDeleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const handleLikeCommentLocal = async (commentId: string) => {
    try {
      await onLikeComment(commentId);
      setComments(prev =>
        prev.map(c => {
          if (c.id === commentId) {
            const isCurrentlyLiked = c.isLiked;
            return {
              ...c,
              isLiked: !isCurrentlyLiked,
              likesCount: isCurrentlyLiked ? c.likesCount - 1 : c.likesCount + 1
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAuthor = post.authorId === activeUser.id;

  return (
    <article className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4 shadow-xs transition-colors hover:border-zinc-750">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <button
          onClick={() => onSelectUser(post.author)}
          className="flex items-center gap-3 text-left group min-w-0"
        >
          <UserAvatar src={post.author.avatar} name={post.author.name} size="md" />
          <div className="truncate">
            <div className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
              {post.author.name}
            </div>
            {/* Zero-pill metadata with typographic separator */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="truncate">@{post.author.username}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="shrink-0">{formatTime(post.createdAt)}</span>
            </div>
          </div>
        </button>

        {isAuthor && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="text-sm text-zinc-200 leading-relaxed space-y-2 whitespace-pre-line mb-3">
        {post.content}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTag(tag)}
              className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Media */}
      {post.mediaUrl && (
        <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-950">
          <img
            src={post.mediaUrl}
            alt="Post attachment"
            referrerPolicy="no-referrer"
            className="w-full max-h-96 object-cover object-center"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-zinc-400 text-xs">
        <div className="flex items-center gap-6">
          {/* Like */}
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 transition-colors group ${
              post.isLiked ? 'text-rose-500' : 'hover:text-rose-400'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                post.isLiked ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span className="font-mono tabular-nums">{post.likesCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={handleToggleComments}
            className={`flex items-center gap-1.5 transition-colors hover:text-zinc-200 ${
              showComments ? 'text-zinc-100' : ''
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-mono tabular-nums">{post.commentsCount}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onBookmark(post.id)}
            className={`flex items-center gap-1.5 transition-colors ${
              post.isBookmarked ? 'text-amber-400' : 'hover:text-zinc-200'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${post.isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
            />
          </button>
        </div>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
          title="Share link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-2xs">Copied</span>
            </>
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-zinc-800/60 space-y-3">
          {/* Comments List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2">No comments yet. Start the conversation!</p>
            ) : (
              comments.map((comment) => {
                const isCommentAuthor = comment.authorId === activeUser.id;
                return (
                  <div key={comment.id} className="flex gap-2.5 items-start text-xs">
                    <UserAvatar src={comment.author.avatar} name={comment.author.name} size="xs" />
                    <div className="grow bg-zinc-850/60 rounded-lg p-2.5 border border-zinc-800">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectUser(comment.author)}
                            className="font-semibold text-zinc-200 hover:underline"
                          >
                            {comment.author.name}
                          </button>
                          <span className="text-zinc-500">·</span>
                          <span className="text-zinc-500">{formatTime(comment.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLikeCommentLocal(comment.id)}
                            className={`flex items-center gap-1 transition-colors ${
                              comment.isLiked ? 'text-rose-400' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-rose-400' : ''}`} />
                            {comment.likesCount > 0 && (
                              <span className="font-mono tabular-nums">{comment.likesCount}</span>
                            )}
                          </button>
                          {isCommentAuthor && (
                            <button
                              onClick={() => handleDeleteCommentLocal(comment.id)}
                              className="text-zinc-500 hover:text-rose-400 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-zinc-300 leading-normal">{comment.content}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleCreateComment} className="flex items-center gap-2 pt-1">
            <UserAvatar src={activeUser.avatar} name={activeUser.name} size="xs" />
            <input
              type="text"
              placeholder="Write a thoughtful comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="grow px-3 py-1.5 bg-zinc-800 border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
            />
            <button
              type="submit"
              disabled={!commentInput.trim() || isSubmittingComment}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
            >
              Reply
            </button>
          </form>
        </div>
      )}
    </article>
  );
};
