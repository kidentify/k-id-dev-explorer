import { AgeType, FormEntryKey } from "@/app/cdk-flows/types"
import { useState } from "react"
import Jurisdiction from "./jurisdictionForm"
import AgeForm from "./ageForm"
import { useTranslation } from "../../utils/translations"

export type FormEntry = {
  required?: boolean,
  title?: string,
}

export type VerificationFormProps = {
  ageCriteria?: FormEntry,
  dob?: FormEntry,
  age?: FormEntry,
  email?: FormEntry,
  id?: FormEntry,
  kuid?: FormEntry,
  locale?: FormEntry,
}

export default function VerificationForm(props: VerificationFormProps) {
  const { t } = useTranslation();
  const [ageType, setAgeType] = useState<AgeType>(AgeType.CATEGORY)

  return (
    <div>
      <Jurisdiction />
      {props.ageCriteria && <AgeForm value={ageType} onChange={setAgeType} title={props.ageCriteria.title} />}
      {props.dob && (
        <div className="mb-2">
          <label htmlFor={FormEntryKey.DOB} className="block text-sm font-medium text-gray-700 mb-2">
            {(props.dob.title ?? t('fields.claimedDateOfBirth')) + (!props.dob.required ? ` ${t('common.optional')}` : '')}
          </label>
          <input
            type="date"
            id={FormEntryKey.DOB}
            name={FormEntryKey.DOB}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('placeholders.dateFormat')}
            onChange={(e) => {
              const ageInput = document.getElementById('age') as HTMLInputElement | null
              if (ageInput) {
                ageInput.disabled = !!e.target.value
                if (e.target.value) ageInput.value = ''
              }
            }}
            required={props.dob.required}
          />
        </div>
      )}
      
      {props.age && (
        <div className="mb-2">
          <label htmlFor={FormEntryKey.AGE} className="block text-sm font-medium text-gray-700 mb-2">
            {(props.age.title ?? t('fields.claimedAge')) + (!props.age.required ? ` ${t('common.optional')}` : '')}
          </label>
          <input
            type="number"
            id={FormEntryKey.AGE}
            name={FormEntryKey.AGE}
            min="0"
            max="120"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('placeholders.enterClaimedAge')}
            onChange={(e) => {
              const dobInput = document.getElementById('dob') as HTMLInputElement | null
              if (dobInput) {
                dobInput.disabled = !!e.target.value
                if (e.target.value) dobInput.value = ''
              }
            }}
            required={props.age.required}
          />
        </div>
      )}
      {props.email && (
        <div className="mb-2">
          <label htmlFor={FormEntryKey.EMAIL} className="block text-sm font-medium text-gray-700 mb-2">
            {(props.email.title ?? t('fields.subjectEmail')) + (!props.email.required ? ` ${t('common.optional')}` : '')}
          </label>
          <input
            type="email"
            id={FormEntryKey.EMAIL}
            name={FormEntryKey.EMAIL}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('placeholders.enterSubjectEmail')}
            required={props.email.required}
          />
        </div>
      )}
      {props.id && (
        <div className="mb-2">
          <label htmlFor={FormEntryKey.ID} className="block text-sm font-medium text-gray-700 mb-2">
            {(props.id.title ?? t('fields.subjectId')) + (!props.id.required ? ` ${t('common.optional')}` : '')}
          </label>
          <input
            type="text"
            id={FormEntryKey.ID}
            name={FormEntryKey.ID}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('placeholders.enterSubjectId')}
            required={props.id.required}
          />
        </div>
      )}
      {props.kuid && (
        <div className="mb-2">
          <label htmlFor={FormEntryKey.KUID} className="block text-sm font-medium text-gray-700 mb-2">
            {(props.kuid.title ?? t('fields.kuid')) + (!props.kuid.required ? ` ${t('common.optional')}` : '')}
          </label>
          <input
            type="text"
            id={FormEntryKey.KUID}
            name={FormEntryKey.KUID}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('placeholders.enterKuid')}
            required={props.kuid.required}
          />
        </div>
      )}
      {props.locale && (
        <div className="mb-2">
          <label htmlFor={FormEntryKey.LOCALE} className="block text-sm font-medium text-gray-700 mb-2">
            {(props.locale.title ?? t('fields.locale')) + (!props.locale.required ? ` ${t('common.optional')}` : '')}
          </label>
          <input
            type="text"
            id={FormEntryKey.LOCALE}
            name={FormEntryKey.LOCALE}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('placeholders.localeExample')}
            required={props.locale.required}
          />
        </div>
      )}
    </div>
  )
}