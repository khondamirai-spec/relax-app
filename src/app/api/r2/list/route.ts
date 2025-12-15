import { NextResponse } from 'next/server';
import { getR2Client } from '@/lib/cloudflare-r2';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET() {
  const client = getR2Client();
  if (!client) {
    return NextResponse.json(
      { error: 'R2 not configured. Please set CLOUDFLARE_R2_ACCESS_KEY_ID and related environment variables.' },
      { status: 500 }
    );
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'music',
    });

    const response = await client.send(command);
    
    const files = response.Contents?.map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
    })) || [];

    return NextResponse.json({ 
      bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'music',
      files,
      count: files.length 
    });
  } catch (error) {
    console.error('R2 list error:', error);
    return NextResponse.json(
      { error: `Failed to list files: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}


