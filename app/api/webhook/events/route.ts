import { NextRequest } from 'next/server';
import { connections } from '../connections';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      // Add this connection to the set
      connections.add(controller);

      // Send initial connection message
      const initialMessage = {
        type: 'connected',
        data: { message: 'Connected to webhook events stream' }
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`));

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const heartbeatMessage = {
            type: 'heartbeat',
            data: { timestamp: new Date().toISOString() }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(heartbeatMessage)}\n\n`));
        } catch {
          clearInterval(heartbeat);
          connections.delete(controller);
        }
      }, 30000);

      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        connections.delete(controller);
        try {
          controller.close();
        } catch {
          // Connection might already be closed
        }
      });
    },

    cancel() {
      if (controller) {
        connections.delete(controller);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

