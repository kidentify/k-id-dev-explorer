// Shared types for webhook functionality

export interface WebhookEvent {
  id: string;
  timestamp: string;
  headers: Record<string, string>;
  body: unknown;
  method: string;
  url: string;
  signatureStatus?: 'valid' | 'invalid' | 'missing' | 'not_configured';
}

export interface NgrokInfo {
  success: boolean;
  ngrokUrl?: string;
  webhookUrl?: string;
  localUrl?: string;
  protocol?: string;
  error?: string;
}

