'use client';

import { EventLog as EventLogType } from '../cdk-flows/types';

interface EventLogProps {
  event: EventLogType;
  onCopy: (event: EventLogType) => void;
}

export default function EventLogDisplay({ event, onCopy }: EventLogProps) {
  const getEventTypeColor = (type?: string) => {
    switch (type) {
      case 'request': return 'bg-blue-100 text-blue-800';
      case 'response': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'webhook': return 'bg-orange-100 text-orange-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-500">{event.timestamp}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(event.type)}`}>
          {event.event.toUpperCase()}
        </span>
        {event.event === 'api-request' && event.details?.method && event.details?.url && (
          <span className="text-xs text-gray-600">
            {event.details.method} {event.details.body ? new URL(event.details.url).pathname : event.details.url}
          </span>
        )}
        {event.event === 'webhook-received' && event.details?.method && event.details?.url && (
          <span className="text-xs text-gray-600">
            {event.details.method} {new URL(event.details.url).pathname}
          </span>
        )}
        {event.event === 'webhook-received' && event.details?.signatureStatus && (
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            event.details.signatureStatus === 'valid'
              ? 'bg-green-100 text-green-800'
              : event.details.signatureStatus === 'invalid'
              ? 'bg-red-100 text-red-800'
              : event.details.signatureStatus === 'missing'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {event.details.signatureStatus === 'valid' && '✓ Signed'}
            {event.details.signatureStatus === 'invalid' && '✗ Invalid signature'}
            {event.details.signatureStatus === 'missing' && '⚠ No signature'}
            {event.details.signatureStatus === 'not_configured' && '○ Signature validation not configured'}
          </span>
        )}
        <button
          onClick={() => onCopy(event)}
          className="ml-auto text-gray-400 hover:text-gray-600 transition-colors duration-200"
          title="Copy event to clipboard"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      {event.details && !(event.event === 'api-request' && !event.details.body) && (
        <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
          {event.event === 'api-request'
            ? JSON.stringify(event.details.body, null, 2)
            : event.event === 'api-response'
            ? JSON.stringify(event.details.responseData, null, 2)
            : event.event === 'webhook-received'
            ? JSON.stringify(event.details.body, null, 2)
            : JSON.stringify(event.details, null, 2)
          }
        </pre>
      )}
    </div>
  );
}

