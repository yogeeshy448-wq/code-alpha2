import React, { useState } from 'react';
import type { User, CreatePostPayload } from '../types';
import { UserAvatar } from './UserAvatar';
import { Image as ImageIcon, X, Send, Sparkles } from 'lucide-react';

interface CreatePostCardProps {
  activeUser: User;
  onPostCreated: (payload: CreatePostPayload) => Promise<void>;
}

const PRESET_IMAGES = [
  { label: 'Nordic Pavilion', url: '/src/assets/images/post_nordic_architecture_1791972947765.jpg' },
  { label: 'Minimal Workspace', url: '/src/assets/images/post_workspace_setup_1791972949806.jpg' }
];

const SUGGESTED_TAGS = ['architecture', 'design', 'engineering', 'photography', 'minimalism'];

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  activeUser,
  onPostCreated
}) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onPostCreated({
        authorId: activeUser.id,
        content: content.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        tags: selectedTags
      });

      setContent('');
      setMediaUrl('');
      setSelectedTags([]);
      setShowImageInput(false);
    } catch (err: any) {
      setError(err.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      {error && (
        <div className="mb-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <UserAvatar src={activeUser.avatar} name={activeUser.name} size="sm" />
          <div className="grow">
            <textarea
              rows={3}
              placeholder={`What are you building or exploring today, ${activeUser.name.split(' ')[0]}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 border-0 focus:outline-hidden resize-none leading-relaxed"
            />

            {mediaUrl && (
              <div className="relative mt-2 mb-3 rounded-lg overflow-hidden border border-zinc-800 group max-h-64 bg-zinc-950">
                <img
                  src={mediaUrl}
                  alt="Post preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black p-1.5 rounded-full text-zinc-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {showImageInput && !mediaUrl && (
              <div className="mt-2 mb-3 p-3 bg-zinc-850/80 border border-zinc-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Attach Image</span>
                  <button
                    type="button"
                    onClick={() => setShowImageInput(false)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Paste image URL (e.g. /src/assets/images/...)"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
                />

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-2xs text-zinc-500">Presets:</span>
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setMediaUrl(img.url)}
                      className="text-2xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-750 transition-colors"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-3">
              <span className="text-2xs text-zinc-500 mr-1">Tags:</span>
              {SUGGESTED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-2xs px-2 py-0.5 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-zinc-700 text-zinc-100 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200 bg-zinc-850 hover:bg-zinc-800'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    showImageInput || mediaUrl
                      ? 'text-zinc-200 bg-zinc-800'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Photo</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xs font-mono text-zinc-500 tabular-nums">
                  {content.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Posting...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
