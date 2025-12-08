/**
 * API configuration and utilities
 */

export const getApiBaseUrl = (): string => {
  // In Next.js, environment variables prefixed with NEXT_PUBLIC_ are available in the browser
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
}

export const getWebSocketUrl = (): string => {
  const baseUrl = getApiBaseUrl()
  // Convert http:// to ws:// and https:// to wss://
  if (baseUrl.startsWith('https://')) {
    return baseUrl.replace('https://', 'wss://') + '/ws'
  }
  return baseUrl.replace('http://', 'ws://') + '/ws'
}

