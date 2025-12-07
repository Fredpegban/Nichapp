import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../src/lib/db';
import { getUserFromRequest } from '../../../src/lib/auth';
import Follow from '../../../models/Follow';
import FounderProfile from '../../../models/FounderProfile';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { founderId } = req.query;
  if (!founderId || typeof founderId !== 'string') {
    return res.status(400).json({ message: 'Invalid founder id' });
  }

  const decoded = getUserFromRequest(req);
  if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      return handlePost(founderId, decoded.sub as string, res);
    case 'DELETE':
      return handleDelete(founderId, decoded.sub as string, res);
    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handlePost(founderId: string, userId: string, res: NextApiResponse) {
  try {
    await connectToDatabase();

    const result = await Follow.updateOne(
      { followerId: userId, followingId: founderId },
      { $setOnInsert: { followerId: userId, followingId: founderId } },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      await FounderProfile.findByIdAndUpdate(founderId, {
        $inc: { 'stats.followersCount': 1 },
      });
    }

    return res.status(200).json({ following: true });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(200).json({ following: true });
    }
    console.error('Follow error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleDelete(founderId: string, userId: string, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const result = await Follow.deleteOne({ followerId: userId, followingId: founderId });
    if (result.deletedCount && result.deletedCount > 0) {
      await FounderProfile.findByIdAndUpdate(founderId, {
        $inc: { 'stats.followersCount': -1 },
        $max: { 'stats.followersCount': 0 },
      });
    }

    return res.status(200).json({ following: false });
  } catch (err) {
    console.error('Unfollow error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
