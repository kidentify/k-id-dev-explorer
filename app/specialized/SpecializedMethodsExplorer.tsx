'use client'

import { useCallback, useMemo, useState } from 'react'
import jurisdictions from '../data/jurisdictions.json'
import { performCDKFlow } from '../cdk-flows/serverActions'
import { AgeCategory, AgeType, EventDetails, EventLog, FormEntryKey, RequestType } from '../cdk-flows/types'
import { formatErrorForDisplay } from '../utils/errorUtils'
import { useTranslation } from '../utils/translations'
import IframeDisplay from '../components/IframeDisplay'
import EventsTraffic from '../components/EventsTraffic'
import NativeAppSimulation from './NativeAppSimulation'
import { SPECIALIZED_METHODS, SpecializedMethod, SpecializedMethodId } from './methods'

interface ApiKeyStatus {
  isConfigured: boolean
  apiUrl: string
}

interface SpecializedMethodsExplorerProps {
  apiKeyStatus: ApiKeyStatus
}

type AgeMode = 'age' | 'dob' | 'none'
type CriteriaType = 'age' | 'category'

function jurisdictionLabel(entry: [string, string | string[]]): string {
  return typeof entry[1] === 'string' ? entry[1] : entry[1][0]
}

/**
 * Demo of the customized specialized age verification experience, split into
 * three concerns that stay visually and structurally separate:
 *
 *  1. Settings — the integrator toggles which of the three specialized methods
 *     (facial age estimation, ID verification, AgeKey) to offer and sets the
 *     shared parameters (jurisdiction + verification criteria + optional age /
 *     DOB) applied to every method.
 *  2. Native UI simulation — a phone-framed mock of the host app's own method
 *     picker, built live from the enabled methods (see NativeAppSimulation).
 *     Tapping a row calls performCDKFlow() for that method's CDK flow.
 *  3. k-ID screen — the returned widget URL is embedded via IframeDisplay, i.e.
 *     "once the user taps an option, it loads k-ID's screen".
 *
 * EventsTraffic logs the underlying API request/response, mirroring the main
 * CDK Flows explorer.
 */
export default function SpecializedMethodsExplorer({ apiKeyStatus }: SpecializedMethodsExplorerProps) {
  const { t } = useTranslation()

  const [enabled, setEnabled] = useState<Record<SpecializedMethodId, boolean>>({
    facial: true,
    id: true,
    agekey: true,
    connectid: true,
    creditcard: true,
    trustedadult: true,
    inference: true,
  })

  // Shared parameters applied to every method.
  const [jurisdiction, setJurisdiction] = useState('US')
  // Verification criteria — the age gate each method checks against. Required by
  // the perform-* endpoints ("age or age category is required").
  const [criteriaType, setCriteriaType] = useState<CriteriaType>('age')
  const [criteriaAge, setCriteriaAge] = useState('18')
  const [criteriaCategory, setCriteriaCategory] = useState<AgeCategory>(AgeCategory.ADULT)
  // Optional claimed subject info.
  const [ageMode, setAgeMode] = useState<AgeMode>('none')
  const [age, setAge] = useState('')
  const [dob, setDob] = useState('')
  // Email — required by trusted adult + inference-based verification.
  const [email, setEmail] = useState('')
  // Facial age estimation tuning (options.facialAgeEstimation.passIfOver / failIfUnder).
  const [passIfOver, setPassIfOver] = useState('')
  const [failIfUnder, setFailIfUnder] = useState('')

  // Preview / result state (mirrors DevToolWrapper wiring for IframeDisplay).
  const [iframeUrl, setIframeUrl] = useState('')
  const [shortUrl, setShortUrl] = useState<string | undefined>(undefined)
  const [verificationId, setVerificationId] = useState<string | undefined>(undefined)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [activeMethod, setActiveMethod] = useState<SpecializedMethodId | null>(null)
  const [error, setError] = useState('')

  // Local event log (the specialized route manages its own instead of the
  // CDKFlowDevTool ref plumbing).
  const [eventLogs, setEventLogs] = useState<EventLog[]>([])
  const addEvent = useCallback((event: string, type: RequestType = RequestType.INFO, details?: EventDetails) => {
    setEventLogs((prev) => [
      { timestamp: new Date().toLocaleTimeString(), event, type, details },
      ...prev.slice(0, 49),
    ])
  }, [])

  const sortedJurisdictions = useMemo(
    () =>
      Object.entries(jurisdictions).sort((a, b) =>
        jurisdictionLabel(a).localeCompare(jurisdictionLabel(b)),
      ),
    [],
  )

  const selectedMethods = useMemo(
    () => SPECIALIZED_METHODS.filter((m) => enabled[m.id]),
    [enabled],
  )

  const toggle = (id: SpecializedMethodId) =>
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))

  const contextSummary = useMemo(() => {
    const region = jurisdictionLabel(
      [jurisdiction, (jurisdictions as Record<string, string | string[]>)[jurisdiction] ?? jurisdiction],
    )
    const parts = [region]
    parts.push(criteriaType === 'age' ? `${t('specialized.criteria')}: ${criteriaAge}+` : `${t('specialized.criteria')}: ${criteriaCategory}`)
    if (ageMode === 'age' && age) parts.push(`${t('fields.claimedAge')}: ${age}`)
    if (ageMode === 'dob' && dob) parts.push(`${t('fields.claimedDateOfBirth')}: ${dob}`)
    return parts.join(' · ')
  }, [jurisdiction, criteriaType, criteriaAge, criteriaCategory, ageMode, age, dob, t])

  const handlePickMethod = async (method: SpecializedMethod) => {
    if (activeMethod) return
    setError('')

    // Guard methods that need an email before firing the request.
    if (method.requiresEmail && !email.trim()) {
      setError(t('specialized.emailRequired'))
      return
    }

    setActiveMethod(method.id)
    setIframeUrl('')
    setShortUrl(undefined)
    setVerificationId(undefined)
    setChallengeId(null)

    try {
      if (!apiKeyStatus.isConfigured) {
        throw new Error(t('errors.apiKeyNotConfigured'))
      }

      // Build the shared FormData the flow handlers expect. Only jurisdiction is
      // always sent; age / DOB map to subject.claimedAge / claimedDateOfBirth.
      const formData = new FormData()
      formData.set('flow', method.flow)
      formData.set(FormEntryKey.JURISDICTION, jurisdiction)
      // Verification criteria (required by the perform-* endpoints).
      if (criteriaType === 'age') {
        formData.set(FormEntryKey.AGE_TYPE, AgeType.AGE)
        formData.set(FormEntryKey.AGE_CRITERIA, criteriaAge)
      } else {
        formData.set(FormEntryKey.AGE_TYPE, AgeType.CATEGORY)
        formData.set(FormEntryKey.AGE_CATEGORY, criteriaCategory)
      }
      // Optional claimed subject info (age / DOB).
      if (ageMode === 'age' && age) formData.set(FormEntryKey.AGE, age)
      if (ageMode === 'dob' && dob) formData.set(FormEntryKey.DOB, dob)
      // Email (required by trusted adult + inference-based verification).
      if (email.trim()) formData.set(FormEntryKey.EMAIL, email.trim())
      // Facial age estimation thresholds — only meaningful for the facial flow.
      if (method.id === 'facial') {
        if (passIfOver.trim()) formData.set(FormEntryKey.PASS_IF_OVER, passIfOver.trim())
        if (failIfUnder.trim()) formData.set(FormEntryKey.FAIL_IF_UNDER, failIfUnder.trim())
      }

      const result = await performCDKFlow(method.flow, formData)

      if (result.requestData) {
        addEvent('api-request', RequestType.REQUEST, result.requestData)
      }

      if (result.success && result.url) {
        addEvent('api-response', RequestType.RESPONSE, {
          id: result.id,
          url: result.url,
          shortUrl: result.shortUrl,
          responseData: result.responseData,
        })
        setIframeUrl(result.url)
        setShortUrl(result.shortUrl)
        setVerificationId(result.id)
        setChallengeId(result.challengeId ?? null)
      } else {
        addEvent('api-error', RequestType.ERROR, { error: result.error })
        setError(formatErrorForDisplay(result.error || t('errors.anErrorOccurred')))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.anErrorOccurred')
      addEvent('api-error', RequestType.ERROR, { error: message })
      setError(message)
    } finally {
      setActiveMethod(null)
    }
  }

  const downloadEventLog = useCallback(() => {
    if (eventLogs.length === 0) return
    const content = eventLogs
      .map((e) => {
        const details = e.details ? '\n' + JSON.stringify(e.details, null, 2) : ''
        return `${e.timestamp} [${e.type?.toUpperCase() || 'INFO'}] ${e.event}${details}`
      })
      .join('\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `specialized-methods-events-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [eventLogs])

  const clearLogs = useCallback(() => setEventLogs([]), [])
  const copyEvent = useCallback((event: EventLog) => {
    navigator.clipboard.writeText(JSON.stringify(event.details ?? event, null, 2)).catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
      {/* Column 1 — Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t('specialized.settingsTitle')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('specialized.settingsHelp')}</p>
        </div>

        {/* Method selection — plain checklist */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">{t('specialized.methodsLabel')}</h3>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-md">
            {SPECIALIZED_METHODS.map((method) => (
              <label
                key={method.id}
                className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={enabled[method.id]}
                  onChange={() => toggle(method.id)}
                  className="mt-0.5 h-4 w-4 accent-[#745eee] cursor-pointer"
                />
                <span className="min-w-0">
                  <span className="block text-sm text-gray-800">
                    {t(`specialized.methods.${method.titleKey}`)}
                  </span>
                  <span className="block text-xs text-gray-400">
                    {t(`specialized.methods.${method.descKey}`)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Facial age estimation options (only when that method is selected) */}
        {enabled.facial && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('specialized.faeOptions')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fae-pass-if-over" className="block text-xs font-medium text-gray-600 mb-1">
                  {t('fields.passIfOver')}
                </label>
                <input
                  id="fae-pass-if-over"
                  type="number"
                  min="0"
                  max="100"
                  value={passIfOver}
                  onChange={(e) => setPassIfOver(e.target.value)}
                  placeholder={t('placeholders.passIfOverExample')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="fae-fail-if-under" className="block text-xs font-medium text-gray-600 mb-1">
                  {t('fields.failIfUnder')}
                </label>
                <input
                  id="fae-fail-if-under"
                  type="number"
                  min="0"
                  max="100"
                  value={failIfUnder}
                  onChange={(e) => setFailIfUnder(e.target.value)}
                  placeholder={t('placeholders.failIfUnderExample')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('fields.facialAgeEstimationHelp')}</p>
          </div>
        )}

        {/* Shared parameters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">{t('specialized.sharedParams')}</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="specialized-jurisdiction" className="block text-sm font-medium text-gray-700 mb-1">
                {t('fields.jurisdiction')}
              </label>
              <select
                id="specialized-jurisdiction"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {sortedJurisdictions.map((entry) => (
                  <option key={entry[0]} value={entry[0]}>
                    {jurisdictionLabel(entry)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('specialized.criteria')}
              </label>
              <div className="flex gap-2 mb-2">
                {(['age', 'category'] as CriteriaType[]).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setCriteriaType(type)}
                    className={`text-xs px-3 py-1.5 rounded border ${
                      criteriaType === type
                        ? 'border-[#745eee] bg-[#f4f2fe] text-[#5a45d6]'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t(`ageTypes.${type}`)}
                  </button>
                ))}
              </div>
              {criteriaType === 'age' ? (
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={criteriaAge}
                  onChange={(e) => setCriteriaAge(e.target.value)}
                  placeholder={t('placeholders.enterAge')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <select
                  value={criteriaCategory}
                  onChange={(e) => setCriteriaCategory(e.target.value as AgeCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(AgeCategory).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">{t('specialized.criteriaHelp')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('specialized.ageInput')} <span className="text-gray-400 font-normal">{t('common.optional')}</span>
              </label>
              <div className="flex gap-2 mb-2">
                {(['none', 'age', 'dob'] as AgeMode[]).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setAgeMode(mode)}
                    className={`text-xs px-3 py-1.5 rounded border ${
                      ageMode === mode
                        ? 'border-[#745eee] bg-[#f4f2fe] text-[#5a45d6]'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t(`specialized.ageMode.${mode}`)}
                  </button>
                ))}
              </div>
              {ageMode === 'age' && (
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={t('placeholders.enterClaimedAge')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              {ageMode === 'dob' && (
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>

            <div>
              <label htmlFor="specialized-email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('fields.subjectEmail')}{' '}
                <span className="text-gray-400 font-normal">{t('specialized.emailHint')}</span>
              </label>
              <input
                id="specialized-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('placeholders.enterSubjectEmail')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
          {t('specialized.contextLabel')}: {contextSummary}
        </p>
      </div>

      {/* Column 2 — Native UI simulation */}
      <div className="flex flex-col gap-4">
        <NativeAppSimulation
          methods={selectedMethods}
          onPick={handlePickMethod}
          activeMethodId={activeMethod}
          busy={activeMethod !== null}
        />
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Column 3 — k-ID screen (loaded once the user taps a method) */}
      <div className="flex flex-col gap-4">
        <IframeDisplay
          iframeUrl={iframeUrl}
          shortUrl={shortUrl}
          verificationId={verificationId}
          challengeId={challengeId}
          addEvent={addEvent}
        />
      </div>

      {/* Column 4 — Events & API traffic */}
      <div className="flex flex-col">
        <EventsTraffic
          eventLogs={eventLogs}
          onDownload={downloadEventLog}
          onClear={clearLogs}
          onCopy={copyEvent}
        />
      </div>
    </div>
  )
}
