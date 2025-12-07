import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../src/lib/db';
import { getUserFromRequest } from '../../../src/lib/auth';
import FounderProfile from '../../../models/FounderProfile';
import User from '../../../models/User';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const ALLOWED_SORT = {
  top: { 'stats.followersCount': -1, 'stats.storyCount': -1, createdAt: -1 },
  new: { createdAt: -1 },
} as const;

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
  const region = req.query.region ? String(req.query.region) : undefined;
  const sortKey = req.query.sort ? String(req.query.sort) : 'new';
  const sort = ALLOWED_SORT[sortKey as keyof typeof ALLOWED_SORT] ?? ALLOWED_SORT.new;

  const filter: Record<string, unknown> = {};
  if (niche) filter.nicheCategoryId = niche;
  if (region) filter.region = region;

  try {
    await connectToDatabase();

    const [items, total] = await Promise.all([
      FounderProfile.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      FounderProfile.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({ items, page, totalPages });
  } catch (err) {
    console.error('Founders list error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const decoded = getUserFromRequest(req);
  if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { brandName, aboutFounder, storyHighlights, nicheCategoryId, region } = req.body || {};

  if (!aboutFounder || typeof aboutFounder !== 'string' || !nicheCategoryId) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const highlightsArray =
    Array.isArray(storyHighlights) && storyHighlights.every((h) => typeof h === 'string')
      ? storyHighlights
      : [];

  try {
    await connectToDatabase();
    const user = await User.findById(decoded.sub);
    if (!user || user.role !== 'founder') {
      return res.status(403).json({ message: 'Founder role required' });
    }

    const update = {
      brandName: brandName ? String(brandName) : undefined,
      aboutFounder: String(aboutFounder),
      storyHighlights: highlightsArray,
      nicheCategoryId,
      region: region ? String(region) : undefined,
    };

    const profile = await FounderProfile.findOneAndUpdate(
      { userId: user._id },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ profile });
  } catch (err) {
    console.error('Founder upsert error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
