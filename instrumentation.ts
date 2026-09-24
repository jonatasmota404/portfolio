export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { atualizarCurriculos } = await import("@/lib/curriculo");
    atualizarCurriculos().catch(() => {}); // não trava a inicialização do servidor se falhar
  }
}
