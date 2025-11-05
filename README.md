# k-ID CDK Explorer

An interactive developer tool for exploring and testing k-ID Compliance Developer Kit (CDK) flows. Built with Next.js, this tool provides a visual interface to test all CDK flow types, observe API traffic in real-time, and understand how to integrate k-ID's age verification and compliance flows into your application.

![CDK Explorer Screenshot](./cdk-screenshot.png)

## What is the k-ID CDK?

The k-ID Compliance Developer Kit provides a set of pre-built flows for age verification, parental consent, and compliance management. This tool helps developers understand how to integrate these flows by providing:

- **Visual Flow Testing**: Test all CDK flow types with real API calls
- **Real-time API Traffic**: Observe requests and responses as flows execute
- **Traffic Logging**: Download API traffic logs for debugging and analysis
- **Webhook Receiver**: Test webhook integrations with ngrok support

For complete documentation, visit the [k-ID Developer Hub](https://docs.k-id.com).

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

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Get your API key from the [k-ID Compliance Studio](https://portal.k-id.com)

3. Edit `.env.local` and add your API key:
   ```bash
   K_ID_API_KEY=your_actual_api_key_here
   K_ID_API_URL=https://game-api.test.k-id.com
   ```

   Replace `your_actual_api_key_here` with your actual API key from the Compliance Studio. The `K_ID_API_URL` defaults to the test environment. Change this to the live mode URL when ready.

For more information on getting started with k-ID, see the [k-ID Developer Hub](https://docs.k-id.com).

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

**📱 QR Code for Mobile Access**: When running with ngrok (Option 2), a QR code is automatically generated and displayed in the "Public Tunnel Access" section. Scanning this QR code with your phone allows you to access the CDK Explorer on your mobile device, enabling you to test CDK flows on mobile devices directly.

### ⚠️ Important: WebAuthn Requirements

When developing locally, **age key creation and validation will not work** unless running over HTTPS, as this is a requirement of WebAuthn. This is another important use case for the ngrok tunnel (Option 2). If you're testing flows that involve age key creation or validation, you must use `npm run dev:remote` to ensure the application is accessible via HTTPS.

## How to Use

The CDK Explorer provides an interactive way to test k-ID CDK flows:

1. **Select a Flow**: Choose a CDK flow type from the dropdown menu (e.g., Age Gate, Access Age Verification, Age Appeal, etc.)

2. **Enter Required Fields**: Fill in the necessary fields for the selected flow:
   - **Jurisdiction**: Required for most flows (e.g., "US-CA", "GB")
   - **Age Criteria**: Age number or age category (required for some flows)
   - **Subject Information**: Email, ID, date of birth, or claimed age (optional for some flows)
   - **Locale**: Language/locale code (e.g., "en-GB") - optional for some flows

3. **Click "Embed CDK Flow"**: This initiates the API call to k-ID and embeds the returned URL in the iframe on the right side of the screen.

4. **Observe the Traffic**: Watch the **Events & API Traffic** window to see:
   - API requests being made to k-ID
   - API responses with URLs and IDs
   - PostMessage events from the iframe
   - Webhook events (if configured)
   - Any errors or warnings

5. **Step Through the Flow**: Interact with the embedded CDK flow in the iframe. As you progress through the verification steps, observe the events appearing in the event window.

6. **Download Traffic Logs**: Click the **Download** button in the Events & API Traffic section to save a copy of all API traffic as a text file for analysis or debugging.

### Available CDK Flows

- **Access Age Verification**: Verify a user's age before granting access
- **Age Gate**: Present age verification options to users
- **Facial Age Estimation**: Estimate age using facial recognition
- **ID Verification**: Verify identity using government-issued ID
- **Trusted Adult Verification**: Verify through trusted adult confirmation
- **Age Appeal**: Allow users to appeal an age verification decision
- **VPC End-to-End**: Complete verification, consent, and permission flow
- **Direct Notices**: Display compliance notices directly
- **Manage Session Permissions**: Manage permissions for an existing session

For detailed documentation on each flow, visit the [k-ID Developer Hub](https://docs.k-id.com).

## 🌐 Webhook Receiver

The application includes a webhook receiver that can be accessed both locally and externally via ngrok tunnels.

### Webhook URLs

The application automatically detects and displays the external URL when ngrok is running:

- **🌐 External URL**: `https://[random].ngrok-free.app/api/webhook` (when ngrok is active)
- **🏠 Local URL**: `http://localhost:3100/api/webhook` (fallback when ngrok is not running)

**Configuring Your Webhook URL**: To receive webhook events from k-ID, you need to configure the webhook URL in the [k-ID Compliance Studio](https://portal.k-id.com). Navigate to your product settings and set the webhook receiver URL to the external URL displayed above (when using ngrok) or your deployed application URL. The webhook URL must be publicly accessible for k-ID to send events to your application.

## 📊 Real-time Monitoring

- **Event Window**: All webhook events appear in real-time in the main interface
- **Server-Sent Events**: Automatic updates when webhooks are received
- **Event Details**: Full request information including headers, body, method, and timestamp
- **Copy Functionality**: Click the copy button to copy webhook data to clipboard

## 🛠️ Development

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `K_ID_API_KEY` - Your k-ID API key (required for CDK flows)
  - Get your API key from the [k-ID Compliance Studio](https://portal.k-id.com)
- `K_ID_API_URL` - k-ID API base URL (defaults to https://game-api.test.k-id.com)
  - Test environment: `https://game-api.test.k-id.com`
  - Production environment: `https://game-api.k-id.com`
- `PORT` - Server port (defaults to 3100, optional)
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

## Documentation & Resources

- **[k-ID Developer Hub](https://docs.k-id.com)** - Complete k-ID documentation and integration guides
- **[k-ID Compliance Studio](https://portal.k-id.com)** - Get your API keys and manage your k-ID integration
- **[k-ID CDK Documentation](https://docs.k-id.com/docs/cdk/intro)** - CDK overview and getting started
- **[Next.js Documentation](https://nextjs.org/docs)** - Next.js framework documentation
- **[Ngrok Documentation](https://ngrok.com/docs)** - Ngrok tunneling documentation