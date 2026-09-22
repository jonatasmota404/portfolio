"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PALETAS, TEMA_PADRAO, type TemaId } from "@/lib/paletas";

const CHAVE_STORAGE = "portfolio-tema";

type TemaContextType = {
  tema: TemaId;
  setTema: (novo: TemaId) => void;
};

const TemaContext = createContext<TemaContextType | undefined>(undefined);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<TemaId>(TEMA_PADRAO);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_STORAGE) as TemaId | null;
    if (salvo && PALETAS[salvo]) {
      setTemaState(salvo);
      document.documentElement.setAttribute("data-tema", salvo);
    }
  }, []);

  function setTema(novo: TemaId) {
    setTemaState(novo);
    document.documentElement.setAttribute("data-tema", novo);
    localStorage.setItem(CHAVE_STORAGE, novo);
  }

  return <TemaContext.Provider value={{ tema, setTema }}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error("useTema precisa ser usado dentro de um TemaProvider");
  return ctx;
}
