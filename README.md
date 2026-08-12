# Sistema de Notas e Frequência (front)

Next.js (App Router, JavaScript), exportado como site estático — sem
rotas de API nem server actions aqui. Toda a lógica de negócio (validar
notas, calcular média, decidir aprovado/reprovado, aplicar a regra de
faltas) vive no **backend**, que é um projeto à parte. Este front só
chama os endpoints (ver "API (backend)" abaixo) e renderiza o que volta.

## Telas

- `/` — login, com seleção de perfil (**Professor** / **Aluno**). Na aba
  Aluno tem a opção "Criar conta" (RA + nome + senha) — autocadastro.
- `/professor/alunos` — professor pré-cadastra alunos (RA + nome, sem
  senha — o aluno define a própria senha depois) e vê quem já
  completou o cadastro.
- `/professor/notas` — professor busca um aluno, lança A1 e A2 (provas)
  e gerencia os trabalhos que compõem a A3 (adicionar/editar/remover).
  A média final e o status (aprovado/reprovado/pendente) vêm prontos
  do backend.
- `/professor/frequencia` — professor lança o total de faltas do aluno.
- `/aluno/notas` — aluno vê as próprias notas (A1, A2, trabalhos da A3)
  e a situação, só leitura.
- `/aluno/faltas` — aluno vê o total de faltas e se está dentro do limite.
- `/aluno/calculadora` — calculadora de "e se": aluno simula A1, A2,
  quantos trabalhos de A3 quiser e faltas, com botões de +/-. **100%
  client-side, não chama a API, não salva nada** — só espelha em
  JavaScript a mesma conta que o backend faz (`lib/calculoNotas.js`),
  pra o aluno testar cenários antes das notas serem lançadas de verdade.

Regras de negócio (aplicadas pelo **backend** para os dados reais — a
calculadora do aluno replica a mesma conta localmente, só que sem ler
nem gravar nada):

- A1 e A2 são provas: nota única de 0 a 30 cada.
- A3 é a **soma dos trabalhos** lançados pelo professor (cada um 0 a 40,
  soma total também limitada a 40) — não é mais um valor único digitado
  direto.
- Média final = A1 + A2 + A3 (soma, escala 0–100).
- Média >= 70 → aprovado por nota. Média < 70 → reprovado por nota.
- Mais de 12 faltas totais → reprovado por frequência, mesmo com média
  final aceitável (essa regra sobrepõe o resultado da média).
- Aluno entra em duas portas: autocadastro (`/auth/registrar-aluno`,
  define a própria senha) ou pré-cadastro pelo professor (só RA + nome;
  login recusa até o aluno definir a senha via autocadastro com o
  mesmo RA).

## Primeiros passos

1. Configure a variável de ambiente (ver abaixo).
2. Pronto pra rodar local ou subir pro Cloudflare Pages.

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

## API (backend)

Este front é estático — o backend (projeto separado) precisa expor os
endpoints abaixo. `lib/api.js` já implementa o cliente para todos eles.
Autenticação: `Authorization: Bearer <token>` em todas as chamadas
exceto `/auth/login`.

### `POST /auth/login`

Autentica professor ou aluno.

```jsonc
// body
{ "perfil": "professor" | "aluno", "identificador": "string", "senha": "string" }

// 200
{ "token": "string", "usuario": { "id": "string", "nome": "string", "perfil": "professor" | "aluno" } }

// 401
{ "erro": "Credenciais inválidas" }
// ou, se o professor pré-cadastrou o aluno mas ele ainda não definiu senha:
{ "erro": "Cadastro pendente. Use \"Criar conta\" com seu RA para definir sua senha." }
```

### `POST /auth/registrar-aluno`

Autocadastro do aluno — público, como `/auth/login`. Cria a conta (ou
define a senha numa conta que o professor já tinha pré-cadastrado com
esse RA). Já devolve token, como um login.

```jsonc
// body
{ "ra": "string", "nome": "string", "senha": "string" } // senha: mínimo 6 caracteres

// 200
{ "token": "string", "usuario": { "id": "string", "nome": "string", "perfil": "aluno" } }

// 409 — RA já tem senha definida (já existe conta)
{ "erro": "RA já cadastrado." }
```

### `GET /professor/alunos`

Lista os alunos.

```jsonc
// 200
[{ "id": "string", "nome": "string", "matricula": "string", "cadastroCompleto": boolean }]
// cadastroCompleto = false quando o professor pré-cadastrou o aluno mas
// ele ainda não definiu a própria senha
```

### `POST /professor/alunos`

Professor pré-cadastra um aluno — só RA + nome, sem senha.

```jsonc
// body
{ "ra": "string", "nome": "string" }

// 201
{ "id": "string", "nome": "string", "matricula": "string", "cadastroCompleto": false }

// 409 — RA já existe
{ "erro": "RA já cadastrado." }
```

### `GET /professor/alunos/{alunoId}/boletim`

Retorna o boletim completo de um aluno (mesmo shape usado em
`GET /aluno/boletim` e devolvido por todos os endpoints de escrita
abaixo).

```jsonc
// 200
{
  "alunoId": "string",
  "nome": "string",
  "matricula": "string",
  "notas": {
    "a1": number | null,   // 0–30 (prova)
    "a2": number | null,   // 0–30 (prova)
    "a3": number | null,   // soma dos trabalhosA3; null se nenhum trabalho lançado
    "trabalhosA3": [{ "id": "string", "descricao": "string", "valor": number }],
    "media": number | null // a1 + a2 + a3; null se alguma nota faltando
  },
  "statusNota": "aprovado" | "reprovado" | "pendente", // baseado só na média (>=70 aprovado); pendente se notas incompletas
  "frequencia": {
    "faltas": number,
    "limiteFaltas": 12
  },
  "reprovadoPorFalta": boolean, // faltas > limiteFaltas
  "situacaoFinal": "aprovado" | "reprovado" | "pendente"
  // pendente: notas incompletas
  // reprovado: statusNota === "reprovado" OU reprovadoPorFalta === true
  // aprovado: statusNota === "aprovado" E reprovadoPorFalta === false
}
```

### `PUT /professor/alunos/{alunoId}/notas`

Lança/atualiza A1 e A2 (provas). A3 **não** entra aqui — ver os
endpoints de trabalhos abaixo. Retorna o boletim recalculado.

```jsonc
// body — qualquer campo pode vir null (nota ainda não lançada)
{ "a1": number | null, "a2": number | null }

// 200 → Boletim (shape acima)

// 422 — nota fora do intervalo permitido
{ "erro": "A1 deve estar entre 0 e 30", "campo": "a1" }
```

### `POST /professor/alunos/{alunoId}/notas/a3-trabalhos`

Adiciona um trabalho que compõe a A3. Retorna o boletim recalculado.

```jsonc
// body
{ "descricao": "string", "valor": number } // valor: 0–40

// 200 → Boletim (shape acima)

// 422 — valor fora do intervalo, ou soma dos trabalhos passaria de 40
{ "erro": "A soma dos trabalhos da A3 não pode passar de 40 (ficaria em 45.0).", "campo": "valor" }
```

### `PUT /professor/alunos/{alunoId}/notas/a3-trabalhos/{trabalhoId}`

Edita um trabalho existente (mesmo body/respostas do `POST` acima).

### `DELETE /professor/alunos/{alunoId}/notas/a3-trabalhos/{trabalhoId}`

Remove um trabalho. Retorna o boletim recalculado (200).

### `PUT /professor/alunos/{alunoId}/frequencia`

Lança/atualiza o total de faltas. Retorna o boletim recalculado.

```jsonc
// body
{ "faltas": number }

// 200 → Boletim (shape acima)

// 422
{ "erro": "Faltas não pode ser negativo", "campo": "faltas" }
```

### `GET /aluno/boletim`

Boletim do aluno autenticado (identificado pelo token) — mesmo shape de
`GET /professor/alunos/{alunoId}/boletim`. Usado tanto em `/aluno/notas`
quanto em `/aluno/faltas`.

## Estrutura

```
app/                    rotas (App Router)
  page.js               login (seleção professor/aluno) + autocadastro do aluno
  professor/layout.js    guarda de sessão + sidebar do professor
  professor/alunos/      cadastro de alunos
  professor/notas/       lançamento de A1/A2 + trabalhos da A3
  professor/frequencia/  lançamento de faltas
  aluno/layout.js        guarda de sessão + sidebar do aluno
  aluno/notas/           notas (leitura)
  aluno/faltas/          faltas (leitura)
  aluno/calculadora/     simulação client-side, não chama a API
components/             Sidebar, StatusBadge, NumberStepper
lib/api.js              cliente da API, sessão (localStorage) e endpoints
lib/calculoNotas.js     mesma conta do backend, replicada em JS puro
                        (só usada pela calculadora - não lê/grava nada)
scripts/build.mjs       build estático (resolve o next local, sem npx)
```
