// Cloudflare R2 configuration
// Get these from: Cloudflare Dashboard > R2 > Manage R2 API Tokens

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const r2Config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'music',
  publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || '', // Optional: if public access is enabled
};

/**
 * Get R2 S3 client instance
 */
export function getR2Client(): S3Client | null {
  if (!r2Config.accountId || !r2Config.accessKeyId || !r2Config.secretAccessKey) {
    console.warn('R2 credentials not configured');
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2Config.accessKeyId,
      secretAccessKey: r2Config.secretAccessKey,
    },
  });
}

/**
 * Get public URL for R2 object (if public access is enabled)
 * @param key - Object key in the bucket (e.g., 'relax.weba')
 */
export function getR2PublicUrl(key: string): string {
  if (r2Config.publicUrl) {
    // If custom domain is set up
    return `${r2Config.publicUrl}/${key}`;
  }
  
  // Default R2 public URL format (only works if public access is enabled)
  // Format: https://pub-{accountId}.r2.dev/{bucketName}/{key}
  if (r2Config.accountId) {
    return `https://pub-${r2Config.accountId}.r2.dev/${r2Config.bucketName}/${key}`;
  }
  
  throw new Error('R2 public URL not configured');
}

/**
 * Generate a signed URL for R2 object (for private buckets)
 * @param key - Object key in the bucket (e.g., 'relax.weba')
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getR2SignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const client = getR2Client();
  if (!client) {
    throw new Error('R2 client not configured');
  }

  const command = new GetObjectCommand({
    Bucket: r2Config.bucketName,
    Key: key,
  });

  try {
    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL for R2 object');
  }
}

/**
 * Get R2 object URL - tries public first, falls back to signed URL
 * @param key - Object key in the bucket
 */
export async function getR2Url(key: string): Promise<string> {
  // If public URL is configured, try that first
  if (r2Config.publicUrl || r2Config.accountId) {
    try {
      return getR2PublicUrl(key);
    } catch (error) {
      // Fall back to signed URL if public access fails
    }
  }
  
  // Generate signed URL for private buckets
  return getR2SignedUrl(key);
}








