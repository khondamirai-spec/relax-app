import { NextRequest, NextResponse } from 'next/server';
import { getR2Client } from '@/lib/cloudflare-r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key'); // Object key in R2 bucket

  if (!key) {
    return NextResponse.json({ error: 'Object key is required' }, { status: 400 });
  }

  const client = getR2Client();
  if (!client) {
    return NextResponse.json(
      { error: 'R2 not configured. Please set CLOUDFLARE_R2_ACCESS_KEY_ID and related environment variables.' },
      { status: 500 }
    );
  }

  try {
    // Support range requests for seeking
    const range = request.headers.get('range');
    let rangeStart = 0;
    let rangeEnd: number | undefined = undefined;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      rangeStart = parseInt(parts[0], 10);
      rangeEnd = parts[1] ? parseInt(parts[1], 10) : undefined;
    }

    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'music',
      Key: key,
      Range: range ? `bytes=${rangeStart}-${rangeEnd || ''}` : undefined,
    });

    const response = await client.send(command);
    
    if (!response.Body) {
      return NextResponse.json({ error: 'File not found in R2 bucket' }, { status: 404 });
    }

    // Get content type from response or infer from file extension
    let contentType = response.ContentType || '';
    
    // Always prioritize file extension for audio files to ensure correct MIME type
    if (key.endsWith('.mp3')) {
      contentType = 'audio/mpeg';
    } else if (key.endsWith('.m4a')) {
      contentType = 'audio/mp4';
    } else if (key.endsWith('.weba') || key.endsWith('.webm')) {
      contentType = 'audio/webm';
    } else if (key.endsWith('.ogg')) {
      contentType = 'audio/ogg';
    } else if (key.endsWith('.wav')) {
      contentType = 'audio/wav';
    } else if (!contentType || contentType === 'application/octet-stream') {
      // Fallback to response content type or default
      contentType = response.ContentType || 'application/octet-stream';
    }
    
    console.log('R2 Stream:', { key, contentType, contentLength: response.ContentLength });

    // Stream the response directly instead of loading into memory
    const stream = response.Body.transformToWebStream();
    
    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    };

    // Add content length and range headers if available
    if (response.ContentLength) {
      headers['Content-Length'] = response.ContentLength.toString();
    }

    if (range && response.ContentRange) {
      headers['Content-Range'] = response.ContentRange;
      return new NextResponse(stream, {
        status: 206, // Partial Content
        headers,
      });
    }

    // If ContentLength is available, add it
    if (response.ContentLength) {
      headers['Content-Length'] = response.ContentLength.toString();
    }

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('R2 stream error:', { key, error });
    const errorMessage = (error as Error).message;
    
    if (errorMessage.includes('NoSuchKey') || errorMessage.includes('404') || errorMessage.includes('not found')) {
      return NextResponse.json({ 
        error: `File "${key}" not found in R2 bucket "${process.env.CLOUDFLARE_R2_BUCKET_NAME || 'music'}". Please check the file name and ensure it exists.` 
      }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: `Failed to stream file "${key}" from R2: ${errorMessage}` },
      { status: 500 }
    );
  }
}

