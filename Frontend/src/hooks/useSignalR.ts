import { useEffect } from 'react';
import { signalRService } from '@/lib/signalr';
import { useAuthStore } from '@/data/useAuthStore';

export function useSignalR() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      signalRService.startConnection();
    } else {
      signalRService.stopConnection();
    }

    return () => {
      signalRService.stopConnection();
    };
  }, [isAuthenticated]);

  return { connection: signalRService.connection };
}
