import { useEffect, useState } from 'react'
import { PLATFORMS } from '../assets/assets'
import { PlusIcon } from 'lucide-react'
import AccountList from '../components/AccountList'
import PlatformPickerModal from '../components/PlatformPickerModal'
import toast from 'react-hot-toast'
import api from "../api/api"

const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showPlatformPicker, setShowPlatformPicker] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAccounts = async (isSync = false, platform?: string | null, successMsg?: string) => {
    try {
      if (isSync) {
        const label = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : "Social Media"
        toast.loading(`Syncing ${label} account...`, { id: "sync" })
        await api.get("/oauth/sync")
        toast.success(successMsg || "Accounts synced!", { id: "sync" })
      }
    const { data } = await api.get("/accounts")
setAccounts(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load accounts", { id: "sync" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const connectedPlatform = params.get("connected")
    const connectedUsername = params.get("username")
    const syncNeeded = params.get("sync") === "true"
    const errorMsg = params.get("error")

    // Clean the URL so refreshing doesn't re-trigger these params
    window.history.replaceState({}, document.title, window.location.pathname)

    if (connectedPlatform) {
      const label = connectedPlatform.charAt(0).toUpperCase() + connectedPlatform.slice(1)
      const handle = connectedUsername ? ` (@${connectedUsername})` : ""
      fetchAccounts(true, connectedPlatform, `${label}${handle} connected`)
    } else if (errorMsg) {
      toast.error(decodeURIComponent(errorMsg))
      fetchAccounts()
    } else if (syncNeeded) {
      fetchAccounts(true)
    } else {
      fetchAccounts()
    }
  }, [])

  const connectedPlatformIds = accounts.map((acc) => acc.platform)

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId)
    try {
      const res = await api.get(`/oauth/${platformId}/url`)
      const authUrl = res.data?.url

      if (!authUrl) {
        throw new Error("No authorization URL returned")
      }

      window.location.href = authUrl
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to connect ${platformId}`)
      setConnecting(null)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    await api.delete(`/accounts/${accountId}`)
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
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <AccountList accounts={accounts} onDisconnect={handleDisconnect} />
      )}

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