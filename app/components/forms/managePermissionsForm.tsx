import { FormEntryKey } from '@/app/cdk-flows/types'
import { useTranslation } from '../../utils/translations'

export default function ManagePermissionsForm() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={FormEntryKey.SESSION_ID} className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.sessionId')}
        </label>
        <input
          type="text"
          id={FormEntryKey.SESSION_ID}
          name={FormEntryKey.SESSION_ID}
          placeholder={t('placeholders.sessionIdExample')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor={FormEntryKey.EMAIL} className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.trustedAdultEmail')}
        </label>
        <input
          type="email"
          id={FormEntryKey.EMAIL}
          name={FormEntryKey.EMAIL}
          placeholder={t('placeholders.trustedAdultEmailExample')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
    </div>
  )
}
