import React, { createContext, useCallback, useMemo, useState } from 'react';

export const WalletContext = createContext({
  chain: null,
  walletAddress: null,
  providerObject: null,
  signer: null,
  publicKey: null,
  connectionStatus: 'disconnected',
  setWalletState: () => {},
  resetWallet: () => {},
});

export const WalletProvider = ({ children }) => {
  const [walletState, setWalletState] = useState({
    chain: null,
    walletAddress: null,
    providerObject: null,
    signer: null,
    publicKey: null,
    connectionStatus: 'disconnected',
  });

  const resetWallet = useCallback(() => {
    setWalletState({
      chain: null,
      walletAddress: null,
      providerObject: null,
      signer: null,
      publicKey: null,
      connectionStatus: 'disconnected',
    });
  }, []);

  const value = useMemo(
    () => ({
      ...walletState,
      setWalletState,
      resetWallet,
    }),
    [walletState, resetWallet]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
