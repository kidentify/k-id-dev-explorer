import DevToolWrapper from './components/DevToolWrapper';
import Image from 'next/image';
import Link from 'next/link';
import { t } from './utils/translations';

export default function Home() {
  // Server-side environment variable check
  const apiKeyStatus = {
    isConfigured: Boolean(process.env.K_ID_API_KEY && process.env.K_ID_API_KEY !== 'your_api_key_here'),
    apiUrl: process.env.K_ID_API_URL || 'https://game-api.test.k-id.com'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1940px] mx-auto">
        {/* Header */}
        <div className="mb-8">
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
              <h1 className="text-3xl font-bold text-gray-900">{t('header.title')}</h1>
              <p className="text-gray-600 mt-2">
              {t('header.subtitle')}
                <a
                  href="https://docs.k-id.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-1 underline"
                >
                  {t('header.viewDocumentation')}
                </a>
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/specialized"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#745eee] hover:text-[#5a45d6] border border-[#745eee] hover:bg-[#f4f2fe] rounded-lg px-4 py-2 transition-colors"
            >
              {t('specialized.navLink')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Main Developer Tool */}
        <DevToolWrapper apiKeyStatus={apiKeyStatus} />
      </div>
    </div>
  );
}
