import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { LoginForm } from '@/features/auth/components/LoginForm';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent mb-6 text-center">
            PlayHub
          </h1>
          <LoginForm />
        </div>
      </div>
    </QueryClientProvider>
  );
}
