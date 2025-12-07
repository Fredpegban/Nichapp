import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../src/lib/db';
import { getUserFromRequest } from '../../../src/lib/auth';
import Story from '../../../models/Story';
import User from '../../../models/User';
import FounderProfile from '../../../models/FounderProfile';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const page = Math.max(parseInt(String(req.query.page ?? DEFAULT_PAGE), 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    50
  );
  const skip = (page - 1) * limit;

  const niche = req.query.niche ? String(req.query.niche) : undefined;
  const founderProfileId = req.query.founderProfileId ? String(req.query.founderProfileId) : undefined;
  const region = req.query.region ? String(req.query.region) : undefined;
  const filter: Record<string, unknown> = {};
  if (niche) filter.nicheCategoryId = niche;
  if (founderProfileId) filter.founderProfileId = founderProfileId;
  if (region) filter.region = region;

  try {
    await connectToDatabase();
    const [items, total] = await Promise.all([
      Story.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Story.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return res.status(200).json({ items, page, totalPages });
  } catch (err) {
    console.error('Stories feed error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const decoded = getUserFromRequest(req);
  if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { text, mediaUrls, nicheCategoryId, region } = req.body || {};
  if (!text || typeof text !== 'string' || !nicheCategoryId) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const mediaArray =
    Array.isArray(mediaUrls) && mediaUrls.every((m: unknown) => typeof m === 'string')
      ? mediaUrls
      : [];

  try {
    await connectToDatabase();
    const user = await User.findById(decoded.sub);
    if (!user || user.role !== 'founder') {
      return res.status(403).json({ message: 'Founder role required' });
    }

    const founderProfile = await FounderProfile.findOne({ userId: user._id });
    if (!founderProfile) {
      return res.status(400).json({ message: 'Founder profile not found' });
    }

    const story = await Story.create({
      authorId: user._id,
      founderProfileId: founderProfile._id,
      text,
      mediaUrls: mediaArray,
      nicheCategoryId,
      region: region || founderProfile.region,
    });

    await FounderProfile.findByIdAndUpdate(founderProfile._id, {
      $inc: { 'stats.storyCount': 1 },
    });

    return res.status(201).json({ story });
  } catch (err) {
    console.error('Story create error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
