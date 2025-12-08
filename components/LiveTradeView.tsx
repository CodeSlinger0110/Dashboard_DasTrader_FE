'use client'

import { useState } from 'react'
import { Position, Order } from '@/types'
import { format } from 'date-fns'
import Pagination from './Pagination'

interface LiveTradeViewProps {
  positions: Position[]
  orders: Order[]
}

export default function LiveTradeView({ positions, orders }: LiveTradeViewProps) {
  const [positionsPage, setPositionsPage] = useState(1)
  const [positionsPerPage, setPositionsPerPage] = useState(25)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersPerPage, setOrdersPerPage] = useState(25)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-600 dark:text-green-400'
    if (pnl < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  // Filter open orders
  const openOrders = orders.filter(o => o.status !== 'Executed' && o.status !== 'Closed')

  // Paginate positions
  const positionsTotalPages = Math.ceil(positions.length / positionsPerPage)
  const positionsStartIndex = (positionsPage - 1) * positionsPerPage
  const positionsEndIndex = positionsStartIndex + positionsPerPage
  const paginatedPositions = positions.slice(positionsStartIndex, positionsEndIndex)

  // Paginate orders
  const ordersTotalPages = Math.ceil(openOrders.length / ordersPerPage)
  const ordersStartIndex = (ordersPage - 1) * ordersPerPage
  const ordersEndIndex = ordersStartIndex + ordersPerPage
  const paginatedOrders = openOrders.slice(ordersStartIndex, ordersEndIndex)

  return (
    <div className="space-y-6">
      {/* Positions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Open Positions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Entry Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mark Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Unrealized PnL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Realized PnL
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedPositions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No open positions
                  </td>
                </tr>
              ) : (
                paginatedPositions.map((position) => (
                  <tr key={position.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {position.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {position.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {position.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(position.avg_cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {position.mark_price ? formatCurrency(position.mark_price) : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPnLColor(position.unrealized_pnl)}`}>
                      {formatCurrency(position.unrealized_pnl)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPnLColor(position.realized_pnl)}`}>
                      {formatCurrency(position.realized_pnl)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {positions.length > 0 && (
          <Pagination
            currentPage={positionsPage}
            totalPages={positionsTotalPages}
            onPageChange={setPositionsPage}
            itemsPerPage={positionsPerPage}
            totalItems={positions.length}
            onItemsPerPageChange={(newItemsPerPage) => {
              setPositionsPerPage(newItemsPerPage)
              setPositionsPage(1)
            }}
          />
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Open Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No open orders
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.side}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.order_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.quantity} / {order.left_quantity} left
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.price ? `$${order.price.toFixed(2)}` : 'MKT'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        order.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        order.status === 'Partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {openOrders.length > 0 && (
          <Pagination
            currentPage={ordersPage}
            totalPages={ordersTotalPages}
            onPageChange={setOrdersPage}
            itemsPerPage={ordersPerPage}
            totalItems={openOrders.length}
            onItemsPerPageChange={(newItemsPerPage) => {
              setOrdersPerPage(newItemsPerPage)
              setOrdersPage(1)
            }}
          />
        )}
      </div>
    </div>
  )
}

