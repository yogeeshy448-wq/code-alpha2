export interface User {
  id: string;
  username: string; // e.g. alexandrachen
  name: string; // e.g. Alexandra Chen
  bio: string;
  avatar: string;
  banner?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  mediaUrl?: string;
  tags: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  likedBy: string[];
  isLiked?: boolean;
  bookmarkedBy?: string[];
  isBookmarked?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
  isLiked?: boolean;
}

export interface FollowRecord {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface CreatePostPayload {
  content: string;
  mediaUrl?: string;
  tags?: string[];
  authorId: string;
}

export interface CreateCommentPayload {
  content: string;
  authorId: string;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  banner?: string;
}
