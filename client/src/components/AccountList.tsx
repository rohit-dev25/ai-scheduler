import { CheckCircleIcon, AlertCircleIcon, UnplugIcon } from 'lucide-react'
import { useState } from 'react'
import { PLATFORMS } from '../assets/assets'

interface AccountListProps {
  accounts: any[]
  onDisconnect: (accountId: string) => Promise<void>
}

const AccountList = ({ accounts, onDisconnect }: AccountListProps) => {
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null)

  const handleDisconnect = async (accountId: string, platformName: string) => {
    const confirmed = window.confirm(
      `Disconnect ${platformName}? This account will need to be reconnected later.`
    )
    if (!confirmed) return

    setDisconnectingId(accountId)
    try {
      await onDisconnect(accountId)
      window.alert(`${platformName} disconnected successfully.`)
    } catch (error) {
      window.alert(`Failed to disconnect ${platformName}. Please try again.`)
    } finally {
      setDisconnectingId(null)
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <p className="text-sm font-medium text-slate-600">No accounts connected</p>
        <p className="text-xs text-slate-400 mt-1">
          Connect a social account to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {accounts.map((account, index) => {
        const meta = PLATFORMS.find((p) => p.id === account.platform)
        if (!meta) return null

        const isConnected = account.status === 'connected'
        const isDisconnecting = disconnectingId === account._id

        return (
          <div
            key={account._id ?? index}
            className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 group"
          >
            {/* Platform icon */}
            <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <meta.icon className="size-5 text-slate-500" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {account.handle}
              </p>
              <p className="text-xs text-slate-400">{meta.name}</p>
            </div>

            {/* Status + disconnect */}
            <div className="flex items-center gap-2 shrink-0">
              {isConnected ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <CheckCircleIcon className="size-3" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  <AlertCircleIcon className="size-3" />
                  Disconnected
                </span>
              )}

              <button
                onClick={() => handleDisconnect(account._id, meta.name)}
                disabled={isDisconnecting}
                title="Disconnect Account"
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UnplugIcon className="size-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AccountList