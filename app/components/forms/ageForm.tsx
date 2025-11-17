import { AgeCategory, AgeType, FormEntryKey } from "@/app/cdk-flows/types"
import { useEffect, useState } from "react"
import { useTranslation } from "../../utils/translations"

export type AgeTypeFormProps = {
  value: AgeType,
  onChange: (value: AgeType) => void
  title?: string
}

export default function AgeForm({value, onChange, title}: AgeTypeFormProps) {
  const { t } = useTranslation();
  const [ageType, setAgeType] = useState<AgeType>(value)

  useEffect(() => {
    setAgeType(value)
  }, [value])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title ?? t('fields.verificationCriteria')}
      </label>
      <div className="flex space-x-4 mb-2">
        {Object.values(AgeType).map((value, index )=> {
          return (
            <label key={index} className="flex items-center">
              <input
                type="radio"
                name={FormEntryKey.AGE_TYPE}
                value={value}
                checked={ageType === value}
                onChange={(e) => onChange(e.target.value as AgeType)}
                className="mr-2"
              />
              <span className="text-sm">{t(`ageTypes.${value === AgeType.AGE ? 'age' : 'category'}`)}</span>
            </label>
          )
        })}
      </div>
      <div className="mb-2">
        <label htmlFor={FormEntryKey.AGE_CRITERIA} className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.age')}
        </label>
        <input
          type="number"
          id={FormEntryKey.AGE_CRITERIA}
          name={FormEntryKey.AGE_CRITERIA}
          min="0"
          max="120"
          disabled={ageType !== AgeType.AGE}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            ageType !== AgeType.AGE ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
          }`}
          placeholder={t('placeholders.enterAge')}
          required={ageType === AgeType.AGE}
        />
      </div>
      <div className="mb-2">
        <label htmlFor={FormEntryKey.AGE_CATEGORY} className="block text-sm font-medium text-gray-700 mb-2">
          {t('fields.ageCategory')}
        </label>
        <select
          id={FormEntryKey.AGE_CATEGORY}
          name={FormEntryKey.AGE_CATEGORY}
          defaultValue={AgeCategory.ADULT}
          disabled={ageType !== AgeType.CATEGORY}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            ageType !== AgeType.CATEGORY ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
          }`}
          required={ageType === AgeType.CATEGORY}
        >
          {Object.values(AgeCategory).map((value, index) => (
            <option key={index} value={value}>{value}</option>
          ))}
        </select>
      </div>
    </div>
  )
}