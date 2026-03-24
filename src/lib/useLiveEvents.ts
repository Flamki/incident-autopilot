import { useEffect } from "react";
import { getAuthToken, getWsBaseUrl } from "@/src/lib/api";

export function useLiveEvents(onEvent: (event: any) => void) {
  useEffect(() => {
    const token = getAuthToken();
    const wsBase = getWsBaseUrl();
    if (!token || !wsBase) return;

    const ws = new WebSocket(`${wsBase}/ws?token=${encodeURIComponent(token)}`);

    ws.onmessage = (message) => {
      try {
        onEvent(JSON.parse(message.data));
      } catch {
        // ignore non-json keepalive responses
      }
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [onEvent]);
}
