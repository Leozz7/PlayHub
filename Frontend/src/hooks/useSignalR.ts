import { useEffect } from 'react';
import { signalRService } from '@/lib/signalr';
import { useAuthStore } from '@/data/useAuthStore';

export function useSignalR() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      signalRService.startConnection(token);
    } else {
      signalRService.stopConnection();
    }

    return () => {
      signalRService.stopConnection();
    };
  }, [token]);

  return { connection: signalRService.connection };
}
