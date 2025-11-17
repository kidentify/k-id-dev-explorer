'use client';

import { EventLog } from '../cdk-flows/types';
import EventLogDisplay from './EventLogDisplay';
import { useTranslation } from '../utils/translations';

interface EventsTrafficProps {
  eventLogs: EventLog[];
  onDownload: () => void;
  onClear: () => void;
  onCopy: (event: EventLog) => void;
}

export default function EventsTraffic({ eventLogs, onDownload, onClear, onCopy }: EventsTrafficProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">{t('events.title')}</h2>
        <div className="flex items-center gap-3">
          {eventLogs.length > 0 && (
            <button
              onClick={onDownload}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              title={t('events.downloadLog')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {t('common.download')}
            </button>
          )}
          <button onClick={onClear} className="text-sm text-gray-600 hover:text-gray-800">
            {t('events.clearLogs')}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded border p-3 space-y-2 min-h-0">
        {eventLogs.length === 0 ? (
          <p className="text-gray-500 text-sm">{t('events.noEvents')}</p>
        ) : (
          eventLogs.map((event, index) => <EventLogDisplay key={index} event={event} onCopy={onCopy} />)
        )}
      </div>
    </div>
  );
}

