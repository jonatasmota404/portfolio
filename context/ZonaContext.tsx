"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Zona } from "@/lib/zonas";

type ZonaContextType = {
  zona: Zona;
  setZona: (z: Zona) => void;
};

const ZonaContext = createContext<ZonaContextType | undefined>(undefined);

export function ZonaProvider({ children }: { children: ReactNode }) {
  const [zona, setZona] = useState<Zona>("infra");
  return <ZonaContext.Provider value={{ zona, setZona }}>{children}</ZonaContext.Provider>;
}

export function useZona() {
  const contexto = useContext(ZonaContext);
  if (!contexto) throw new Error("useZona precisa estar dentro de um <ZonaProvider>");
  return contexto;
}