"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 3 * 60 * 1000, // 3 minutes default
        gcTime: 15 * 60 * 1000,    // 15 minutes default
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Do not retry 4xx client errors (e.g. 404, 403, 422)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
}

export default function QueryProvider({ children }) {
  const [queryClient] = useState(() => makeQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
