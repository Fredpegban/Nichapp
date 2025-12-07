import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../src/lib/db';
import { getUserFromRequest } from '../../../src/lib/auth';
import User from '../../../models/User';
import Story from '../../../models/Story';

const STATUSES = ['published', 'flagged', 'removed'] as const;

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const decoded = getUserFromRequest(req);
  if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }

  await connectToDatabase();
  const user = await User.findById(decoded.sub);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ message: 'Admin only' });
    return null;
  }

  return user;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'PATCH':
      return handlePatch(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PATCH']);
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const status = req.query.status ? String(req.query.status) : undefined;
  const filter: Record<string, unknown> = {};
  if (status && STATUSES.includes(status as any)) {
    filter.status = status;
  }

  try {
    const stories = await Story.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ stories });
  } catch (err) {
    console.error('Admin stories list error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { id, status } = req.body || {};
  if (!id || !status || !STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const story = await Story.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    return res.status(200).json({ story });
  } catch (err) {
    console.error('Admin story update error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
