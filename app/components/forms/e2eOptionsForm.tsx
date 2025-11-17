import { FormEntryKey } from '@/app/cdk-flows/types'
import { useTranslation } from '../../utils/translations'

export default function E2EOptionsForm() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">{t('widgetOptions.title')}</h3>
      <div className="grid grid-cols-1 gap-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            name={FormEntryKey.SKIP_STEPS}
            value="true"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">{t('widgetOptions.skipSteps')}</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name={FormEntryKey.SKIP_DATA_NOTICES}
            value="true"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">{t('widgetOptions.skipDataNotices')}</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name={FormEntryKey.SKIP_VERIFICATION}
            value="true"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">{t('widgetOptions.skipVerification')}</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name={FormEntryKey.SKIP_PERMISSIONS}
            value="true"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">{t('widgetOptions.skipPermissions')}</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name={FormEntryKey.SKIP_PREFERENCES}
            value="true"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">{t('widgetOptions.skipPreferences')}</span>
        </label>
      </div>
    </div>
  )
}
