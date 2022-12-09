import NextAuth from 'next-auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { options } from '@constants/sys/nextAuthOptions';

/**
 * Default NextAuth route used by the library
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 * @returns NextAuth object
 */
export default async function auth (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'HEAD') {
    return res.status(200);
  }

  const au = NextAuth(req, res, options);
  return au;
}
