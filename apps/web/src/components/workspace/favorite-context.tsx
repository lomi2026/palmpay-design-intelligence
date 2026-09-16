'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
type Snapshot = {ids:string[];projectCount:number};
const FavoriteContext = createContext<string[]>([]);
const ProjectCountContext = createContext<number | undefined>(undefined);
export function FavoriteProvider({ ids, projectCount, children }: { ids: string[]; projectCount:number; children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [live, setLive] = useState<{path:string;source:string[];data:Snapshot} | null>(null);
  useEffect(()=>{
    if(previousPath.current===pathname)return;
    previousPath.current=pathname;
    const controller=new AbortController();
    fetch('/api/workspace-live-data',{cache:'no-store',signal:controller.signal})
      .then(async response=>{if(!response.ok)throw Error('Unavailable');return response.json() as Promise<Snapshot>;})
      .then(data=>{if(!controller.signal.aborted)setLive({path:pathname,source:ids,data});})
      .catch(()=>{});
    return ()=>controller.abort();
  },[pathname,ids]);
  const data=live?.source===ids ? live.data : {ids,projectCount};
  return <ProjectCountContext.Provider value={data.projectCount}><FavoriteContext.Provider value={data.ids}>{children}</FavoriteContext.Provider></ProjectCountContext.Provider>;
}
export function useFavoriteIds(){return useContext(FavoriteContext);}
export function useWorkspaceProjectCount(fallback:number){return useContext(ProjectCountContext)??fallback;}
