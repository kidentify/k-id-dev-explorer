import Link from 'next/link'
import Image from 'next/image'
import SpecializedMethodsExplorer from './SpecializedMethodsExplorer'
import { t } from '../utils/translations'

export default function SpecializedMethodsPage() {
  // Server-side environment variable check (mirrors app/page.tsx).
  const apiKeyStatus = {
    isConfigured: Boolean(process.env.K_ID_API_KEY && process.env.K_ID_API_KEY !== 'your_api_key_here'),
    apiUrl: process.env.K_ID_API_URL || 'https://game-api.test.k-id.com',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1940px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-[#745eee] hover:text-[#5a45d6] inline-flex items-center gap-1 mb-4"
          >
            {t('specialized.backToExplorer')}
          </Link>
          <div className="flex items-center gap-4">
            <Image
              src="/logo.webp"
              alt="k-ID Logo"
              width={48}
              height={48}
              className="w-12 h-12"
              style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(246deg) brightness(91%) contrast(101%)' }}
              priority
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('specialized.pageTitle')}</h1>
              <p className="text-gray-600 mt-2">{t('specialized.pageSubtitle')}</p>
            </div>
          </div>
        </div>

        <SpecializedMethodsExplorer apiKeyStatus={apiKeyStatus} />
      </div>
    </div>
  )
}
