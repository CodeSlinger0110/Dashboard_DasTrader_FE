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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade':
        return '💰'
      case 'order':
        return '📋'
      case 'order_action':
        return '⚡'
      default:
        return '📝'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'trade':
        return 'bg-black text-white dark:bg-white dark:text-black'
      case 'order':
        return 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black'
      case 'order_action':
        return 'bg-gray-600 text-white dark:bg-gray-400 dark:text-black'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
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
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {paginatedActivities.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No activities found
          </div>
        ) : (
          paginatedActivities.map((activity, index) => (
            <div
              key={index}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {activity.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.timestamp}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    {activity.symbol && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Symbol:</span> {activity.symbol}
                      </p>
                    )}
                    {activity.side && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Side:</span> {activity.side}
                      </p>
                    )}
                    {activity.quantity !== undefined && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Quantity:</span> {activity.quantity}
                      </p>
                    )}
                    {activity.price !== undefined && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Price:</span> {formatCurrency(activity.price)}
                      </p>
                    )}
                    {activity.realized_pl !== undefined && (
                      <p className={`text-sm font-medium ${
                        activity.realized_pl >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        <span className="font-medium">Realized P&L:</span> {formatCurrency(activity.realized_pl)}
                      </p>
                    )}
                    {activity.data?.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {activity.data.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
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

