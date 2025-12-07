import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../src/lib/db';
import { getUserFromRequest } from '../../../src/lib/auth';
import Story from '../../../models/Story';
import Comment from '../../../models/Comment';
import Event from '../../../models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid story id' });
  }

  try {
    await connectToDatabase();

    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('authorId', 'displayName avatarUrl role')
      .populate('founderProfileId')
      .lean();

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const commentCount = await Comment.countDocuments({ storyId: id });

    const decoded = getUserFromRequest(req);
    const userId =
      decoded && typeof decoded === 'object' && 'sub' in decoded ? decoded.sub : undefined;
    await Event.create({
      userId,
      type: 'story_view',
      targetId: id,
    });

    return res.status(200).json({ story, commentCount });
  } catch (err) {
    console.error('Story detail error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
