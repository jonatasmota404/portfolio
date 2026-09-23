import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import crypto from "crypto";

function assinaturaValida(corpo: string, assinaturaRecebida: string | null): boolean {
    if (!assinaturaRecebida) return false;
    const esperada =
        "sha256=" +
        crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!).update(corpo).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(esperada), Buffer.from(assinaturaRecebida));
}

export async function POST(req: NextRequest) {
    const corpo = await req.text();
    const assinatura = req.headers.get("x-hub-signature-256");

    if (!assinaturaValida(corpo, assinatura)) {
        return NextResponse.json({ erro: "assinatura inválida" }, { status: 401 });
    }

    const payload = JSON.parse(corpo);
    const nomeRepo = payload.repository?.name;

    if (nomeRepo) {
        // Invalida o cache do repositório específico
        revalidateTag(`repo:${nomeRepo}`, { expire: 0 });

        if (nomeRepo === "jonatasmota404") {
            // Repositório de perfil: invalida o perfil.json usado na Sobre e na Home
            revalidateTag("perfil-jonatasmota404", { expire: 0 });
        } else if (nomeRepo === "escritos") {
            // Invalida a lista de artigos
            revalidateTag("repo:escritos", { expire: 0 });
        } else {
            // Se for outro repositório, invalida a lista de repos
            revalidateTag("repo:lista", { expire: 0 });
        }

        // Invalida a árvore e as páginas onde estatísticas e projetos aparecem
        revalidateTag("calendario-contribuicoes", { expire: 0 });
        revalidatePath("/[locale]/sobre", "page");
        revalidatePath("/[locale]", "page");
    }

    return NextResponse.json({ recebido: true });
}