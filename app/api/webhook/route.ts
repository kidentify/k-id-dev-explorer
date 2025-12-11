import { NextRequest, NextResponse } from 'next/server';
import { broadcastWebhookEvent } from './connections';
import { WebhookEvent } from '../../types/webhook';
import crypto from 'crypto';

// Store webhook events in memory (in production, you'd want to use a database or message queue)
let webhookEvents: WebhookEvent[] = [];

/**
 * Validates webhook signature using HMAC-SHA256 according to k-ID specification
 * @param rawBody - The raw request body as a string
 * @param signatureHeader - The signature from X-Signature-Hmac-Sha256 header
 * @param timestampHeader - The timestamp from X-Signature-Timestamp header
 * @param secret - The webhook secret from environment variable
 * @returns 'valid' if signature matches, 'invalid' if it doesn't, 'missing' if signature/timestamp headers are not present, 'not_configured' if secret is not configured
 * @see https://docs.k-id.com/events/webhooks/overview#signature-validation
 */
function validateWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  secret: string | undefined
): 'valid' | 'invalid' | 'missing' | 'not_configured' {
  // If secret is not configured, return 'not_configured'
  if (!secret) {
    return 'not_configured';
  }

  // If signature or timestamp headers are missing, return 'missing'
  if (!signatureHeader || !timestampHeader) {
    return 'missing';
  }

  try {
    // According to k-ID spec: HMAC SHA-256 of (timestamp + raw body)
    // Using the webhook secret as key, hex-encoded (lowercase)
    const payload = timestampHeader + rawBody;
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
      .toLowerCase(); // Ensure lowercase hex encoding

    // Compare signatures (use constant-time comparison to prevent timing attacks)
    const providedSignature = signatureHeader.trim().toLowerCase();
    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );

    return isValid ? 'valid' : 'invalid';
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return 'invalid';
  }
}

// Shared utility function to create and process webhook events
async function processWebhook(request: NextRequest, method: string) {
  try {
    // Read raw body as text first (needed for signature validation)
    // Clone the request to avoid consuming the body stream
    const clonedRequest = request.clone();
    const rawBody = await clonedRequest.text();

    let body;
    // Try to parse as JSON, fallback to keeping as text
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = rawBody || null;
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Get webhook secret from environment variable
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // Get signature headers according to k-ID specification
    // https://docs.k-id.com/events/webhooks/overview#signature-validation
    const signatureHeader = request.headers.get('x-signature-hmac-sha256');
    const timestampHeader = request.headers.get('x-signature-timestamp');

    // Validate webhook signature if secret is configured
    const signatureStatus = validateWebhookSignature(
      rawBody,
      signatureHeader,
      timestampHeader,
      webhookSecret
    );

    // If signature validation is configured and signature is invalid or missing, return 401
    if (webhookSecret && (signatureStatus === 'invalid' || signatureStatus === 'missing')) {
      // Still log the event for debugging purposes
      const webhookEvent: WebhookEvent = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        headers,
        body: body || null,
        method,
        url: request.url,
        signatureStatus
      };

      // Store the webhook event
      webhookEvents.unshift(webhookEvent);
      if (webhookEvents.length > 100) {
        webhookEvents = webhookEvents.slice(0, 100);
      }

      // Broadcast to all connected SSE clients
      broadcastWebhookEvent(webhookEvent);

      return NextResponse.json(
        {
          success: false,
          error: signatureStatus === 'invalid'
            ? 'Invalid webhook signature'
            : 'Missing webhook signature',
          eventId: webhookEvent.id
        },
        { status: 401 }
      );
    }

    const webhookEvent: WebhookEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      headers,
      body: body || null,
      method,
      url: request.url,
      signatureStatus
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