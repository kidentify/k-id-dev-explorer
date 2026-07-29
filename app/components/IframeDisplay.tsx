'use client';

import React, { useEffect, useRef, useState } from 'react';
import QrCode from './QrCode';
import { AddEventMethod, RequestType } from '../cdk-flows/types';
import { useTranslation } from '../utils/translations';
import { subscribeWebhookEvents } from '../utils/webhookEvents';

interface IframeDisplayProps {
  iframeUrl: string;
  shortUrl?: string;
  verificationId?: string;
  challengeId?: string | null;
  addEvent?: AddEventMethod;
}

type Device = 'mobile' | 'tablet';
type Orientation = 'portrait' | 'landscape';

const DEVICE_SIZES: Record<Device, Record<Orientation, { w: number; h: number }>> = {
  mobile: {
    portrait: { w: 375, h: 812 },
    landscape: { w: 812, h: 375 },
  },
  tablet: {
    portrait: { w: 768, h: 1024 },
    landscape: { w: 1024, h: 768 },
  },
};

type ResultKind = 'waiting' | 'pass' | 'fail';

interface ResultState {
  kind: ResultKind;
  status?: string;
  age?: { low?: number; high?: number };
  ageCategory?: string;
  method?: string;
  failureReason?: string;
  sessionId?: string;
  approverEmail?: string;
}

// Webhook payload shapes vary across event types (Verification.Result vs
// Challenge.StateChange etc.). Look at a few common places for the id.
function extractIds(body: unknown): { verificationId?: string; challengeId?: string } {
  if (!body || typeof body !== 'object') return {};
  const b = body as Record<string, unknown>;
  const eventType = (b.eventType ?? b.type) as string | undefined;
  const data = (b.data ?? {}) as Record<string, unknown>;
  return {
    verificationId:
      (b.verificationId as string | undefined) ??
      (data.verificationId as string | undefined) ??
      (eventType && /verification/i.test(eventType) ? (data.id as string | undefined) : undefined),
    challengeId:
      (b.challengeId as string | undefined) ??
      (data.challengeId as string | undefined) ??
      (eventType && /challenge/i.test(eventType) ? (data.id as string | undefined) : undefined),
  };
}

/**
 * Component that displays the CDK flow in an iframe, adds a device / orientation
 * preview toggle for the widget's own responsive layout, and shows a Console
 * section (QR + short URL + Copy / Open in new tab). Subscribes to the shared
 * webhook SSE stream and, when a Verification.Result / Challenge.StateChange
 * payload matches the current verificationId or challengeId, overlays the QR
 * with a PASS ✓ / FAIL ✗ label.
 */
export default function IframeDisplay({
  iframeUrl,
  shortUrl,
  verificationId,
  challengeId,
  addEvent,
}: IframeDisplayProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState<Device>('mobile');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [result, setResult] = useState<ResultState>({ kind: 'waiting' });

  const bareTargetUrl = shortUrl && shortUrl.length > 0 ? shortUrl : iframeUrl;
  const qrValue = bareTargetUrl;

  useEffect(() => {
    setResult({ kind: 'waiting' });
  }, [verificationId, challengeId]);

  // Listen to /api/webhook/events. When a matching Verification.Result /
  // Challenge.StateChange arrives, flip to the pass / fail overlay. Falls
  // through silently if webhooks aren't wired (Compliance Studio must be
  // pointing at the ngrok URL).
  useEffect(() => {
    if (!verificationId && !challengeId) return;
    return subscribeWebhookEvents((payload) => {
      const parsed = payload as { type?: string; data?: { body?: unknown } };
      if (parsed?.type !== 'webhook') return;
      const body = parsed.data?.body;
      const ids = extractIds(body);
      const matchesVerification = !!verificationId && ids.verificationId === verificationId;
      const matchesChallenge = !!challengeId && ids.challengeId === challengeId;
      if (!matchesVerification && !matchesChallenge) return;
      const data = ((body as { data?: unknown } | undefined)?.data ?? {}) as Record<string, unknown>;
      const rawStatus = data.status as string | undefined;
      const kind: ResultKind = (rawStatus ?? '').toUpperCase() === 'FAIL' ? 'fail' : 'pass';
      setResult({
        kind,
        status: rawStatus,
        age: data.age as { low?: number; high?: number } | undefined,
        ageCategory: data.ageCategory as string | undefined,
        method: data.method as string | undefined,
        failureReason: (data.failureReason ?? data.reason) as string | undefined,
        sessionId: data.sessionId as string | undefined,
        approverEmail: data.approverEmail as string | undefined,
      });
      addEvent?.('webhook-result', RequestType.INFO, {
        matched: matchesVerification ? 'verificationId' : 'challengeId',
        verificationId: matchesVerification ? verificationId : undefined,
        challengeId: matchesChallenge ? challengeId : undefined,
        ...data,
      });
    });
  }, [verificationId, challengeId, addEvent]);

  const handleCopy = () => {
    if (!bareTargetUrl) return;
    navigator.clipboard
      .writeText(bareTargetUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => {
        console.error('Failed to copy widget URL:', err);
      });
  };

  const handleOpenInNewTab = () => {
    if (!iframeUrl) return;
    window.open(iframeUrl, '_blank', 'noopener,noreferrer');
  };

  const { w: frameW, h: frameH } = DEVICE_SIZES[device][orientation];
  const [containerWidth, setContainerWidth] = useState(0);
  const roRef = useRef<ResizeObserver | null>(null);
  const outerRef = React.useCallback((el: HTMLDivElement | null) => {
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    if (!el) return;
    setContainerWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    ro.observe(el);
    roRef.current = ro;
  }, []);
  const scale =
    containerWidth > 0 && frameW > containerWidth ? containerWidth / frameW : 1;
  const scaledOuterHeight = Math.round(frameH * scale);

  const resultDetail = (() => {
    if (result.kind === 'pass') {
      const parts: string[] = [];
      if (result.ageCategory) parts.push(result.ageCategory);
      if (result.method) parts.push(result.method);
      if (result.age?.low != null && result.age?.high != null) {
        parts.push(`age ${result.age.low}–${result.age.high}`);
      }
      if (result.sessionId) parts.push(`session ${result.sessionId.slice(0, 8)}…`);
      if (result.approverEmail) parts.push(result.approverEmail);
      return parts.join(' · ');
    }
    if (result.kind === 'fail') return result.failureReason ?? '';
    return '';
  })();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('widget.iframe')}</h2>
      {iframeUrl ? (
        <>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t('preview.device')}</span>
              {(['mobile', 'tablet'] as Device[]).map((key) => {
                const active = device === key;
                return (
                  <button
                    key={key}
                    onClick={() => setDevice(key)}
                    className={`text-xs px-2 py-1 rounded border ${
                      active
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {key === 'mobile' ? t('preview.mobile') : t('preview.tablet')}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t('preview.orientation')}</span>
              {(['portrait', 'landscape'] as Orientation[]).map((key) => {
                const active = orientation === key;
                return (
                  <button
                    key={key}
                    onClick={() => setOrientation(key)}
                    className={`text-xs px-2 py-1 rounded border ${
                      active
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {key === 'portrait' ? t('preview.portrait') : t('preview.landscape')}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-gray-400">{frameW} × {frameH}</span>
          </div>
          <div
            ref={outerRef}
            className="w-full overflow-hidden min-w-0"
            style={{ height: scaledOuterHeight }}
          >
            <div
              style={{
                width: frameW,
                height: frameH,
                transform: scale < 1 ? `scale(${scale})` : undefined,
                transformOrigin: 'top left',
                margin: scale === 1 ? '0 auto' : undefined,
                border: '1px solid #d1d5db',
                borderRadius: 8,
                overflow: 'hidden',
                background: 'white',
              }}
            >
              <iframe
                src={iframeUrl}
                title="CDK Flow"
                style={{ width: '100%', height: '100%', border: 0 }}
                allow="camera;autoplay;payment;publickey-credentials-get;publickey-credentials-create"
              />
            </div>
          </div>
          <div className="mt-4 p-4 rounded-md bg-gray-50 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('console.title')}</h3>
            <div className="flex items-start gap-4">
              <div className="shrink-0 relative">
                <QrCode value={qrValue} size={140} label={t('console.scanOnPhone')} />
                {(result.kind === 'pass' || result.kind === 'fail') && (
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center rounded ${
                      result.kind === 'pass' ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'
                    }`}
                    aria-live="polite"
                  >
                    <div className="text-3xl font-bold tracking-wide">
                      {result.kind === 'pass' ? 'PASS' : 'FAIL'}
                    </div>
                    <div className="text-[10px] mt-1 opacity-90">
                      {result.kind === 'pass' ? t('console.verified') : t('console.notVerified')}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-1">{shortUrl ? t('console.shortUrl') : t('console.widgetUrl')}</p>
                <p className="text-xs font-mono text-gray-800 break-all mb-2">{bareTargetUrl}</p>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    title="Copy widget URL"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    {copied ? t('console.copied') : t('console.copyUrl')}
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    title="Open widget URL in a new tab"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    {t('console.openInNewTab')}
                  </button>
                </div>
                {result.kind === 'waiting' ? (
                  <div className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                    <span className="font-medium">{t('console.waitingForWebhook')}</span>
                  </div>
                ) : (
                  <div
                    className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded ${
                      result.kind === 'pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        result.kind === 'pass' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-medium">{result.status ?? (result.kind === 'pass' ? 'PASS' : 'FAIL')}</span>
                    {resultDetail && <span className="text-[11px] opacity-80">— {resultDetail}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
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
