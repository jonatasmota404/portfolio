import type { ComponentProps, ReactNode } from "react";

export const componentesProsa = {
  wrapper: ({ children }: { children: ReactNode }) => (
    <div className="prosa-artigo">
      {children}
    </div>
  ),

  // Títulos com estilo de capítulo de livro
  h1: (props: ComponentProps<"h1">) => (
    <h1 className="heading-2 text-3xl md:text-4xl mt-12 mb-6" style={{ color: "var(--accent)" }} {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="heading-2 text-2xl md:text-3xl mt-10 mb-4 border-b border-current/10 pb-2" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="heading-3 text-xl md:text-2xl mt-8 mb-3 opacity-90" {...props} />
  ),
  
  p: (props: ComponentProps<"p">) => (
    <p className="text-[1.05rem] md:text-[1.1rem] leading-[1.75] mb-6 opacity-85" {...props} />
  ),
  
  a: (props: ComponentProps<"a">) => (
    <a className="underline decoration-current/30 hover:decoration-current underline-offset-4 transition-colors" style={{ color: "var(--accent)" }} {...props} />
  ),
  
  strong: (props: ComponentProps<"strong">) => <strong className="font-bold opacity-100" {...props} />,
  
  em: (props: ComponentProps<"em">) => <em className="font-semibold not-italic" {...props} />,
  
  // Listas com espaçamento de leitura e marcadores coloridos
  li: (props: ComponentProps<"li">) => (
    <li className="text-[1.05rem] leading-[1.75] opacity-85 mb-2" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-[var(--accent)]" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-[var(--accent)]" {...props} />
  ),
  
  // Blockquote imitando uma anotação/citação importante nas margens
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote className="border-l-4 pl-5 my-8 py-2 pr-4 rounded-r-lg bg-current/[0.02] opacity-90" style={{ borderColor: "var(--accent)" }} {...props} />
  ),
  
  code: (props: ComponentProps<"code">) => (
    <code className="font-mono text-[0.85em] px-1.5 py-0.5 rounded border border-current/10" style={{ backgroundColor: "color-mix(in srgb, var(--ink) 4%, transparent)" }} {...props} />
  ),
  
  pre: (props: ComponentProps<"pre">) => (
    <pre className="font-mono text-sm p-6 rounded-xl overflow-x-auto mb-6 border border-current/10 shadow-sm" style={{ backgroundColor: "color-mix(in srgb, var(--ink) 3%, transparent)" }} {...props} />
  ),
  
  img: (props: ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="rounded-xl my-8 max-w-full shadow-md border border-current/10" {...props} />
  ),
  
  // Divisória subtil imitando ornamentos de página
  hr: () => <hr className="my-12 border-t border-dashed border-current/30 w-1/3 mx-auto" />,

  // O Fallback do Mermaid que protege o site
  Mermaid: ({ children }: { children: ReactNode }) => (
    <div className="my-8 p-6 rounded-xl bg-current/[0.02] border border-current/10 overflow-x-auto shadow-sm">
      <div className="flex items-center gap-2 mb-4 opacity-50">
        <span className="w-2 h-2 rounded-full bg-current"></span>
        <p className="text-[10px] font-mono uppercase tracking-widest">Diagrama de Arquitetura</p>
      </div>
      <pre className="text-xs font-mono opacity-80 whitespace-pre-wrap">{children}</pre>
    </div>
  ),
};