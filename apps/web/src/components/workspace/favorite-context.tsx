'use client';
import { createContext, useContext } from 'react';
const FavoriteContext = createContext<string[]>([]);
export function FavoriteProvider({ ids, children }: { ids: string[]; children: React.ReactNode }) {
  return <FavoriteContext.Provider value={ids}>{children}</FavoriteContext.Provider>;
}
export function useFavoriteIds() {
  return useContext(FavoriteContext);
}
