import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '../../../src/lib/db';
import { signToken } from '../../../src/lib/auth';
import User from '../../../models/User';

type RegisterRequestBody = {
  email?: string;
  password?: string;
  displayName?: string;
  role?: 'founder' | 'supporter' | 'admin';
};

const ALLOWED_ROLES = ['founder', 'supporter', 'admin'] as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, displayName, role }: RegisterRequestBody = req.body || {};

  if (
    !email ||
    typeof email !== 'string' ||
    !password ||
    typeof password !== 'string' ||
    !displayName ||
    typeof displayName !== 'string' ||
    (role && !ALLOWED_ROLES.includes(role))
  ) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    await connectToDatabase();

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName.trim(),
      role: role || 'supporter',
    });

    const token = signToken({ sub: user._id.toString(), role: user.role });
    const { passwordHash: _, ...userSafe } = user.toObject();

    return res.status(201).json({
      token,
      user: userSafe,
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    console.error('Register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
