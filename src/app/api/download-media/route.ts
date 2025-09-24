import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mediaUrl = searchParams.get('url');
  const filename = searchParams.get('filename');

  if (!mediaUrl) {
    return NextResponse.json({ error: 'Media URL is required' }, { status: 400 });
  }

  try {
    // Fetch the media from the external URL with timeout and proper headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(mediaUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
    }

    // Get the media as a buffer
    const buffer = await response.arrayBuffer();
    
    if (buffer.byteLength === 0) {
      throw new Error('Downloaded file is empty');
    }
    
    // Determine content type
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Return the media with proper headers for download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename || 'media'}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Length': buffer.byteLength.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error downloading media:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Download timeout - please try again' }, { status: 408 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to download media. The image may be temporarily unavailable or blocked.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
