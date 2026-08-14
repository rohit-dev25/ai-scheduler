import { CheckCircleIcon, XIcon } from 'lucide-react'
import React from 'react'
import { PLATFORMS } from '../assets/assets'

interface PlatformPickerModalProps {
  connectedIds: string[]
  connecting: string | null
  onClose: () => void
  onConnect: (platformId: string) => void
}

const PlatformPickerModal = ({
  connectedIds,
  connecting,
  onClose,
  onConnect,
}: PlatformPickerModalProps) => {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Choose a Platform</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Platform list */}
        <div className="p-3 space-y-1 max-h-96 overflow-y-auto">
          {PLATFORMS.map((p) => {
            const isConnected = connectedIds.includes(p.id)
            const isConnecting = connecting === p.id

            return (
              <button
                key={p.id}
                onClick={() => !isConnected && !isConnecting && onConnect(p.id)}
                disabled={isConnected || isConnecting}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors text-left ${
                  isConnected
                    ? "border-red-100 bg-red-50 cursor-default"
                    : "border-transparent hover:bg-slate-50"
                } disabled:cursor-not-allowed`}
              >
                {/* Icon */}
                <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <p.icon className="size-5 text-slate-600" />
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium ${
                      isConnected ? "text-red-700" : "text-slate-800"
                    }`}
                  >
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {isConnected ? "Already connected" : p.description}
                  </div>
                </div>

                {/* Status */}
                {isConnected && (
                  <CheckCircleIcon className="size-4 text-red-500 shrink-0" />
                )}
                {isConnecting && (
                  <div className="size-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PlatformPickerModal