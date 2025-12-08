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

export default function AccountPage() {
  const params = useParams()
  const accountId = params.accountId as string
  const [positions, setPositions] = useState<Position[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [overview, setOverview] = useState<AccountOverview | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [activeTab, setActiveTab] = useState<'positions' | 'overview' | 'activity' | 'trades'>('positions')
  const { messages } = useWebSocket()
  const processedMessagesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
  }, [accountId])

  const fetchPositions = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/${accountId}/positions`)
      const data = await response.json()
      setPositions(data.positions || [])
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }, [accountId])

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/${accountId}/orders`)
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }, [accountId])

  const fetchOverview = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/${accountId}/overview`)
      const data = await response.json()
      setOverview(data)
    } catch (error) {
      console.error('Error fetching overview:', error)
    }
  }, [accountId])

  const fetchTrades = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/${accountId}/trades?limit=1000`)
      const data = await response.json()
      setTrades(data.trades || [])
    } catch (error) {
      console.error('Error fetching trades:', error)
    }
  }, [accountId])

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/${accountId}/activity?limit=100`)
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }, [accountId])

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
    // Handle WebSocket updates - only process new messages
    messages.forEach((msg) => {
      // Create a unique key for this message
      const messageKey = `${msg.timestamp}-${msg.type}-${msg.account_id}`
      
      // Skip if already processed
      if (processedMessagesRef.current.has(messageKey)) {
        return
      }

      // Mark as processed
      processedMessagesRef.current.add(messageKey)

      // Only process messages for this account
      if (msg.account_id === accountId) {
        if (msg.type === 'position') {
          fetchPositions()
        } else if (msg.type === 'order' || msg.type === 'order_action') {
          fetchOrders()
        } else if (msg.type === 'trade') {
          fetchTrades()
        } else if (msg.type === 'account_info' || msg.type === 'buying_power') {
          fetchOverview()
        }
      }
    })

    // Clean up old processed messages to prevent memory leak (keep last 1000)
    if (processedMessagesRef.current.size > 1000) {
      const entries = Array.from(processedMessagesRef.current)
      processedMessagesRef.current = new Set(entries.slice(-500))
    }
  }, [messages, accountId, fetchPositions, fetchOrders, fetchTrades, fetchOverview])


  const handleRefresh = async () => {
    try {
      await fetch(`http://localhost:8000/api/accounts/${accountId}/refresh`, { method: 'POST' })
      await fetchData()
    } catch (error) {
      console.error('Error refreshing:', error)
    }
  }

  return (
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Live Trade View
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Account Overview
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trades'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Trades
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Activity Log
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'positions' && (
          <LiveTradeView positions={positions} orders={orders} />
        )}
        {activeTab === 'overview' && overview && (
          <AccountOverviewPanel overview={overview} />
        )}
        {activeTab === 'trades' && (
          <TradesView trades={trades} />
        )}
        {activeTab === 'activity' && (
          <ActivityLog activities={activities} />
        )}
      </main>
    </div>
  )
}

