# DasTrader Dashboard Frontend

Next.js frontend for the DasTrader Dashboard.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Configuration

The frontend connects to the backend API at `http://localhost:8000` by default. To change this, update the API URLs in:
- `app/page.tsx`
- `app/account/[accountId]/page.tsx`
- `hooks/useWebSocket.ts`

