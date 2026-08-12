// Base da API (backend separado deste front estático).
// Ver README.md > "API (backend)" para o contrato completo de endpoints.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const TOKEN_KEY = 'notas.token';
const USUARIO_KEY = 'notas.usuario';

// ---------------------------------------------------------------------
// Sessão (guardada no localStorage do navegador — front é 100% estático,
// não existe sessão de servidor aqui).
// ---------------------------------------------------------------------

export function salvarSessao(token, usuario) {
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function obterToken() {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function obterUsuario() {
	if (typeof window === 'undefined') return null;
	const raw = localStorage.getItem(USUARIO_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function limparSessao() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USUARIO_KEY);
}

// ---------------------------------------------------------------------
// Cliente HTTP genérico
// ---------------------------------------------------------------------

class ApiError extends Error {
	constructor(mensagem, status, campo) {
		super(mensagem);
		this.status = status;
		this.campo = campo;
	}
}

async function apiFetch(path, init = {}) {
	if (!API_BASE_URL) {
		throw new ApiError('NEXT_PUBLIC_API_BASE_URL não está definida.');
	}

	const token = obterToken();
	const res = await fetch(`${API_BASE_URL}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...init.headers,
		},
	});

	let corpo = null;
	try {
		corpo = await res.json();
	} catch {
		// resposta sem corpo (ex: 204)
	}

	if (!res.ok) {
		const mensagem = corpo?.erro ?? `Erro ${res.status} ao chamar ${path}`;
		throw new ApiError(mensagem, res.status, corpo?.campo);
	}

	return corpo;
}

// ---------------------------------------------------------------------
// Auth
//
// POST /auth/login
//   body: { perfil: "professor" | "aluno", identificador, senha }
//   200:  { token, usuario: { id, nome, perfil } }
//   401:  { erro }  (credenciais inválidas, ou aluno com cadastro pendente)
//
// POST /auth/registrar-aluno   (autocadastro do aluno)
//   body: { ra, nome, senha }
//   200:  { token, usuario }  — já autenticado, igual login
//   409:  { erro }  quando o RA já tem senha definida
// ---------------------------------------------------------------------

export function login({ perfil, identificador, senha }) {
	return apiFetch('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ perfil, identificador, senha }),
	});
}

export function registrarAluno({ ra, nome, senha }) {
	return apiFetch('/auth/registrar-aluno', {
		method: 'POST',
		body: JSON.stringify({ ra, nome, senha }),
	});
}

// ---------------------------------------------------------------------
// Professor
//
// GET /professor/alunos
//   200: [{ id, nome, matricula, cadastroCompleto }]
//
// POST /professor/alunos   (pré-cadastra aluno, sem senha)
//   body: { ra, nome }
//   201: { id, nome, matricula, cadastroCompleto: false }
//   409: { erro }  quando o RA já existe
//
// GET /professor/alunos/{alunoId}/boletim
// PUT /professor/alunos/{alunoId}/notas               body: { a1, a2 }
// PUT /professor/alunos/{alunoId}/frequencia          body: { faltas }
// POST /professor/alunos/{alunoId}/notas/a3-trabalhos body: { descricao, valor }
// PUT/DELETE .../a3-trabalhos/{trabalhoId}            body: { descricao, valor } (PUT)
//   200 (todos): Boletim — ver README.md para o shape completo
//   422: { erro, campo }  quando nota/falta/trabalho fora do intervalo permitido
// ---------------------------------------------------------------------

export function listarAlunos() {
	return apiFetch('/professor/alunos');
}

export function cadastrarAluno({ ra, nome }) {
	return apiFetch('/professor/alunos', {
		method: 'POST',
		body: JSON.stringify({ ra, nome }),
	});
}

export function buscarBoletimAluno(alunoId) {
	return apiFetch(`/professor/alunos/${alunoId}/boletim`);
}

export function salvarNotas(alunoId, { a1, a2 }) {
	return apiFetch(`/professor/alunos/${alunoId}/notas`, {
		method: 'PUT',
		body: JSON.stringify({ a1, a2 }),
	});
}

export function salvarFrequencia(alunoId, faltas) {
	return apiFetch(`/professor/alunos/${alunoId}/frequencia`, {
		method: 'PUT',
		body: JSON.stringify({ faltas }),
	});
}

export function adicionarTrabalhoA3(alunoId, { descricao, valor }) {
	return apiFetch(`/professor/alunos/${alunoId}/notas/a3-trabalhos`, {
		method: 'POST',
		body: JSON.stringify({ descricao, valor }),
	});
}

export function atualizarTrabalhoA3(alunoId, trabalhoId, { descricao, valor }) {
	return apiFetch(`/professor/alunos/${alunoId}/notas/a3-trabalhos/${trabalhoId}`, {
		method: 'PUT',
		body: JSON.stringify({ descricao, valor }),
	});
}

export function removerTrabalhoA3(alunoId, trabalhoId) {
	return apiFetch(`/professor/alunos/${alunoId}/notas/a3-trabalhos/${trabalhoId}`, {
		method: 'DELETE',
	});
}

// ---------------------------------------------------------------------
// Aluno
//
// GET /aluno/boletim
//   200: Boletim do aluno autenticado (mesmo shape do boletim do professor)
// ---------------------------------------------------------------------

export function buscarMeuBoletim() {
	return apiFetch('/aluno/boletim');
}

export { ApiError };
