'use client';

import React from 'react';

interface IframeDisplayProps {
  iframeUrl: string;
}

export default function IframeDisplay({ iframeUrl }: IframeDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">CDK Flow Iframe</h2>
      {iframeUrl ? (
        <div className="w-full h-[800px] border border-gray-300 rounded-lg overflow-hidden">
          <iframe
            src={iframeUrl}
            title="CDK Flow"
            className="w-full h-full"
            frameBorder="0"
            allow="camera;autoplay;payment;publickey-credentials-get;publickey-credentials-create"
          />
        </div>
      ) : (
        <div className="w-full h-[950px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Submit the form on the left to load the CDK iframe</p>
          </div>
        </div>
      )}
    </div>
  );
}
