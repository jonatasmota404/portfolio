import { lerCurriculo } from "@/lib/curriculo";

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const pdf = await lerCurriculo(locale);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="jonatas-mota-${locale === "en" ? "en" : "pt-br"}.pdf"`,
      "Cache-Control": "no-cache",
    },
  });
}
