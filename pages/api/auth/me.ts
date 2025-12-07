import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../src/lib/db';
import { getUserFromRequest } from '../../../src/lib/auth';
import User from '../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const decoded = getUserFromRequest(req);
  if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Auth me error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
