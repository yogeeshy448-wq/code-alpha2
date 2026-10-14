import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // API Router
  const apiRouter = express.Router();

  // --- Users ---
  apiRouter.get('/users', (req: Request, res: Response) => {
    const activeUserId = req.query.activeUserId as string | undefined;
    const users = db.getUsers(activeUserId);
    res.json({ success: true, users });
  });

  apiRouter.get('/users/:id', (req: Request, res: Response) => {
    const activeUserId = req.query.activeUserId as string | undefined;
    const user = db.getUserById(req.params.id, activeUserId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  });

  apiRouter.post('/users', (req: Request, res: Response) => {
    const { username, name, bio, avatar, location, website } = req.body;
    if (!username || !name) {
      return res.status(400).json({ success: false, error: 'Username and name are required' });
    }
    try {
      const newUser = db.createUser({ username, name, bio, avatar, location, website });
      res.status(201).json({ success: true, user: newUser });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  apiRouter.put('/users/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateUser(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Follow/Unfollow
  apiRouter.post('/users/:id/follow', (req: Request, res: Response) => {
    const { followerId } = req.body;
    if (!followerId) {
      return res.status(400).json({ success: false, error: 'followerId is required' });
    }
    try {
      const result = db.toggleFollow(followerId, req.params.id);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  apiRouter.get('/users/:id/followers', (req: Request, res: Response) => {
    const activeUserId = req.query.activeUserId as string | undefined;
    const followers = db.getFollowers(req.params.id, activeUserId);
    res.json({ success: true, followers });
  });

  apiRouter.get('/users/:id/following', (req: Request, res: Response) => {
    const activeUserId = req.query.activeUserId as string | undefined;
    const following = db.getFollowing(req.params.id, activeUserId);
    res.json({ success: true, following });
  });

  // --- Posts ---
  apiRouter.get('/posts', (req: Request, res: Response) => {
    const { feed, authorId, tag, search, activeUserId } = req.query;
    const posts = db.getPosts({
      feed: feed as any,
      authorId: authorId as string | undefined,
      tag: tag as string | undefined,
      search: search as string | undefined,
      activeUserId: activeUserId as string | undefined
    });
    res.json({ success: true, posts });
  });

  apiRouter.get('/posts/:id', (req: Request, res: Response) => {
    const activeUserId = req.query.activeUserId as string | undefined;
    const post = db.getPostById(req.params.id, activeUserId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, post });
  });

  apiRouter.post('/posts', (req: Request, res: Response) => {
    const { authorId, content, mediaUrl, tags } = req.body;
    if (!authorId || !content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Author and content are required' });
    }
    try {
      const newPost = db.createPost({ authorId, content, mediaUrl, tags });
      res.status(201).json({ success: true, post: newPost });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  apiRouter.delete('/posts/:id', (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    try {
      const success = db.deletePost(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/posts/:id/like', (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    try {
      const result = db.toggleLikePost(req.params.id, userId);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/posts/:id/bookmark', (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    try {
      const result = db.toggleBookmarkPost(req.params.id, userId);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // --- Comments ---
  apiRouter.get('/posts/:id/comments', (req: Request, res: Response) => {
    const activeUserId = req.query.activeUserId as string | undefined;
    const comments = db.getComments(req.params.id, activeUserId);
    res.json({ success: true, comments });
  });

  apiRouter.post('/posts/:id/comments', (req: Request, res: Response) => {
    const { authorId, content } = req.body;
    if (!authorId || !content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'authorId and content are required' });
    }
    try {
      const comment = db.createComment({ postId: req.params.id, authorId, content });
      res.status(201).json({ success: true, comment });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  apiRouter.delete('/comments/:id', (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    try {
      const success = db.deleteComment(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }
      res.json({ success: true, message: 'Comment deleted' });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/comments/:id/like', (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    try {
      const result = db.toggleLikeComment(req.params.id, userId);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Reset database state to defaults
  apiRouter.post('/reset', (_req: Request, res: Response) => {
    const resetData = db.reset();
    res.json({ success: true, message: 'Database reset to default seed data' });
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Fallback for API 404
  app.use('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'API route not found' });
  });

  // Vite middleware in dev or static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
