'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Position, Order, AccountOverview, Activity, Trade } from '@/types'
import LiveTradeView from '@/components/LiveTradeView'
import AccountOverviewPanel from '@/components/AccountOverviewPanel'
import ActivityLog from '@/components/ActivityLog'
import TradesView from '@/components/TradesView'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext'
import { getApiBaseUrl } from '@/lib/api'
import { TableSkeleton, StatsGridSkeleton, ActivitySkeleton } from '@/components/Skeleton'

export default function AccountPage() {
  const params = useParams()
  const accountId = params.accountId as string
  const [positions, setPositions] = useState<Position[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [overview, setOverview] = useState<AccountOverview | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [activeTab, setActiveTab] = useState<'positions' | 'overview' | 'activity' | 'trades'>('positions')
  const [loading, setLoading] = useState({
    positions: true,
    orders: true,
    trades: true,
    overview: true,
    activities: true,
  })
  const { messages } = useWebSocket()
  const { token, logout } = useAuth()
  const processedMessageKeysRef = useRef<Set<string>>(new Set())
  const previousMessagesLengthRef = useRef<number>(0)
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const orderUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tradeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchData()
    // Reset processed index when account changes
    processedMessageKeysRef.current.clear()
    previousMessagesLengthRef.current = 0
    // Clear any pending timeouts
    if (positionUpdateTimeoutRef.current) {
      clearTimeout(positionUpdateTimeoutRef.current)
      positionUpdateTimeoutRef.current = null
    }
    if (orderUpdateTimeoutRef.current) {
      clearTimeout(orderUpdateTimeoutRef.current)
      orderUpdateTimeoutRef.current = null
    }
    if (tradeUpdateTimeoutRef.current) {
      clearTimeout(tradeUpdateTimeoutRef.current)
      tradeUpdateTimeoutRef.current = null
    }
  }, [accountId])

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, positions: true }))
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/accounts/${accountId}/positions`, {
        headers: getAuthHeaders(token)
      })
      if (response.status === 401) {
        logout()
        return
      }
      const data = await response.json()
      setPositions(data.positions || [])
    } catch (error) {
      console.error('Error fetching positions:', error)
    } finally {
      setLoading(prev => ({ ...prev, positions: false }))
    }
  }, [accountId, token, logout])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }))
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/accounts/${accountId}/orders`, {
        headers: getAuthHeaders(token)
      })
      if (response.status === 401) {
        logout()
        return
      }
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(prev => ({ ...prev, orders: false }))
    }
  }, [accountId, token, logout])

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, overview: true }))
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/accounts/${accountId}/overview`, {
        headers: getAuthHeaders(token)
      })
      if (response.status === 401) {
        logout()
        return
      }
      const data = await response.json()
      setOverview(data)
    } catch (error) {
      console.error('Error fetching overview:', error)
    } finally {
      setLoading(prev => ({ ...prev, overview: false }))
    }
  }, [accountId, token, logout])

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, trades: true }))
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/accounts/${accountId}/trades?limit=1000`, {
        headers: getAuthHeaders(token)
      })
      if (response.status === 401) {
        logout()
        return
      }
      const data = await response.json()
      setTrades(data.trades || [])
    } catch (error) {
      console.error('Error fetching trades:', error)
    } finally {
      setLoading(prev => ({ ...prev, trades: false }))
    }
  }, [accountId, token, logout])

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, activities: true }))
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/accounts/${accountId}/activity?limit=100`, {
        headers: getAuthHeaders(token)
      })
      if (response.status === 401) {
        logout()
        return
      }
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(prev => ({ ...prev, activities: false }))
    }
  }, [accountId, token, logout])

  const fetchData = useCallback(async () => {
    await Promise.all([
      fetchPositions(),
      fetchOrders(),
      fetchTrades(),
      fetchOverview(),
      fetchActivities(),
    ])
  }, [fetchPositions, fetchOrders, fetchTrades, fetchOverview, fetchActivities])

  useEffect(() => {
    // Only process if there are actually new messages
    if (messages.length <= previousMessagesLengthRef.current) {
      return
    }

    // Process only new messages (from previous length to current length)
    // Messages are stored newest first (index 0 is newest)
    const startIndex = previousMessagesLengthRef.current
    const endIndex = messages.length

    let hasPositionUpdate = false
    let hasOrderUpdate = false
    let hasTradeUpdate = false

    for (let i = startIndex; i < endIndex; i++) {
      const msg = messages[i]
      
      // Create a unique key using timestamp, type, account_id, and a hash of the data
      const dataHash = JSON.stringify(msg.data || {}).slice(0, 50)
      const messageKey = `${msg.timestamp}-${msg.type}-${msg.account_id}-${dataHash}`
      
      // Skip if already processed (duplicate check)
      if (processedMessageKeysRef.current.has(messageKey)) {
        continue
      }

      // Mark as processed
      processedMessageKeysRef.current.add(messageKey)

      // Only process messages for this account
      if (msg.account_id === accountId) {
        if (msg.type === 'position') {
          hasPositionUpdate = true
        } else if (msg.type === 'order' || msg.type === 'order_action') {
          hasOrderUpdate = true
        } else if (msg.type === 'trade') {
          hasTradeUpdate = true
        } else if (msg.type === 'account_info' || msg.type === 'buying_power') {
          fetchOverview()
        }
      }
    }

    // Debounce position updates - only fetch once even if multiple position messages come in
    if (hasPositionUpdate) {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current)
      }
      positionUpdateTimeoutRef.current = setTimeout(() => {
        console.log('Position updated (debounced)')
        fetchPositions()
        positionUpdateTimeoutRef.current = null
      }, 300) // Wait 300ms to batch multiple updates
    }

    // Debounce order updates
    if (hasOrderUpdate) {
      if (orderUpdateTimeoutRef.current) {
        clearTimeout(orderUpdateTimeoutRef.current)
      }
      orderUpdateTimeoutRef.current = setTimeout(() => {
        console.log('Order updated (debounced)')
        fetchOrders()
        orderUpdateTimeoutRef.current = null
      }, 300)
    }

    // Debounce trade updates
    if (hasTradeUpdate) {
      if (tradeUpdateTimeoutRef.current) {
        clearTimeout(tradeUpdateTimeoutRef.current)
      }
      tradeUpdateTimeoutRef.current = setTimeout(() => {
        console.log('Trade updated (debounced)')
        fetchTrades()
        tradeUpdateTimeoutRef.current = null
      }, 300)
    }

    // Update the previous messages length
    previousMessagesLengthRef.current = messages.length

    // Clean up old processed message keys to prevent memory leak (keep last 500)
    if (processedMessageKeysRef.current.size > 500) {
      const entries = Array.from(processedMessageKeysRef.current)
      processedMessageKeysRef.current = new Set(entries.slice(-250))
    }
  }, [messages, accountId, fetchPositions, fetchOrders, fetchTrades, fetchOverview])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current)
      }
      if (orderUpdateTimeoutRef.current) {
        clearTimeout(orderUpdateTimeoutRef.current)
      }
      if (tradeUpdateTimeoutRef.current) {
        clearTimeout(tradeUpdateTimeoutRef.current)
      }
    }
  }, [])


  const handleRefresh = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/accounts/${accountId}/refresh`, {
        method: 'POST',
        headers: getAuthHeaders(token)
      })
      if (response.status === 401) {
        logout()
        return
      }
      await fetchData()
    } catch (error) {
      console.error('Error refreshing:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                ← Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Account: {accountId}
                </h1>
                {overview?.user_name && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    User: {overview.user_name}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('positions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'positions'
                  ? 'border-black dark:border-white text-black dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Live Trade View
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-black dark:border-white text-black dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Account Overview
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trades'
                  ? 'border-black dark:border-white text-black dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Trades
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-black dark:border-white text-black dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Activity Log
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'positions' && (
          loading.positions || loading.orders ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <TableSkeleton rows={5} cols={7} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <TableSkeleton rows={5} cols={8} />
              </div>
            </div>
          ) : (
            <LiveTradeView positions={positions} orders={orders} />
          )
        )}
        {activeTab === 'overview' && (
          loading.overview ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="p-6">
                <StatsGridSkeleton items={9} />
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : overview ? (
            <AccountOverviewPanel overview={overview} />
          ) : null
        )}
        {activeTab === 'trades' && (
          loading.trades ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <TableSkeleton rows={5} cols={10} />
            </div>
          ) : (
            <TradesView trades={trades} />
          )
        )}
        {activeTab === 'activity' && (
          loading.activities ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <ActivitySkeleton items={5} />
            </div>
          ) : (
            <ActivityLog activities={activities} />
          )
        )}
      </main>
    </div>
    </ProtectedRoute>
  )
}

