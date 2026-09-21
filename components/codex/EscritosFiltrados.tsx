"use client";

import Link from "next/link";
import { useZona } from "@/context/ZonaContext";

type Post = { slug: string; titulo: string; resumo: string; tags?: string[] };

export function EscritosFiltrados({ posts }: { posts: Post[] }) {
  const { zona } = useZona();
  
  // Filtra usando a convenção: a primeira tag (index 0) é o domínio
  const filtrados = posts.filter((p) => {
    const categoria = p.tags && p.tags.length > 0 ? p.tags[0].toLowerCase() : "geral";
    return categoria === (zona || "");
  });
  
  const mostrar = (filtrados.length > 0 ? filtrados : posts).slice(0, 3);

  return (
    <ul className="space-y-4">
      {mostrar.map((post) => (
        <li 
          key={post.slug} 
          className="group border border-transparent hover:border-current/10 hover:bg-current/[0.02] p-4 -mx-4 rounded-2xl transition-all duration-300"
        >
          <Link href={`/escritos/${post.slug}`} className="block">
            <h3 className="font-voice italic text-xl group-hover:opacity-70 transition-opacity mb-1.5">
              {post.titulo}
            </h3>
            <p className="font-serif text-sm opacity-75 leading-relaxed">
              {post.resumo}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}