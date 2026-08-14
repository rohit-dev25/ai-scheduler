import React, { useEffect, useState } from 'react'
import { dummyAccountsData, PLATFORMS } from '../assets/assets'
import { PlusIcon } from 'lucide-react'
import AccountList from '../components/AccountList'
import PlatformPickerModal from '../components/PlatformPickerModal'

const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showPlatformPicker, setShowPlatformPicker] = useState(false)

  const fetchAccounts = async () => {
    // TODO: replace with real API call, e.g. axios.get('/api/accounts')
    setAccounts([])
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const connectedPlatformIds = accounts.map((acc) => acc.platform)

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId)
    setTimeout(() => {
      setConnecting(null)
      const newAccount = {
        _id: crypto.randomUUID(),
        platform: platformId,
        handle: `@demo_${platformId}`,
        status: 'connected',
      }
      setAccounts((prev) => [...prev, newAccount])
      setShowPlatformPicker(false)
    }, 1000)
  }

  const handleDisconnect = async (accountId: string) => {
    // TODO: replace with real disconnect API call
    setAccounts((prev) => prev.filter((acc) => acc._id !== accountId))
  }

  return (
    <div className='space-y-8 max-w-4xl'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold text-slate-900'>Connected Accounts</h2>
          <p className='text-sm text-slate-500 mt-0.5'>
            {accounts.length} of {PLATFORMS.length} platforms connected
          </p>
        </div>
        <button
          onClick={() => setShowPlatformPicker(true)}
          className='flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors shadow-sm'
        >
          <PlusIcon className='size-4' />
          Connect Account
        </button>
      </div>

      {/* Connected accounts grid */}
      <AccountList accounts={accounts} onDisconnect={handleDisconnect} />

      {/* Platform picker modal */}
      {showPlatformPicker && (
        <PlatformPickerModal
          connectedIds={connectedPlatformIds}
          connecting={connecting}
          onClose={() => setShowPlatformPicker(false)}
          onConnect={handleConnect}
        />
      )}
    </div>
  )
}

export default Accounts