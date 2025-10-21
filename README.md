# k-ID CDK Explorer

An interactive learning tool to understand CDK flows, built with Next.js. This tool includes both CDK flow demonstrations and a webhook receiver for testing and development.

## 🚀 Quick Start

### Prerequisites

Make sure you have ngrok installed on your system:
- **macOS**: `brew install ngrok`
- **Windows**: Download from [ngrok.com](https://ngrok.com/download)
- **Linux**: Download from [ngrok.com](https://ngrok.com/download)

### Installation

First, install the dependencies:

```bash
npm install
```

## Environment Setup

### k-ID API Configuration

To use the Access Age Verification feature, you need to set up your API configuration:

1. Create a `.env.local` file in the root directory (if it doesn't exist)
2. Add your API configuration:

```bash
# Age Verification API Configuration
K_ID_API_KEY=your_actual_api_key_here
K_ID_API_URL=https://game-api.test.k-id.com

# Optional: Override default port (defaults to 3100)
PORT=3100
```

Replace `your_actual_api_key_here` with your real API key from the K-ID service. The `K_ID_API_URL` can be changed if you need to use a different environment (e.g., production). Use the full base URL including the scheme (e.g., `https://`).

## Running the Application

### Option 1: Local Development Only
```bash
npm run dev
```
- Server runs on `http://localhost:3100`
- Webhook URL: `http://localhost:3100/api/webhook`

### Option 2: Local + External Access (Recommended)
```bash
npm run dev:remote
```
- Server runs on `http://localhost:3100`
- Ngrok tunnel creates external HTTPS URL
- Webhook URL: `https://[random].ngrok-free.app/api/webhook`

**Note**: The ngrok URL will change each time you restart the remote development server unless you have an ngrok account and auth token.

## 🌐 Webhook Receiver

The application includes a webhook receiver that can be accessed both locally and externally via ngrok tunnels.

### Webhook URLs

The application automatically detects and displays the external URL when ngrok is running:

- **🌐 External URL**: `https://[random].ngrok-free.app/api/webhook` (when ngrok is active)
- **🏠 Local URL**: `http://localhost:3100/api/webhook` (fallback when ngrok is not running)

### Supported HTTP Methods

The webhook receiver accepts all HTTP methods:
- `GET` - Query parameters and headers
- `POST` - JSON body and headers
- `PUT` - JSON body and headers
- `DELETE` - Headers and optional body
- `PATCH` - JSON body and headers

### Testing Examples

#### Test with curl (External - Recommended)
```bash
curl -X POST https://[your-ngrok-url].ngrok-free.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "message": "Hello from external!"}'
```

#### Test with curl (Local)
```bash
curl -X POST http://localhost:3100/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "message": "Hello from local!"}'
```

#### Test with different methods
```bash
# GET request
curl -X GET "https://[your-ngrok-url].ngrok-free.app/api/webhook?param1=value1&param2=value2"

# PUT request
curl -X PUT https://[your-ngrok-url].ngrok-free.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"update": "data"}'

# DELETE request
curl -X DELETE https://[your-ngrok-url].ngrok-free.app/api/webhook \
  -H "Authorization: Bearer token123"
```

## 📊 Real-time Monitoring

- **Event Window**: All webhook events appear in real-time in the main interface
- **Server-Sent Events**: Automatic updates when webhooks are received
- **Event Details**: Full request information including headers, body, method, and timestamp
- **Copy Functionality**: Click the copy button to copy webhook data to clipboard

## Available Demos

- **Access Age Verification**: A demonstration of age verification using K-ID's API with a modal containing an iframe
- **Facial Age Estimation**: Age estimation using facial recognition
- **Trusted Adult Verification**: Verification through trusted adult confirmation

## 🔧 Features

### CDK Flows
- Modern React with Next.js 15
- TypeScript support
- Tailwind CSS for styling
- Responsive design
- API integration with Bearer token authentication

### Webhook Receiver
- ✅ **Real-time webhook display** in the event window
- ✅ **Automatic ngrok detection** and URL display
- ✅ **Copy-to-clipboard** for external URLs
- ✅ **All HTTP methods** supported
- ✅ **Complete request capture** (headers, body, method, URL)
- ✅ **Server-Sent Events** for real-time updates
- ✅ **Visual status indicators** for ngrok tunnel status
- ✅ **Automatic refresh** of ngrok tunnel information

## 🛠️ Development

### API Endpoints
- `GET /api/webhook` - Webhook receiver (all methods)
- `GET /api/webhook/events` - Server-Sent Events stream
- `GET /api/ngrok` - Ngrok tunnel information

### Environment Variables
- `K_ID_API_KEY` - Your k-ID API key (required for CDK flows)
- `K_ID_API_URL` - k-ID API base URL (defaults to https://game-api.test.k-id.com)
- `PORT` - Server port (defaults to 3100)
- `NEXT_PUBLIC_APP_URL` - Override local URL (optional)

### Scripts
- `npm run dev` - Start development server only
- `npm run dev:remote` - Start development server with ngrok tunnel
- `npm run dev:ngrok` - Start ngrok tunnel only
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Notes

- Ngrok creates HTTPS tunnels by default for security
- The application automatically detects both HTTP and HTTPS tunnels
- Webhook events are stored in memory (last 100 events)
- SSE connections include heartbeat to keep connections alive
- Ngrok tunnel information refreshes every 10 seconds
- The event window only shows meaningful events (API traffic, webhook payloads, JS events)

## Documentation

- [k-ID CDK Documentation](https://docs.k-id.com/docs/cdk/intro)
- [Next.js Documentation](https://nextjs.org/docs)
- [Ngrok Documentation](https://ngrok.com/docs)