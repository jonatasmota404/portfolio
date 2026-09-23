import { FundoAmbienteWrapper } from "@/components/layout/FundoAmbienteWrapper";

// Grupo de rotas das páginas internas (Projetos, Escritos, Sobre): não muda as
// URLs, só compartilha o fundo ambiente. A Home fica de fora — já tem a cena
// completa (CenaRaizes). Como o layout persiste entre navegações internas, o
// canvas não é recriado a cada troca de página.
export default function LayoutInternas({ children }: { children: React.ReactNode }) {
    return (
        <>
            <FundoAmbienteWrapper />
            {children}
        </>
    );
}
