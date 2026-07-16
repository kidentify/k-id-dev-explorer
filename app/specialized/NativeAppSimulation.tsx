'use client'

import { useTranslation } from '../utils/translations'
import { SpecializedMethod, SpecializedMethodId } from './methods'

interface NativeAppSimulationProps {
  /** The methods enabled in Settings, in the order they should appear. */
  methods: SpecializedMethod[]
  /** Fired when the end-user taps a method row in the simulated app screen. */
  onPick: (method: SpecializedMethod) => void
  /** The method whose k-ID screen is currently loading (shows a row spinner). */
  activeMethodId: SpecializedMethodId | null
  /** Disables all rows while a pick is in flight. */
  busy: boolean
}

/**
 * A "native" UI simulation — a phone-framed mock of the age-method picker as it
 * would appear inside a real app or website (the integrator's own screen), kept
 * deliberately separate from the k-ID widget and from the Settings panel. It is
 * built from the methods enabled in Settings; tapping a row hands off to
 * performCDKFlow() (via onPick), which loads k-ID's screen in the adjacent
 * iframe. This is the polished, consumer-facing surface of the demo.
 */
export default function NativeAppSimulation({
  methods,
  onPick,
  activeMethodId,
  busy,
}: NativeAppSimulationProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('specialized.nativeSimTitle')}</h2>
      <p className="text-sm text-gray-500 mb-4">{t('specialized.nativeSimHelp')}</p>

      {/* Phone frame */}
      <div className="mx-auto w-full max-w-[380px]">
        <div className="rounded-[2.25rem] border border-gray-200 shadow-lg ring-1 ring-black/5 bg-white overflow-hidden">
          <div className="h-[720px] flex flex-col bg-white">
            <div className="pt-5" />

            {methods.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-gray-400">
                {t('specialized.native.empty')}
              </div>
            ) : (
              <div className="flex-1 px-6 pt-2 overflow-y-auto">
                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                    {t('specialized.native.title')}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {t('specialized.native.subtitle')}
                  </p>
                </div>

                <div className="space-y-3">
                  {methods.map((method) => {
                    const rowBusy = activeMethodId === method.id
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => onPick(method)}
                        disabled={busy}
                        className={`group w-full flex items-center gap-3.5 p-3.5 rounded-2xl border bg-white text-left transition-all ${
                          rowBusy
                            ? 'border-[#745eee] shadow-sm'
                            : 'border-gray-200 hover:border-[#c9bff8] hover:shadow-md'
                        } ${busy && !rowBusy ? 'opacity-50' : ''}`}
                      >
                        <span className={`shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${method.accent}`}>
                          {method.icon}
                        </span>
                        <span className="flex-1 text-[15px] font-medium text-gray-900">
                          {t(`specialized.native.methods.${method.id}`)}
                        </span>
                        {rowBusy ? (
                          <svg className="animate-spin w-5 h-5 text-[#745eee]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="shrink-0 w-5 h-5 text-gray-300 group-hover:text-[#745eee] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
