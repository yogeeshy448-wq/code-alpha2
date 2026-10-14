import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { User, Post, Comment, FollowRecord, UpdateProfilePayload } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

interface DatabaseSchema {
  users: User[];
  posts: Array<Omit<Post, 'author'>>;
  comments: Array<Omit<Comment, 'author'>>;
  followers: FollowRecord[];
}

const DEFAULT_USERS: User[] = [
  {
    id: 'user_alexandra',
    username: 'alexandrachen',
    name: 'Alexandra Chen',
    bio: 'Spatial architecture & minimalist systems designer. Studying timber construction and low-light environments in Copenhagen.',
    avatar: '/src/assets/images/avatar_alexandra_1791972946800.jpg',
    banner: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    location: 'Copenhagen, Denmark',
    website: 'https://alexandrachen.design',
    joinedDate: 'January 2024',
    followersCount: 2,
    followingCount: 1,
    postsCount: 2
  },
  {
    id: 'user_marcus',
    username: 'marcusvance',
    name: 'Marcus Vance',
    bio: 'Compilers, distributed databases, and high-performance Rust pipelines. Mechanical keyboard enthusiast & open source maintainer.',
    avatar: '/src/assets/images/avatar_marcus_1791972949242.jpg',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    location: 'Seattle, WA',
    website: 'https://github.com/marcusvance',
    joinedDate: 'March 2024',
    followersCount: 1,
    followingCount: 2,
    postsCount: 2
  },
  {
    id: 'user_elena',
    username: 'elenarostova',
    name: 'Elena Rostova',
    bio: 'Documentary photographer & visual storyteller. Currently archiving morning light in Kyoto & Hokkaido shrines.',
    avatar: '/src/assets/images/avatar_elena_1791972946931.jpg',
    banner: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    location: 'Kyoto, Japan',
    website: 'https://elenarostova.photo',
    joinedDate: 'February 2024',
    followersCount: 2,
    followingCount: 1,
    postsCount: 1
  }
];

const DEFAULT_POSTS: Array<Omit<Post, 'author'>> = [
  {
    id: 'post_1',
    authorId: 'user_alexandra',
    content: 'Completed our modular forest shelter study in northern Sweden today. The timber envelope breathes with ambient humidity and captures southern light during short arctic winters. Architecture should listen to its terrain before speaking.',
    mediaUrl: '/src/assets/images/post_nordic_architecture_1791972947765.jpg',
    tags: ['architecture', 'design', 'timber', 'nordic'],
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    likesCount: 14,
    commentsCount: 2,
    likedBy: ['user_marcus', 'user_elena'],
    bookmarkedBy: ['user_marcus']
  },
  {
    id: 'post_2',
    authorId: 'user_marcus',
    content: 'Rebuilt our telemetry ingestion pipeline to use zero-copy ring buffers. Benchmarks dropped p99 tail latency from 8.4ms down to 0.9ms on standard commodity hardware. Clean workspaces lead to clean architecture.',
    mediaUrl: '/src/assets/images/post_workspace_setup_1791972949806.jpg',
    tags: ['engineering', 'systems', 'workspace', 'rust'],
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    likesCount: 28,
    commentsCount: 3,
    likedBy: ['user_alexandra', 'user_elena'],
    bookmarkedBy: []
  },
  {
    id: 'post_3',
    authorId: 'user_elena',
    content: 'Dawn fog rolling over the cedar groves near Arashiyama. Silence in the camera viewfinder is the purest feeling in the world. Always shoot manual, always wait for the wind to settle.',
    tags: ['photography', 'japan', 'travel', 'minimalism'],
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
    likesCount: 42,
    commentsCount: 1,
    likedBy: ['user_alexandra'],
    bookmarkedBy: ['user_alexandra']
  },
  {
    id: 'post_4',
    authorId: 'user_alexandra',
    content: 'Thinking about human interface design beyond glass screens: tactile feedback, ambient lighting cues, and mechanical switches that age with patina. What is your favourite physical tool in daily life?',
    tags: ['design', 'hardware', 'interfaces'],
    createdAt: new Date(Date.now() - 1000 * 60 * 2880).toISOString(), // 2 days ago
    likesCount: 19,
    commentsCount: 1,
    likedBy: ['user_marcus'],
    bookmarkedBy: []
  },
  {
    id: 'post_5',
    authorId: 'user_marcus',
    content: 'Unpopular opinion: writing your own lightweight data structure beats pulling in an unmaintained 5MB dependency 95% of the time.',
    tags: ['programming', 'software', 'craft'],
    createdAt: new Date(Date.now() - 1000 * 60 * 4320).toISOString(), // 3 days ago
    likesCount: 56,
    commentsCount: 2,
    likedBy: ['user_elena', 'user_alexandra'],
    bookmarkedBy: []
  }
];

const DEFAULT_COMMENTS: Array<Omit<Comment, 'author'>> = [
  {
    id: 'comment_1',
    postId: 'post_1',
    authorId: 'user_elena',
    content: 'The interplay between the dark vertical timber slats and the morning mist is breathtaking. Will this be published in an editorial monograph?',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    likesCount: 3,
    likedBy: ['user_alexandra']
  },
  {
    id: 'comment_2',
    postId: 'post_1',
    authorId: 'user_marcus',
    content: 'Sublime work Alexandra! The glass orientation toward the south must make a massive difference in passive thermal gain.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    likesCount: 2,
    likedBy: ['user_alexandra']
  },
  {
    id: 'comment_3',
    postId: 'post_2',
    authorId: 'user_alexandra',
    content: 'Sub-millisecond p99 latency is seriously impressive Marcus. Also loving the mechanical keyboard layout on that felt desk mat.',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    likesCount: 4,
    likedBy: ['user_marcus']
  },
  {
    id: 'comment_4',
    postId: 'post_3',
    authorId: 'user_alexandra',
    content: 'You always capture quiet moments with such tenderness Elena.',
    createdAt: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
    likesCount: 1,
    likedBy: ['user_elena']
  }
];

const DEFAULT_FOLLOWERS: FollowRecord[] = [
  { followerId: 'user_marcus', followingId: 'user_alexandra', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
  { followerId: 'user_elena', followingId: 'user_alexandra', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString() },
  { followerId: 'user_alexandra', followingId: 'user_marcus', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
  { followerId: 'user_marcus', followingId: 'user_elena', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { followerId: 'user_alexandra', followingId: 'user_elena', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading database file, resetting to defaults:', err);
    }

    const initial: DatabaseSchema = {
      users: DEFAULT_USERS,
      posts: DEFAULT_POSTS,
      comments: DEFAULT_COMMENTS,
      followers: DEFAULT_FOLLOWERS
    };
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database file:', err);
    }
  }

  public reset(): DatabaseSchema {
    this.data = {
      users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
      posts: JSON.parse(JSON.stringify(DEFAULT_POSTS)),
      comments: JSON.parse(JSON.stringify(DEFAULT_COMMENTS)),
      followers: JSON.parse(JSON.stringify(DEFAULT_FOLLOWERS))
    };
    this.save();
    return this.data;
  }

  // --- Users ---
  public getUsers(activeUserId?: string): User[] {
    return this.data.users.map(u => this.enrichUser(u, activeUserId));
  }

  public getUserById(idOrUsername: string, activeUserId?: string): User | null {
    const raw = this.data.users.find(u => u.id === idOrUsername || u.username.toLowerCase() === idOrUsername.toLowerCase());
    if (!raw) return null;
    return this.enrichUser(raw, activeUserId);
  }

  public updateUser(userId: string, updates: UpdateProfilePayload): User | null {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates
    };
    this.save();
    return this.enrichUser(this.data.users[idx], userId);
  }

  public createUser(user: Partial<User> & { username: string; name: string }): User {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser: User = {
      id,
      username: user.username.trim().replace(/^@/, '').toLowerCase(),
      name: user.name.trim(),
      bio: user.bio || 'Hello, I just joined Pulse Social!',
      avatar: user.avatar || '/src/assets/images/avatar_alexandra_1791972946800.jpg',
      banner: user.banner || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
      location: user.location || '',
      website: user.website || '',
      joinedDate: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()),
      followersCount: 0,
      followingCount: 0,
      postsCount: 0
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  private enrichUser(user: User, activeUserId?: string): User {
    const followers = this.data.followers.filter(f => f.followingId === user.id);
    const following = this.data.followers.filter(f => f.followerId === user.id);
    const posts = this.data.posts.filter(p => p.authorId === user.id);
    const isFollowing = activeUserId
      ? this.data.followers.some(f => f.followerId === activeUserId && f.followingId === user.id)
      : false;

    return {
      ...user,
      followersCount: followers.length,
      followingCount: following.length,
      postsCount: posts.length,
      isFollowing
    };
  }

  // --- Follows ---
  public toggleFollow(followerId: string, followingId: string): { isFollowing: boolean; targetUser: User } {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const existingIndex = this.data.followers.findIndex(
      f => f.followerId === followerId && f.followingId === followingId
    );

    let isFollowing = false;
    if (existingIndex > -1) {
      this.data.followers.splice(existingIndex, 1);
      isFollowing = false;
    } else {
      this.data.followers.push({
        followerId,
        followingId,
        createdAt: new Date().toISOString()
      });
      isFollowing = true;
    }

    this.save();
    const targetUser = this.getUserById(followingId, followerId)!;
    return { isFollowing, targetUser };
  }

  public getFollowers(userId: string, activeUserId?: string): User[] {
    const followerIds = this.data.followers
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);

    return followerIds
      .map(id => this.getUserById(id, activeUserId))
      .filter((u): u is User => u !== null);
  }

  public getFollowing(userId: string, activeUserId?: string): User[] {
    const followingIds = this.data.followers
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);

    return followingIds
      .map(id => this.getUserById(id, activeUserId))
      .filter((u): u is User => u !== null);
  }

  // --- Posts ---
  public getPosts(params: {
    feed?: 'all' | 'following' | 'trending';
    authorId?: string;
    tag?: string;
    search?: string;
    activeUserId?: string;
  }): Post[] {
    const { feed = 'all', authorId, tag, search, activeUserId } = params;

    let filtered = [...this.data.posts];

    if (authorId) {
      filtered = filtered.filter(p => p.authorId === authorId);
    }

    if (tag) {
      const normalizedTag = tag.replace(/^#/, '').toLowerCase();
      filtered = filtered.filter(p => p.tags.some(t => t.toLowerCase() === normalizedTag));
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (feed === 'following' && activeUserId) {
      const followingIds = this.data.followers
        .filter(f => f.followerId === activeUserId)
        .map(f => f.followingId);
      // Include own posts and followed users
      filtered = filtered.filter(p => followingIds.includes(p.authorId) || p.authorId === activeUserId);
    }

    // Sort order
    if (feed === 'trending') {
      filtered.sort((a, b) => (b.likesCount + b.commentsCount * 2) - (a.likesCount + a.commentsCount * 2));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered.map(p => this.enrichPost(p, activeUserId)).filter((p): p is Post => p !== null);
  }

  public getPostById(postId: string, activeUserId?: string): Post | null {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) return null;
    return this.enrichPost(post, activeUserId);
  }

  public createPost(data: {
    authorId: string;
    content: string;
    mediaUrl?: string;
    tags?: string[];
  }): Post {
    const author = this.getUserById(data.authorId);
    if (!author) throw new Error('Author not found');

    // Extract hashtags from content if not explicitly supplied
    let tags = data.tags || [];
    if (tags.length === 0) {
      const hashtagMatches = data.content.match(/#(\w+)/g);
      if (hashtagMatches) {
        tags = Array.from(new Set(hashtagMatches.map(t => t.replace('#', '').toLowerCase())));
      }
    }

    const newPost: Omit<Post, 'author'> = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: data.authorId,
      content: data.content.trim(),
      mediaUrl: data.mediaUrl || undefined,
      tags,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
      bookmarkedBy: []
    };

    this.data.posts.unshift(newPost);
    this.save();
    return this.enrichPost(newPost, data.authorId)!;
  }

  public deletePost(postId: string, userId: string): boolean {
    const idx = this.data.posts.findIndex(p => p.id === postId);
    if (idx === -1) return false;

    // Check ownership
    if (this.data.posts[idx].authorId !== userId) {
      throw new Error('Not authorized to delete this post');
    }

    this.data.posts.splice(idx, 1);
    // Also delete associated comments
    this.data.comments = this.data.comments.filter(c => c.postId !== postId);
    this.save();
    return true;
  }

  public toggleLikePost(postId: string, userId: string): { isLiked: boolean; likesCount: number } {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const index = post.likedBy.indexOf(userId);
    let isLiked = false;

    if (index > -1) {
      post.likedBy.splice(index, 1);
      isLiked = false;
    } else {
      post.likedBy.push(userId);
      isLiked = true;
    }

    post.likesCount = post.likedBy.length;
    this.save();
    return { isLiked, likesCount: post.likesCount };
  }

  public toggleBookmarkPost(postId: string, userId: string): { isBookmarked: boolean } {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    if (!post.bookmarkedBy) post.bookmarkedBy = [];
    const index = post.bookmarkedBy.indexOf(userId);
    let isBookmarked = false;

    if (index > -1) {
      post.bookmarkedBy.splice(index, 1);
      isBookmarked = false;
    } else {
      post.bookmarkedBy.push(userId);
      isBookmarked = true;
    }

    this.save();
    return { isBookmarked };
  }

  private enrichPost(post: Omit<Post, 'author'>, activeUserId?: string): Post | null {
    const author = this.getUserById(post.authorId, activeUserId);
    if (!author) return null;

    const commentsForPost = this.data.comments.filter(c => c.postId === post.id);

    return {
      ...post,
      author,
      commentsCount: commentsForPost.length,
      likesCount: post.likedBy.length,
      isLiked: activeUserId ? post.likedBy.includes(activeUserId) : false,
      isBookmarked: activeUserId && post.bookmarkedBy ? post.bookmarkedBy.includes(activeUserId) : false
    };
  }

  // --- Comments ---
  public getComments(postId: string, activeUserId?: string): Comment[] {
    const comments = this.data.comments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return comments
      .map(c => this.enrichComment(c, activeUserId))
      .filter((c): c is Comment => c !== null);
  }

  public createComment(data: { postId: string; authorId: string; content: string }): Comment {
    const post = this.data.posts.find(p => p.id === data.postId);
    if (!post) throw new Error('Post not found');

    const author = this.getUserById(data.authorId);
    if (!author) throw new Error('Author not found');

    const newComment: Omit<Comment, 'author'> = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId: data.postId,
      authorId: data.authorId,
      content: data.content.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likedBy: []
    };

    this.data.comments.push(newComment);
    post.commentsCount = this.data.comments.filter(c => c.postId === data.postId).length;
    this.save();

    return this.enrichComment(newComment, data.authorId)!;
  }

  public deleteComment(commentId: string, userId: string): boolean {
    const idx = this.data.comments.findIndex(c => c.id === commentId);
    if (idx === -1) return false;

    const comment = this.data.comments[idx];
    if (comment.authorId !== userId) {
      throw new Error('Not authorized to delete this comment');
    }

    const postId = comment.postId;
    this.data.comments.splice(idx, 1);

    const post = this.data.posts.find(p => p.id === postId);
    if (post) {
      post.commentsCount = this.data.comments.filter(c => c.postId === postId).length;
    }

    this.save();
    return true;
  }

  public toggleLikeComment(commentId: string, userId: string): { isLiked: boolean; likesCount: number } {
    const comment = this.data.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');

    const index = comment.likedBy.indexOf(userId);
    let isLiked = false;

    if (index > -1) {
      comment.likedBy.splice(index, 1);
      isLiked = false;
    } else {
      comment.likedBy.push(userId);
      isLiked = true;
    }

    comment.likesCount = comment.likedBy.length;
    this.save();
    return { isLiked, likesCount: comment.likesCount };
  }

  private enrichComment(comment: Omit<Comment, 'author'>, activeUserId?: string): Comment | null {
    const author = this.getUserById(comment.authorId, activeUserId);
    if (!author) return null;

    return {
      ...comment,
      author,
      likesCount: comment.likedBy ? comment.likedBy.length : 0,
      isLiked: activeUserId && comment.likedBy ? comment.likedBy.includes(activeUserId) : false
    };
  }
}

export const db = new Database();
