import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Server-Sent Events (SSE) endpoint for real-time updates
 * Streams credit balance and character slot updates to the client
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection message
      const send = (data: object) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      send({ type: 'connected', message: 'Real-time updates connected' });

      // Set up interval to check for updates (every 10 seconds)
      // In a production app, you'd use a pub/sub system (Redis, etc.) instead
      const interval = setInterval(async () => {
        try {
          // Check for credit updates
          // In production, this would be triggered by database events or pub/sub
          // For now, we'll just send a heartbeat
          send({ 
            type: 'heartbeat', 
            timestamp: Date.now() 
          });
        } catch (error) {
          console.error('Error in SSE stream:', error);
          clearInterval(interval);
          controller.close();
        }
      }, 10000); // 10 seconds

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  });
}
