"use client";

import { useState } from "react";
import { WagmiProvider, http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { NotificationProvider } from "@blockscout/app-sdk";
import { TransactionPopupProvider } from "@blockscout/app-sdk";

export const DEFAULT_CHAIN_ID = 11155111;

const config = createConfig({
  chains: [sepolia],
  transports: {
    [DEFAULT_CHAIN_ID]: http(
      `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
    ),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <TransactionPopupProvider>
            <SnackbarProvider>{children}</SnackbarProvider>
          </TransactionPopupProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
