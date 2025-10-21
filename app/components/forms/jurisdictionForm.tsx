import { useMemo, useState } from "react"

import jurisdictions from "../../data/jurisdictions.json"
import { FormEntryKey } from "@/app/cdk-flows/types";

function getLabelFromEntry(entry: [string, string | string[]]): string {
  return typeof entry[1] === 'string' ? entry[1] : entry[1][0]
}

export default function Jurisdiction() {
  const [value, setValue] = useState<string>("US")

  const sortedJurisdictions = useMemo(() => {
    return Object.entries(jurisdictions).sort((a, b) => {
      return getLabelFromEntry(a).localeCompare(getLabelFromEntry(b))
    }).reduce<Record<string, string | string[]>>((acc, value) => {
      acc[value[0]] = value[1]
      return acc
    }, {})
  }, []);

  return (
    <div className="mb-2">
      <label htmlFor={FormEntryKey.JURISDICTION} className="block text-sm font-medium text-gray-700 mb-2">
        Jurisdiction
      </label>
      <select
        id={FormEntryKey.JURISDICTION}
        name={FormEntryKey.JURISDICTION}
        defaultValue={value}
        onChange={(event) => { setValue(event.target.value) }}
        className={'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'}
        required
      >
        {Object.entries(sortedJurisdictions).map((entry) => (
          <option key={entry[0]} value={entry[0]}>{getLabelFromEntry(entry)}</option>
        ))}
      </select>
    </div>
  )
}