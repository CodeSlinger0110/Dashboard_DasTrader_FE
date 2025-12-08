'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Account, User } from '@/types'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext'

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const { connected } = useWebSocket()
  const { token, logout } = useAuth()

  useEffect(() => {
    if (token) {
      fetchAccounts()
    }
  }, [token])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/accounts', {
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
                <Link
                  key={account.account_id}
                  href={`/account/${account.account_id}`}
                  className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
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
      </main>
    </div>
    </ProtectedRoute>
  )
}

