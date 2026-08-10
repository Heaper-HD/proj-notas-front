# Frontend do projeto (Next.js + JavaScript)

Mesmo template que `template-front-next-typescript`, sem TypeScript —
Next.js (App Router), exportado como site estático.

## Primeiros passos

1. Troque o conteúdo de `app/page.js` pelo que seu projeto realmente
   precisa.
2. Configure a variável de ambiente (ver abaixo).
3. Pronto pra rodar local ou subir pro Cloudflare Pages.

## Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | URL base da API deste projeto |

Só variáveis com prefixo `NEXT_PUBLIC_` chegam ao navegador.

## Rodar localmente

```bash
cp .env.example .env
npm install
npm run dev
```

## Build

```bash
npm run build
```

Gera `./out` (estático) — `next.config.js` já define `output: "export"`.

## Deploy — Cloudflare Pages

1. Criar projeto a partir deste repositório.
2. Build command: `npm run build`
3. Build output directory: `out`
4. Variáveis de ambiente: `NODE_VERSION=20` e `NEXT_PUBLIC_API_BASE_URL`.
5. Domínio customizado: `${PROJECT_NAME}.fadconecta.com.br`

## Branch `dev`

Sem pipeline customizada — o Cloudflare Pages já gera preview
automática pra qualquer branch que não seja a de produção.

## CI

| Workflow | O que faz |
|---|---|
| `validate.yml` | confere se o projeto builda sem erro |
| `secret-scan.yml` | procura segredos commitados por engano |

## Logos e ícones

Mesma estrutura do template TypeScript — `public/logos/` pros
logos da FADERGS, favicon/ícones já configurados via convenção do
Next (`app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`,
`app/manifest.js`).

## Gotchas (coisas que já nos morderam — não repetir)

- **`.next/` precisa estar no `.gitignore`.** Cache de dev/build,
  diferente de `out/` (export estático final).
- **Route handlers dinâmicos (`manifest.js`, etc.) precisam de
  `export const dynamic = "force-static"`** pra funcionar com
  `output: "export"` — sem isso o build falha.

## Estrutura

```
app/            rotas (App Router), favicon/ícones, manifest
lib/api.js      base da API + helper de fetch
scripts/build.mjs   build estático (resolve o next local, sem npx)
```
