import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../src/lib/db';
import { getUserFromRequest } from '../../src/lib/auth';
import Event from '../../models/Event';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, targetId, metadata } = req.body || {};
  if (!type || typeof type !== 'string') {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const decoded = getUserFromRequest(req);
  const userId =
    decoded && typeof decoded === 'object' && 'sub' in decoded ? decoded.sub : undefined;

  try {
    await connectToDatabase();
    const event = await Event.create({
      userId,
      type,
      targetId,
      metadata,
    });

    return res.status(201).json({ event });
  } catch (err) {
    console.error('Event log error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
