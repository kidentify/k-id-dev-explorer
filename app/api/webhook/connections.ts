// Global connections store for SSE - using globalThis to ensure it's shared across all API routes
declare global {
  var __webhookConnections: Set<ReadableStreamDefaultController> | undefined;
}

// Initialize the global connections set if it doesn't exist
if (!globalThis.__webhookConnections) {
  globalThis.__webhookConnections = new Set<ReadableStreamDefaultController>();
}

export const connections = globalThis.__webhookConnections;

// Function to broadcast webhook events to all connected clients
export function broadcastWebhookEvent(webhookEvent: unknown) {
  const eventData = {
    type: 'webhook',
    data: webhookEvent
  };

  connections.forEach(controller => {
    try {
      controller.enqueue(`data: ${JSON.stringify(eventData)}\n\n`);
    } catch {
      // Connection might be closed, remove it
      connections.delete(controller);
    }
  });
}
