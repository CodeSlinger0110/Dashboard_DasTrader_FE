'use client'

import { useState } from 'react'
import { Activity } from '@/types'
import { format } from 'date-fns'
import Pagination from './Pagination'

interface ActivityLogProps {
  activities: Activity[]
}

export default function ActivityLog({ activities }: ActivityLogProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getActivityTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      'trade': 'Trade',
      'order': 'Order',
      'order_action': 'Order Action',
    }
    
    const typeColors: Record<string, string> = {
      'trade': 'bg-black text-white dark:bg-white dark:text-black',
      'order': 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black',
      'order_action': 'bg-gray-600 text-white dark:bg-gray-400 dark:text-black',
    }
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      }`}>
        {typeLabels[type] || type.replace('_', ' ')}
      </span>
    )
  }

  const getSideBadge = (side: string) => {
    if (!side) return null
    
    const sideColors: Record<string, string> = {
      'Buy': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'B': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Sell': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'S': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Short': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'SS': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    }
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        sideColors[side] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      }`}>
        {side}
      </span>
    )
  }

  const totalPages = Math.ceil(activities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedActivities = activities.slice(startIndex, endIndex)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activity Log
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Side
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Realized P&L
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedActivities.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No activities found
                </td>
              </tr>
            ) : (
              paginatedActivities.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {activity.timestamp || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActivityTypeBadge(activity.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {activity.symbol || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSideBadge(activity.side || '') || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {activity.quantity !== undefined ? activity.quantity.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {activity.price !== undefined ? formatCurrency(activity.price) : '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    activity.realized_pl !== undefined
                      ? activity.realized_pl >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {activity.realized_pl !== undefined ? formatCurrency(activity.realized_pl) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {activities.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={activities.length}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}

