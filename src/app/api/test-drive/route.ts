import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id') || '18M2pXp7vj5w4An9X3h-NAlGVfvbg4vuC';

  try {
    // Test 1: Check if file view page is accessible
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    const viewResponse = await fetch(viewUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const viewHtml = await viewResponse.text();
    const isPublic = !viewHtml.includes('Sign in') && !viewHtml.includes('access denied');

    // Test 2: Try direct download
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const downloadResponse = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
    });

    const contentType = downloadResponse.headers.get('content-type') || '';
    const canDownload = !contentType.includes('text/html');

    return NextResponse.json({
      fileId,
      isPublic,
      canDownload,
      contentType,
      viewUrl,
      downloadUrl,
      message: isPublic 
        ? 'File appears to be publicly accessible!' 
        : 'File still requires authentication. Please share as "Anyone with the link"',
      downloadStatus: canDownload ? 'Working' : 'Blocked',
    });
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
      fileId,
    }, { status: 500 });
  }
}





