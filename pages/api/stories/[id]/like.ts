import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../src/lib/db';
import { getUserFromRequest } from '../../../../src/lib/auth';
import Like from '../../../../models/Like';
import Story from '../../../../models/Story';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid story id' });
  }

  const decoded = getUserFromRequest(req);
  if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = decoded.sub;

  switch (req.method) {
    case 'POST':
      return handlePost(id, userId, res);
    case 'DELETE':
      return handleDelete(id, userId, res);
    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handlePost(storyId: string, userId: string, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const result = await Like.updateOne(
      { storyId, userId },
      { $setOnInsert: { storyId, userId } },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      await Story.findByIdAndUpdate(storyId, { $inc: { likeCount: 1 } });
    }

    return res.status(200).json({ liked: true });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(200).json({ liked: true });
    }
    console.error('Like error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleDelete(storyId: string, userId: string, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const result = await Like.deleteOne({ storyId, userId });
    if (result.deletedCount && result.deletedCount > 0) {
      await Story.findByIdAndUpdate(storyId, {
        $inc: { likeCount: -1 },
        $max: { likeCount: 0 },
      });
    }

    return res.status(200).json({ liked: false });
  } catch (err) {
    console.error('Unlike error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
