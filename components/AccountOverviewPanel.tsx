'use client'

import { AccountOverview } from '@/types'

interface AccountOverviewPanelProps {
  overview: AccountOverview
}

export default function AccountOverviewPanel({ overview }: AccountOverviewPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getPnLColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400'
    if (value < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const stats = [
    {
      label: 'Current Equity',
      value: formatCurrency(overview.current_equity),
      color: 'text-gray-900 dark:text-white',
    },
    {
      label: 'Open Equity',
      value: formatCurrency(overview.open_equity),
      color: 'text-gray-900 dark:text-white',
    },
    {
      label: 'Realized P&L',
      value: formatCurrency(overview.realized_pl),
      color: getPnLColor(overview.realized_pl),
    },
    {
      label: 'Unrealized P&L',
      value: formatCurrency(overview.unrealized_pl),
      color: getPnLColor(overview.unrealized_pl),
    },
    {
      label: 'Net P&L',
      value: formatCurrency(overview.net_pl),
      color: getPnLColor(overview.net_pl),
    },
    {
      label: 'Buying Power',
      value: formatCurrency(overview.buying_power),
      color: 'text-gray-900 dark:text-white',
    },
    {
      label: 'Overnight BP',
      value: formatCurrency(overview.overnight_bp),
      color: 'text-gray-900 dark:text-white',
    },
    {
      label: 'Equity Exposure',
      value: formatCurrency(overview.equity_exposure),
      color: 'text-gray-900 dark:text-white',
    },
    {
      label: 'Commission',
      value: formatCurrency(overview.commission),
      color: 'text-gray-600 dark:text-gray-400',
    },
    {
      label: 'Fees',
      value: formatCurrency(overview.fees),
      color: 'text-gray-600 dark:text-gray-400',
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Account Overview
        </h2>
        {overview.last_update && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {new Date(overview.last_update).toLocaleString()}
          </p>
        )}
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-semibold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Risk Metrics Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Risk Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Margin Usage
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {overview.buying_power > 0
                  ? `${((overview.equity_exposure / (overview.buying_power + overview.equity_exposure)) * 100).toFixed(2)}%`
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Available Buying Power
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(overview.buying_power)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

