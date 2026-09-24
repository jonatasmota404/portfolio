import { notFound } from "next/navigation";

// Captura qualquer URL sem rota: sem isso o Next mostraria o 404 genérico, fora
// do layout de [locale]. Chamar notFound() aqui renderiza app/[locale]/not-found.tsx.
export default function RotaInexistente() {
  notFound();
}
