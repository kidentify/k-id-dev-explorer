import { NextResponse } from 'next/server';
import { NgrokInfo } from '../../types/webhook';
import { fetchWithTimeout } from '../../utils/fetchWithTimeout';

export async function GET() {
  try {
    // Fetch ngrok tunnel info from ngrok's local API. 5s abort timeout so a
    // stalled ngrok API can't hang this route; the client polls it every 10s.
    const response = await fetchWithTimeout('http://127.0.0.1:4040/api/tunnels', {}, 5000);

    if (!response.ok) {
      return NextResponse.json<NgrokInfo>({
        success: false,
        error: 'Ngrok not running. Run `npm run dev` to enable ngrok tunnel',
        localUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3100'
      });
    }

    const data = await response.json();

    // Get the port from environment variable or default to 3100
    const port = process.env.PORT || '3100';

    // Find the tunnel for the configured port (prefer HTTP, but accept HTTPS)
    const tunnel = data.tunnels?.find((tunnel: { config?: { addr?: string } }) =>
      tunnel.config?.addr === `http://localhost:${port}` || tunnel.config?.addr === `localhost:${port}`
    );

    if (!tunnel) {
      return NextResponse.json<NgrokInfo>({
        success: false,
        error: `No tunnel found for port ${port}. Run \`npm run dev\` to enable ngrok tunnel`,
        localUrl: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`
      });
    }

    return NextResponse.json<NgrokInfo>({
      success: true,
      ngrokUrl: tunnel.public_url,
      localUrl: `http://localhost:${port}`,
      webhookUrl: `${tunnel.public_url}/api/webhook`,
      protocol: tunnel.proto
    });

  } catch (error) {
    console.error('Error fetching ngrok tunnel info:', error);
    const port = process.env.PORT || '3100';
    return NextResponse.json<NgrokInfo>({
      success: false,
      error: 'Failed to fetch ngrok tunnel information. Run `npm run dev` to enable ngrok tunnel',
      localUrl: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`
    });
  }
}
