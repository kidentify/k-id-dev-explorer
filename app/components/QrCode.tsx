'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrCodeProps {
  value: string
  size?: number
  label?: string
  logoSrc?: string
}

/**
 * Small standalone component that renders a QR image for `value`. Used both by
 * the ngrok tunnel panel (for scanning-to-mobile the demo tool itself) and the
 * Console section (for scanning-to-mobile the widget URL).
 */
export default function QrCode({ value, size = 160, label, logoSrc }: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err)
        if (!cancelled) setDataUrl('')
      })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (!dataUrl) return null

  return (
    <div className="text-center">
      {label && <p className="text-xs text-gray-600 mb-2">{label}</p>}
      <div className="flex justify-center relative">
        <img
          src={dataUrl}
          alt={label ?? 'QR code'}
          className="border border-gray-300 rounded"
          style={{ width: size, height: size }}
        />
        {logoSrc && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <img src={logoSrc} alt="" className="w-8 h-8" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
