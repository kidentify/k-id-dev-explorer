import { NextRequest, NextResponse } from 'next/server';
import { broadcastWebhookEvent } from './connections';
import { WebhookEvent } from '../../types/webhook';

// Store webhook events in memory (in production, you'd want to use a database or message queue)
let webhookEvents: WebhookEvent[] = [];

// Shared utility function to create and process webhook events
async function processWebhook(request: NextRequest, method: string) {
  try {
    let body;
    
    // Try to parse as JSON first, fallback to text
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        body = await request.json();
      } catch {
        body = await request.text();
      }
    } else {
      body = await request.text();
    }
    
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const webhookEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      headers,
      body: body || null,
      method,
      url: request.url
    };

    // Store the webhook event
    webhookEvents.unshift(webhookEvent);
    if (webhookEvents.length > 100) {
      webhookEvents = webhookEvents.slice(0, 100);
    }

    // Broadcast to all connected SSE clients
    broadcastWebhookEvent(webhookEvent);

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received successfully',
      eventId: webhookEvent.id 
    });
  } catch (error) {
    console.error(`Error processing ${method} webhook:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// HTTP method handlers - all use the same processing logic
export async function POST(request: NextRequest) {
  return processWebhook(request, 'POST');
}

export async function GET(request: NextRequest) {
  return processWebhook(request, 'GET');
}

export async function PUT(request: NextRequest) {
  return processWebhook(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return processWebhook(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return processWebhook(request, 'PATCH');
}