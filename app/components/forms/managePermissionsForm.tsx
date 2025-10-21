import { FormEntryKey } from '@/app/cdk-flows/types'

export default function ManagePermissionsForm() {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={FormEntryKey.SESSION_ID} className="block text-sm font-medium text-gray-700 mb-2">
          Session ID
        </label>
        <input
          type="text"
          id={FormEntryKey.SESSION_ID}
          name={FormEntryKey.SESSION_ID}
          placeholder="e.g. b1a6482d-5242-4b4a-aa88-3fa52595a672"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor={FormEntryKey.EMAIL} className="block text-sm font-medium text-gray-700 mb-2">
          Trusted Adult Email
        </label>
        <input
          type="email"
          id={FormEntryKey.EMAIL}
          name={FormEntryKey.EMAIL}
          placeholder="e.g. parent@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
    </div>
  )
}
