"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <nav className="p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-6 items-center">
          <Link href="/" className="text-xl font-bold hover:text-blue-100">
            Barangay Chain
          </Link>
        </div>
        <div>
          {!mounted ? (
            <div className="w-32 h-10"></div>
          ) : isConnected ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded font-medium"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
