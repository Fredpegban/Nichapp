import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../src/lib/db';
import { getUserFromRequest } from '../../../../src/lib/auth';
import Comment from '../../../../models/Comment';
import Story from '../../../../models/Story';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid story id' });
  }

  const decoded = getUserFromRequest(req);
  if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    await connectToDatabase();
    const comment = await Comment.create({
      storyId: id,
      authorId: decoded.sub,
      text,
    });

    await Story.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });

    return res.status(201).json({ comment });
  } catch (err) {
    console.error('Comment create error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
