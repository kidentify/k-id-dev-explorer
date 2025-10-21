'use client';

interface CDKModalProps {
  isOpen: boolean;
  onClose: () => void;
  iframeUrl: string;
  title?: string;
  width?: string;
  height?: string;
  showFooter?: boolean;
  footerActions?: React.ReactNode;
}

export default function CDKModal({
  isOpen,
  onClose,
  iframeUrl,
  title = "Modal",
  width = "max-w-4xl",
  height = "h-96",
  showFooter = true,
  footerActions
}: CDKModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${width} w-full max-h-[90vh] flex flex-col`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body with iframe */}
        <div className="flex-1 p-6">
          <div className={`w-full ${height} border border-gray-300 rounded-lg overflow-hidden`}>
            <iframe
              src={iframeUrl}
              title={title}
              className="w-full h-full"
              frameBorder="0"
              allow="camera;autoplay;payment;publickey-credentials-get;publickey-credentials-create"
            />
          </div>
        </div>

        {/* Modal Footer */}
        {showFooter && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            {footerActions || (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                                             className="px-4 py-2 bg-[#745eee] hover:bg-[#6a4fd8] text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
