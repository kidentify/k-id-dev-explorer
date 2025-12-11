'use client';

import React from 'react';
import { useTranslation } from '../utils/translations';

interface IframeDisplayProps {
  iframeUrl: string;
}

/**
 * Component that displays the CDK flow in an iframe.
 *
 * This component embeds the URL returned from the k-ID API into an iframe element.
 * The URL is obtained from the API response after calling performCDKFlow() and
 * contains the k-ID verification interface that users interact with.
 *
 * The iframe includes necessary permissions (camera, autoplay, payment, etc.) that
 * may be required during the verification process.
 *
 * @param iframeUrl - The URL returned from the k-ID CDK flow API response
 *
 *
 * The iframe height is set to 850px when a URL is provided. You may need to adjust
 * this based on your application's layout requirements.
 */
export default function IframeDisplay({ iframeUrl }: IframeDisplayProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('widget.iframe')}</h2>
      {iframeUrl ? (
        // Embed the CDK flow URL in an iframe
        // The URL is obtained from the API response (see performCDKFlow in serverActions.ts)
        <div className="w-full h-[850px] border border-gray-300 rounded-lg overflow-hidden">
          <iframe
            src={iframeUrl}
            title="CDK Flow"
            className="w-full h-full"
            // Required permissions for CDK flows
            // Camera: For facial age estimation and ID verification
            // Autoplay: For media playback during verification
            // Payment: For payment processing if required
            // Public key credentials: For WebAuthn authentication
            allow="camera;autoplay;payment;publickey-credentials-get;publickey-credentials-create"
          />
        </div>
      ) : (
        <div className="w-full h-[990px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>{t('events.submitFormToLoad')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
