'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState, useEffect } from 'react';
import superjson from 'superjson';
import { SessionProvider, useSession } from 'next-auth/react';
import { trpc } from './client';

// Demo user ID for unauthenticated beta users
const DEMO_USER_ID = 'demo-user-00000000-0000-0000-0000';

// Module-level state for user ID (accessed by tRPC headers callback)
let currentUserId = DEMO_USER_ID;

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

function TRPCProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // Update module-level userId when session changes
  useEffect(() => {
    currentUserId = session?.user?.id || DEMO_USER_ID;
  }, [session]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers() {
            return {
              'x-user-id': currentUserId,
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCProviderInner>{children}</TRPCProviderInner>
    </SessionProvider>
  );
}
