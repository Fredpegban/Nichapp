import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../src/lib/db';
import FounderProfile from '../../../models/FounderProfile';

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
    return res.status(400).json({ message: 'Invalid founder id' });
  }

  try {
    await connectToDatabase();
    const founder = await FounderProfile.findById(id).lean();
    if (!founder) {
      return res.status(404).json({ message: 'Founder not found' });
    }

    return res.status(200).json({ founder });
  } catch (err) {
    console.error('Founder detail error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
