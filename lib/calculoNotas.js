// Calculadora client-side (calculadora do aluno) — mesma lógica do
// backend (BoletimCalculator), mas sem chamar a API: é só simulação, não
// lê nem grava nada. Ver README > "API (backend)" para o cálculo real.

export const LIMITE_FALTAS = 13;
const MEDIA_MINIMA_APROVACAO = 70;
export const LIMITE_A3 = 40;

export function calcularSituacao({ a1, a2, a3, faltas }) {
	const media = Number(a1 || 0) + Number(a2 || 0) + Number(a3 || 0);
	const statusNota = media >= MEDIA_MINIMA_APROVACAO ? 'aprovado' : 'reprovado';
	const reprovadoPorFalta = Number(faltas || 0) > LIMITE_FALTAS;
	const situacaoFinal = statusNota === 'reprovado' || reprovadoPorFalta ? 'reprovado' : 'aprovado';

	return { media, statusNota, reprovadoPorFalta, situacaoFinal };
}
