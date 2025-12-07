import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../src/lib/db';
import FounderProfile from '../../models/FounderProfile';
import Story from '../../models/Story';
import Niche from '../../models/Niche';

const TREND_LIMIT = 5;

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectToDatabase();

    const [trendingFounders, recentFounders] = await Promise.all([
      FounderProfile.find({})
        .sort({ 'stats.followersCount': -1, 'stats.storyCount': -1, createdAt: -1 })
        .limit(TREND_LIMIT)
        .lean(),
      FounderProfile.find({})
        .sort({ createdAt: -1 })
        .limit(TREND_LIMIT)
        .lean(),
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const nicheAgg = await Story.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$nicheCategoryId', storyCount: { $sum: 1 } } },
      { $sort: { storyCount: -1 } },
      { $limit: TREND_LIMIT },
    ]);

    const nicheIds = nicheAgg.map((n) => n._id).filter(Boolean);
    const niches = await Niche.find({ _id: { $in: nicheIds } }).lean();
    const trendingNiches = nicheAgg.map((entry) => {
      const niche = niches.find((n) => n._id.toString() === entry._id?.toString());
      return {
        _id: entry._id,
        name: niche?.name,
        slug: niche?.slug,
        storyCount: entry.storyCount,
      };
    });

    return res.status(200).json({
      trendingFounders,
      trendingNiches,
      recentFounders,
    });
  } catch (err) {
    console.error('Discover error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
