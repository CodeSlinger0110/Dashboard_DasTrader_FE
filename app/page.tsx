'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Account, User } from '@/types'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext'
import { getApiBaseUrl } from '@/lib/api'
import { AccountCardSkeleton } from '@/components/Skeleton'

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [retryingAccounts, setRetryingAccounts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { connected, messages } = useWebSocket()
  const { token, logout } = useAuth()

  useEffect(() => {
    if (token) {
      fetchAccounts()
    }
  }, [token])

  // Listen for connection status updates from WebSocket
  useEffect(() => {
    const connectionStatusMessages = messages.filter(msg => msg.type === 'connection_status')
    if (connectionStatusMessages.length > 0) {
      // Refresh accounts when connection status changes
      fetchAccounts()
    }
  }, [messages])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/accounts`, {
        headers: getAuthHeaders(token)
      })
      
      if (response.status === 401) {
        logout()
        return
      }
      
      const data = await response.json()
      setUsers(data.users || [])
      setAccounts(data.accounts || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRetryConnection = async (accountId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setRetryingAccounts(prev => new Set(prev).add(accountId))
    
    try {
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/accounts/${accountId}/reconnect`, {
        method: 'POST',
        headers: getAuthHeaders(token)
      })
      
      if (response.status === 401) {
        logout()
        return
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        // Refresh accounts to update status
        await fetchAccounts()
      } else {
        alert(`Failed to reconnect: ${data.message || data.error}`)
      }
    } catch (error) {
      console.error('Error reconnecting account:', error)
      alert('Failed to reconnect account. Please try again.')
    } finally {
      setRetryingAccounts(prev => {
        const next = new Set(prev)
        next.delete(accountId)
        return next
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  DasTrader Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${connected ? 'text-green-500' : 'text-red-500'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-8">
            <div className="mb-8">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <AccountCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Group accounts by user */}
            {users.map((user) => (
              <div key={user.user_id} className="mb-8">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {user.host}:{user.port}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.accounts.map((account) => (
                    <div
                      key={account.account_id}
                      className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
                    >
                      <Link
                        href={`/account/${account.account_id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {account.name}
                          </h3>
                          <div className={`w-3 h-3 rounded-full ${account.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Account: {account.account_id}</p>
                          <p>Status: {account.connected ? 'Connected' : 'Disconnected'}</p>
                        </div>
                      </Link>
                      {!account.connected && (
                        <button
                          onClick={(e) => handleRetryConnection(account.account_id, e)}
                          disabled={retryingAccounts.has(account.account_id)}
                          className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
                        >
                          {retryingAccounts.has(account.account_id) ? 'Connecting...' : 'Retry Connection'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No accounts configured</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Please configure accounts in Backend/config.py
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
    </ProtectedRoute>
  )
}

