import type { User, Post, Comment, CreatePostPayload, CreateCommentPayload, UpdateProfilePayload } from '../types';

const BASE_URL = '/api';

export const api = {
  // Users
  async getUsers(activeUserId?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (activeUserId) params.set('activeUserId', activeUserId);
    const res = await fetch(`${BASE_URL}/users?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
    return data.users;
  },

  async getUser(idOrUsername: string, activeUserId?: string): Promise<User> {
    const params = new URLSearchParams();
    if (activeUserId) params.set('activeUserId', activeUserId);
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(idOrUsername)}?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data.user;
  },

  async createUser(payload: { username: string; name: string; bio?: string; avatar?: string; location?: string; website?: string }): Promise<User> {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data.user;
  },

  async updateUser(userId: string, payload: UpdateProfilePayload): Promise<User> {
    const res = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user profile');
    return data.user;
  },

  async toggleFollow(targetUserId: string, followerId: string): Promise<{ isFollowing: boolean; targetUser: User }> {
    const res = await fetch(`${BASE_URL}/users/${targetUserId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle follow');
    return data;
  },

  async getFollowers(userId: string, activeUserId?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (activeUserId) params.set('activeUserId', activeUserId);
    const res = await fetch(`${BASE_URL}/users/${userId}/followers?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch followers');
    return data.followers;
  },

  async getFollowing(userId: string, activeUserId?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (activeUserId) params.set('activeUserId', activeUserId);
    const res = await fetch(`${BASE_URL}/users/${userId}/following?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch following');
    return data.following;
  },

  // Posts
  async getPosts(params?: {
    feed?: 'all' | 'following' | 'trending';
    authorId?: string;
    tag?: string;
    search?: string;
    activeUserId?: string;
  }): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.feed) query.set('feed', params.feed);
    if (params?.authorId) query.set('authorId', params.authorId);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.search) query.set('search', params.search);
    if (params?.activeUserId) query.set('activeUserId', params.activeUserId);

    const res = await fetch(`${BASE_URL}/posts?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch posts');
    return data.posts;
  },

  async getPost(postId: string, activeUserId?: string): Promise<Post> {
    const params = new URLSearchParams();
    if (activeUserId) params.set('activeUserId', activeUserId);
    const res = await fetch(`${BASE_URL}/posts/${postId}?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch post');
    return data.post;
  },

  async createPost(payload: CreatePostPayload): Promise<Post> {
    const res = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create post');
    return data.post;
  },

  async deletePost(postId: string, userId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userId }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete post');
  },

  async toggleLikePost(postId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const res = await fetch(`${BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle like');
    return data;
  },

  async toggleBookmarkPost(postId: string, userId: string): Promise<{ isBookmarked: boolean }> {
    const res = await fetch(`${BASE_URL}/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to bookmark post');
    return data;
  },

  // Comments
  async getComments(postId: string, activeUserId?: string): Promise<Comment[]> {
    const params = new URLSearchParams();
    if (activeUserId) params.set('activeUserId', activeUserId);
    const res = await fetch(`${BASE_URL}/posts/${postId}/comments?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch comments');
    return data.comments;
  },

  async createComment(postId: string, payload: CreateCommentPayload): Promise<Comment> {
    const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to post comment');
    return data.comment;
  },

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userId }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete comment');
  },

  async toggleLikeComment(commentId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const res = await fetch(`${BASE_URL}/comments/${commentId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle like on comment');
    return data;
  },

  async resetData(): Promise<void> {
    const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset data');
  }
};
