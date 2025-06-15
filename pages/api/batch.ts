import { NextApiRequest, NextApiResponse } from 'next';
import { executeBatchProcess } from '../../src/lib/api/batch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await executeBatchProcess();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Batch process error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'バッチ処理の実行中にエラーが発生しました。'
    });
  }
} 