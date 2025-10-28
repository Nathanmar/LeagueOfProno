import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { realtimeClient } from "../services/api";

interface RealtimeContextType {
  connected: boolean;
  error: Error | null;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initializeWebSocket = async () => {
      try {
        await realtimeClient.connect();
        setConnected(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setConnected(false);
      }
    };

    void initializeWebSocket();

    return () => {
      realtimeClient.disconnect();
      setConnected(false);
    };
  }, [isClient]);

  return (
    <RealtimeContext.Provider value={{ connected, error }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}
