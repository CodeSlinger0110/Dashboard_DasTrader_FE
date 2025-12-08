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

The frontend connects to the backend API using environment variables. 

1. Create a `.env.local` file in the `Frontend` directory:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

2. Replace `http://localhost:8000` with your backend URL if different.

The environment variable is used throughout the application via the `lib/api.ts` utility functions. All API calls and WebSocket connections automatically use this configuration.

