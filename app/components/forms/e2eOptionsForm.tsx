import { FormEntryKey } from '@/app/cdk-flows/types'

export default function E2EOptionsForm() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Widget Options</h3>
      <div className="grid grid-cols-1 gap-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            name={FormEntryKey.SKIP_STEPS}
            value="true"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">Skip Steps</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name={FormEntryKey.SKIP_DATA_NOTICES}
            value="true"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">Skip Data Notices</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name={FormEntryKey.SKIP_VERIFICATION}
            value="true"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">Skip Verification</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name={FormEntryKey.SKIP_PERMISSIONS}
            value="true"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">Skip Permissions</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name={FormEntryKey.SKIP_PREFERENCES}
            value="true"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">Skip Preferences</span>
        </label>
      </div>
    </div>
  )
}
