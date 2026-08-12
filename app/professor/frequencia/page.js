'use client';

import { useEffect, useState } from 'react';
import { listarAlunos, buscarBoletimAluno, salvarFrequencia, ApiError } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';

export default function FrequenciaProfessorPage() {
	const [alunos, setAlunos] = useState([]);
	const [alunoId, setAlunoId] = useState('');
	const [boletim, setBoletim] = useState(null);
	const [faltas, setFaltas] = useState('');
	const [carregando, setCarregando] = useState(false);
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState(null);

	useEffect(() => {
		listarAlunos()
			.then(setAlunos)
			.catch((err) => setErro(err instanceof ApiError ? err.message : 'Falha ao carregar alunos.'));
	}, []);

	useEffect(() => {
		if (!alunoId) {
			setBoletim(null);
			return;
		}
		setCarregando(true);
		setErro(null);
		buscarBoletimAluno(alunoId)
			.then((dados) => {
				setBoletim(dados);
				setFaltas(String(dados.frequencia.faltas ?? 0));
			})
			.catch((err) => setErro(err instanceof ApiError ? err.message : 'Falha ao carregar frequência.'))
			.finally(() => setCarregando(false));
	}, [alunoId]);

	async function handleSubmit(event) {
		event.preventDefault();
		setErro(null);
		setSalvando(true);
		try {
			const dados = await salvarFrequencia(alunoId, Number(faltas));
			setBoletim(dados);
		} catch (err) {
			setErro(err instanceof ApiError ? err.message : 'Não foi possível salvar a frequência.');
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div className="painel">
			<h1>Frequência</h1>
			<p className="lede">
				Acima de 12 faltas totais, o aluno é reprovado por frequência — mesmo com média final aceitável.
			</p>

			<label className="field">
				<span>Aluno</span>
				<select value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
					<option value="">Selecione um aluno</option>
					{alunos.map((aluno) => (
						<option key={aluno.id} value={aluno.id}>
							{aluno.nome} — {aluno.matricula}
						</option>
					))}
				</select>
			</label>

			{erro && (
				<div className="status-row status-fail">
					<span className="status-dot" />
					{erro}
				</div>
			)}

			{carregando && <p className="lede">Carregando…</p>}

			{boletim && !carregando && (
				<form className="form" onSubmit={handleSubmit}>
					<label className="field">
						<span>Total de faltas</span>
						<input
							type="number"
							min={0}
							step="1"
							value={faltas}
							onChange={(e) => setFaltas(e.target.value)}
						/>
					</label>

					<button className="test-btn" type="submit" disabled={salvando}>
						{salvando ? 'Salvando…' : 'Salvar frequência'}
					</button>

					<div className="resultado">
						<div className="resultado-item">
							<span className="resultado-label">Limite permitido</span>
							<span className="resultado-valor">{boletim.frequencia.limiteFaltas}</span>
						</div>
						<div className="resultado-item">
							<span className="resultado-label">Situação</span>
							<StatusBadge situacao={boletim.situacaoFinal} />
						</div>
					</div>

					{boletim.reprovadoPorFalta && (
						<div className="status-row status-fail">
							<span className="status-dot" />
							Reprovado por excesso de faltas.
						</div>
					)}
				</form>
			)}
		</div>
	);
}
