import { NextRequest, NextResponse } from 'next/server';

async function fetchGoogleDriveFile(fileId: string): Promise<Response> {
  // Method 1: Try using 'open' instead of 'download' (better for streaming)
  const openUrl = `https://drive.google.com/uc?export=open&id=${fileId}`;
  
  try {
    const openResponse = await fetch(openUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://drive.google.com/',
      },
      redirect: 'follow',
    });

    const contentType = openResponse.headers.get('content-type') || '';
    const contentLength = openResponse.headers.get('content-length');
    
    // Check if we got actual file content
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      // If content-length exists and is reasonable, or if content-type suggests binary
      if (contentLength || contentType.includes('audio') || contentType.includes('octet-stream') || contentType.includes('application')) {
        console.log('Success with open method, type:', contentType);
        return openResponse;
      }
    }
    
    // If we got HTML, check if it's an error page
    if (contentType.includes('text/html')) {
      const text = await openResponse.text();
      if (text.includes('Sign in') || text.includes('access denied')) {
        throw new Error('File requires authentication. Please share as "Anyone with the link"');
      }
    }
  } catch (error) {
    console.error('Open method failed:', error);
    if ((error as Error).message.includes('authentication')) {
      throw error; // Re-throw auth errors
    }
  }

  // Method 2: Try download with confirm codes
  const downloadUrls = [
    `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
  ];

  for (const url of downloadUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
        },
        redirect: 'follow',
      });

      const contentType = response.headers.get('content-type') || '';
      
      // Check if we got actual file content
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        const contentLength = response.headers.get('content-length');
        // If it's larger than 1KB or no content-length header, likely a file
        if (!contentLength || parseInt(contentLength) > 1000) {
          console.log('Success with download method:', url);
          return response;
        }
      }
    } catch (error) {
      console.error('Error fetching URL:', url, error);
      continue;
    }
  }

  // Method 3: Check if file is accessible by trying to access the view page
  try {
    const viewPageUrl = `https://drive.google.com/file/d/${fileId}/view`;
    const viewResponse = await fetch(viewPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const viewHtml = await viewResponse.text();
    
    // Check if page requires sign-in
    if (viewHtml.includes('Sign in') || viewHtml.includes('access denied') || viewHtml.includes('You need access')) {
      throw new Error('File requires authentication. Please share the file as "Anyone with the link" (not just "Shareable").');
    }
    
    // Try to find download link in the page
    const downloadPatterns = [
      /href="([^"]*uc[^"]*export=download[^"]*)/,
      /downloadUrl":"([^"]+)"/,
      /"downloadUrl":"([^"]+)"/,
    ];
    
    for (const pattern of downloadPatterns) {
      const match = viewHtml.match(pattern);
      if (match && match[1]) {
        let downloadUrl = match[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
        
        if (!downloadUrl.startsWith('http')) {
          downloadUrl = `https://drive.google.com${downloadUrl}`;
        }
        
        console.log('Found download URL from view page:', downloadUrl);
        
        const finalResponse = await fetch(downloadUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://drive.google.com/',
          },
          redirect: 'follow',
        });
        
        const finalContentType = finalResponse.headers.get('content-type') || '';
        if (!finalContentType.includes('text/html')) {
          console.log('Success with URL from view page');
          return finalResponse;
        }
      }
    }
  } catch (error) {
    console.error('Error checking view page:', error);
    if ((error as Error).message.includes('authentication')) {
      throw error; // Re-throw auth errors
    }
  }

  // Method 4: Parse download page HTML to extract actual download link
  try {
    const pageResponse = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    
    const html = await pageResponse.text();
    console.log('Download page HTML preview:', html.substring(0, 1000));
    
    // Check for authentication required
    if (html.includes('Sign in') || html.includes('access denied')) {
      throw new Error('File requires authentication. Please share as "Anyone with the link".');
    }
    
    // Look for various patterns Google Drive uses for download links
    // Pattern 1: Direct confirm code in URL
    let confirmCode = null;
    const confirmMatch = html.match(/confirm=([a-zA-Z0-9_-]+)/);
    if (confirmMatch) {
      confirmCode = confirmMatch[1];
    }
    
    // Pattern 2: Look for download form action
    const formActionMatch = html.match(/action="([^"]*uc[^"]*export=download[^"]*)"/);
    if (formActionMatch) {
      let downloadUrl = formActionMatch[1].replace(/&amp;/g, '&');
      if (!downloadUrl.startsWith('http')) {
        downloadUrl = `https://drive.google.com${downloadUrl}`;
      }
      
      console.log('Found form action URL:', downloadUrl);
      
      const finalResponse = await fetch(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://drive.google.com/',
        },
        redirect: 'follow',
      });
      
      const finalContentType = finalResponse.headers.get('content-type') || '';
      if (!finalContentType.includes('text/html')) {
        console.log('Success with form action URL');
        return finalResponse;
      }
    }
    
    // Pattern 3: Use confirm code if found
    if (confirmCode) {
      const confirmUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmCode}`;
      console.log('Trying confirm code URL:', confirmUrl);
      
      const finalResponse = await fetch(confirmUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://drive.google.com/',
        },
        redirect: 'follow',
      });
      
      const finalContentType = finalResponse.headers.get('content-type') || '';
      if (!finalContentType.includes('text/html')) {
        console.log('Success with confirm code');
        return finalResponse;
      }
    }
    
    // Pattern 4: Look for direct download link in JavaScript
    const jsDownloadMatch = html.match(/downloadUrl["\s]*:["\s]*"([^"]+)"/);
    if (jsDownloadMatch) {
      let downloadUrl = jsDownloadMatch[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
      console.log('Found JS download URL:', downloadUrl);
      
      const finalResponse = await fetch(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        redirect: 'follow',
      });
      
      const finalContentType = finalResponse.headers.get('content-type') || '';
      if (!finalContentType.includes('text/html')) {
        console.log('Success with JS download URL');
        return finalResponse;
      }
    }
    
  } catch (error) {
    console.error('Error parsing download page:', error);
    if ((error as Error).message.includes('authentication')) {
      throw error; // Re-throw auth errors
    }
  }

  // Method 5: Try alternative URL pattern for large files
  try {
    // Sometimes Google Drive uses a different endpoint for large files
    const altUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    const altResponse = await fetch(altUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });
    
    const altContentType = altResponse.headers.get('content-type') || '';
    if (!altContentType.includes('text/html')) {
      console.log('Success with alternative URL');
      return altResponse;
    }
    
    // If we got HTML, try to extract the download link
    const altHtml = await altResponse.text();
    const downloadLinkMatch = altHtml.match(/href="([^"]*uc[^"]*id=${fileId}[^"]*export=download[^"]*)"/);
    if (downloadLinkMatch) {
      let downloadUrl = downloadLinkMatch[1].replace(/&amp;/g, '&');
      if (!downloadUrl.startsWith('http')) {
        downloadUrl = `https://drive.google.com${downloadUrl}`;
      }
      
      const finalResponse = await fetch(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        redirect: 'follow',
      });
      
      const finalContentType = finalResponse.headers.get('content-type') || '';
      if (!finalContentType.includes('text/html')) {
        console.log('Success with extracted download link');
        return finalResponse;
      }
    }
  } catch (error) {
    console.error('Error with alternative method:', error);
  }

  throw new Error('Could not get download link from Google Drive. The file might be too large (>100MB) or Google Drive is blocking automated downloads. Consider using Cloudinary instead.');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  try {
    const response = await fetchGoogleDriveFile(fileId);

    if (!response.ok) {
      console.error('Google Drive response status:', response.status);
      return NextResponse.json({ error: 'Failed to fetch file from Google Drive' }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length');
    
    console.log('Response status:', response.status);
    console.log('Content-Type:', contentType);
    console.log('Content-Length:', contentLength);
    
    // Clone the response to check content without consuming it
    const clonedResponse = response.clone();
    
    // If still HTML, the file isn't accessible
    if (contentType.includes('text/html') || contentType.includes('text/plain')) {
      const text = await clonedResponse.text();
      console.error('Got HTML/text response. First 1000 chars:', text.substring(0, 1000));
      
      // Check if it's an access denied page
      if (text.includes('Sign in') || text.includes('access denied') || text.includes('permission') || text.includes('You need access')) {
        return NextResponse.json({ 
          error: 'File access denied. Please make sure the file is shared as "Anyone with the link" (not just "Shareable").' 
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: 'Google Drive returned HTML instead of audio file. The file might be too large or require special handling.' 
      }, { status: 400 });
    }

    // Get the response body
    const data = await response.arrayBuffer();

    console.log('Successfully fetched file, size:', data.byteLength, 'type:', contentType);

    // Determine content type - if it's octet-stream or unknown, default to audio/mpeg
    let finalContentType = contentType;
    if (!contentType || contentType === 'application/octet-stream' || contentType.includes('text')) {
      finalContentType = 'audio/mpeg'; // Default for audio files
    }

    // Return the audio with proper headers
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': finalContentType,
        'Content-Length': data.byteLength.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*', // Allow CORS
      },
    });
  } catch (error) {
    console.error('Stream error:', error);
    const errorMessage = (error as Error).message;
    
    // Provide helpful error message
    if (errorMessage.includes('Could not get download link')) {
      return NextResponse.json({ 
        error: 'Google Drive is blocking automated downloads. Try one of these solutions:\n1. Use a smaller file (<25MB)\n2. Put the file in your public/ folder\n3. Use Cloudinary or another hosting service',
        fileId: fileId,
        suggestion: 'For large files, consider using Cloudinary (free tier: 25GB) or putting files in public/music/ folder'
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to stream file: ' + errorMessage }, { status: 500 });
  }
}

