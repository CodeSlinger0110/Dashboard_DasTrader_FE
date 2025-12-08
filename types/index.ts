export interface Account {
  account_id: string
  name: string
  host: string
  port: number
  connected: boolean
  user_id?: string
  user_name?: string
}

export interface User {
  user_id: string
  name: string
  host?: string
  port?: number
  accounts: Account[]
}

export interface Position {
  symbol: string
  type: string
  quantity: number
  avg_cost: number
  init_quantity: number
  init_price: number
  realized_pnl: number
  create_time: string
  unrealized_pnl: number
  mark_price?: number
}

export interface Order {
  order_id: string
  token: string
  symbol: string
  side: string
  order_type: string
  quantity: number
  left_quantity: number
  canceled_quantity: number
  price: number | null
  route: string
  status: string
  time: string
  original_order_id: string
  account: string
  trader: string
  order_source: string
}

export interface Trade {
  trade_id: string
  symbol: string
  side: string
  quantity: number
  price: number
  route: string
  time: string
  order_id: string
  liquidity: string
  ecn_fee: number
  realized_pl: number
}

export interface AccountOverview {
  account_id: string
  user_id?: string
  user_name?: string
  current_equity: number
  open_equity: number
  realized_pl: number
  unrealized_pl: number
  net_pl: number
  buying_power: number
  overnight_bp: number
  equity_exposure: number
  commission: number
  fees: number
  last_update: string | null
}

export interface Activity {
  type: string
  timestamp: string
  symbol: string
  side?: string
  quantity?: number
  price?: number
  realized_pl?: number
  data: any
}

