This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Analytics (opcional)

O site tem um encaixe para analytics que fica desligado por padrão: sem variáveis de ambiente, nenhum script extra é carregado. Para ativar, defina no ambiente de build/deploy (ou em `.env.local`):

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_ANALYTICS_SRC` | sim | URL do script do provedor escolhido |
| `NEXT_PUBLIC_ANALYTICS_ATTR_NAME` | não | Nome do atributo de configuração exigido no `<script>` |
| `NEXT_PUBLIC_ANALYTICS_ATTR_VALUE` | não | Valor desse atributo |

Os dois últimos só são aplicados juntos e servem a provedores que exigem um atributo no próprio elemento `<script>`. Exemplos:

```bash
# Plausible
NEXT_PUBLIC_ANALYTICS_SRC=https://plausible.io/js/script.js
NEXT_PUBLIC_ANALYTICS_ATTR_NAME=data-domain
NEXT_PUBLIC_ANALYTICS_ATTR_VALUE=seudominio.com

# Umami
NEXT_PUBLIC_ANALYTICS_SRC=https://cloud.umami.is/script.js
NEXT_PUBLIC_ANALYTICS_ATTR_NAME=data-website-id
NEXT_PUBLIC_ANALYTICS_ATTR_VALUE=<id-do-site>
```

Variáveis `NEXT_PUBLIC_*` são embutidas no build: após alterá-las, é preciso gerar um novo build. O componente é `components/layout/AnalyticsScript.tsx`, renderizado em `app/[locale]/layout.tsx`.
