'use client';

import { useEffect, useState } from 'react';
import {
	listarAlunos,
	buscarBoletimAluno,
	salvarNotas,
	adicionarTrabalhoA3,
	atualizarTrabalhoA3,
	removerTrabalhoA3,
	ApiError,
} from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';

export default function NotasProfessorPage() {
	const [alunos, setAlunos] = useState([]);
	const [alunoId, setAlunoId] = useState('');
	const [boletim, setBoletim] = useState(null);
	const [notas, setNotas] = useState({ a1: '', a2: '' });
	const [carregando, setCarregando] = useState(false);
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState(null);

	const [trabalhoEditando, setTrabalhoEditando] = useState(null); // null = novo
	const [trabalhoForm, setTrabalhoForm] = useState({ descricao: '', valor: '' });
	const [salvandoTrabalho, setSalvandoTrabalho] = useState(false);

	useEffect(() => {
		listarAlunos()
			.then(setAlunos)
			.catch((err) => setErro(err instanceof ApiError ? err.message : 'Falha ao carregar alunos.'));
	}, []);

	function carregarBoletim(id) {
		setCarregando(true);
		setErro(null);
		return buscarBoletimAluno(id)
			.then((dados) => {
				setBoletim(dados);
				setNotas({ a1: dados.notas.a1 ?? '', a2: dados.notas.a2 ?? '' });
			})
			.catch((err) => setErro(err instanceof ApiError ? err.message : 'Falha ao carregar boletim.'))
			.finally(() => setCarregando(false));
	}

	useEffect(() => {
		if (!alunoId) {
			setBoletim(null);
			return;
		}
		setTrabalhoEditando(null);
		setTrabalhoForm({ descricao: '', valor: '' });
		carregarBoletim(alunoId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [alunoId]);

	async function handleSubmitNotas(event) {
		event.preventDefault();
		setErro(null);
		setSalvando(true);
		try {
			const dados = await salvarNotas(alunoId, {
				a1: notas.a1 === '' ? null : Number(notas.a1),
				a2: notas.a2 === '' ? null : Number(notas.a2),
			});
			setBoletim(dados);
		} catch (err) {
			setErro(err instanceof ApiError ? err.message : 'Não foi possível salvar as notas.');
		} finally {
			setSalvando(false);
		}
	}

	function iniciarEdicaoTrabalho(trabalho) {
		setTrabalhoEditando(trabalho.id);
		setTrabalhoForm({ descricao: trabalho.descricao, valor: String(trabalho.valor) });
	}

	function cancelarEdicaoTrabalho() {
		setTrabalhoEditando(null);
		setTrabalhoForm({ descricao: '', valor: '' });
	}

	async function handleSubmitTrabalho(event) {
		event.preventDefault();
		setErro(null);
		setSalvandoTrabalho(true);
		try {
			const payload = { descricao: trabalhoForm.descricao, valor: Number(trabalhoForm.valor) };
			const dados =
				trabalhoEditando === null
					? await adicionarTrabalhoA3(alunoId, payload)
					: await atualizarTrabalhoA3(alunoId, trabalhoEditando, payload);
			setBoletim(dados);
			cancelarEdicaoTrabalho();
		} catch (err) {
			setErro(err instanceof ApiError ? err.message : 'Não foi possível salvar o trabalho.');
		} finally {
			setSalvandoTrabalho(false);
		}
	}

	async function handleRemoverTrabalho(trabalhoId) {
		setErro(null);
		try {
			const dados = await removerTrabalhoA3(alunoId, trabalhoId);
			setBoletim(dados);
			if (trabalhoEditando === trabalhoId) cancelarEdicaoTrabalho();
		} catch (err) {
			setErro(err instanceof ApiError ? err.message : 'Não foi possível remover o trabalho.');
		}
	}

	return (
		<div className="painel">
			<h1>Notas</h1>
			<p className="lede">
				A1 e A2 são provas, de 0 a 30 cada. A3 é a soma dos trabalhos lançados abaixo (0 a 40 no
				total). A média final é a soma das três (0 a 100).
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
				<>
					<form className="form" onSubmit={handleSubmitNotas}>
						<div className="grid-notas grid-notas-2">
							<label className="field">
								<span>A1 — prova (0–30)</span>
								<input
									type="number"
									min={0}
									max={30}
									step="0.1"
									value={notas.a1}
									onChange={(e) => setNotas((n) => ({ ...n, a1: e.target.value }))}
								/>
							</label>
							<label className="field">
								<span>A2 — prova (0–30)</span>
								<input
									type="number"
									min={0}
									max={30}
									step="0.1"
									value={notas.a2}
									onChange={(e) => setNotas((n) => ({ ...n, a2: e.target.value }))}
								/>
							</label>
						</div>

						<button className="test-btn" type="submit" disabled={salvando}>
							{salvando ? 'Salvando…' : 'Salvar A1/A2'}
						</button>
					</form>

					<div className="divider" />

					<h2 className="subtitulo">Trabalhos (A3)</h2>
					<p className="lede">
						A3 atual: <strong>{boletim.notas.a3 ?? '—'}</strong> / 40, com{' '}
						{boletim.notas.trabalhosA3.length} trabalho(s) lançado(s).
					</p>

					{boletim.notas.trabalhosA3.length > 0 && (
						<ul className="lista-trabalhos">
							{boletim.notas.trabalhosA3.map((trabalho) => (
								<li key={trabalho.id} className="trabalho-item">
									<span className="trabalho-descricao">{trabalho.descricao}</span>
									<span className="trabalho-valor">{trabalho.valor}</span>
									<div className="trabalho-acoes">
										<button
											type="button"
											className="mini-btn"
											onClick={() => iniciarEdicaoTrabalho(trabalho)}
										>
											Editar
										</button>
										<button
											type="button"
											className="mini-btn mini-btn-danger"
											onClick={() => handleRemoverTrabalho(trabalho.id)}
										>
											Remover
										</button>
									</div>
								</li>
							))}
						</ul>
					)}

					<form className="form form-trabalho" onSubmit={handleSubmitTrabalho}>
						<div className="grid-notas grid-notas-2">
							<label className="field">
								<span>Descrição</span>
								<input
									type="text"
									placeholder="ex: Trabalho 1, Seminário…"
									value={trabalhoForm.descricao}
									onChange={(e) =>
										setTrabalhoForm((f) => ({ ...f, descricao: e.target.value }))
									}
									required
								/>
							</label>
							<label className="field">
								<span>Valor (0–40)</span>
								<input
									type="number"
									min={0}
									max={40}
									step="0.1"
									value={trabalhoForm.valor}
									onChange={(e) => setTrabalhoForm((f) => ({ ...f, valor: e.target.value }))}
									required
								/>
							</label>
						</div>
						<div className="form-trabalho-botoes">
							<button className="test-btn" type="submit" disabled={salvandoTrabalho}>
								{salvandoTrabalho
									? 'Salvando…'
									: trabalhoEditando === null
										? 'Adicionar trabalho'
										: 'Salvar edição'}
							</button>
							{trabalhoEditando !== null && (
								<button type="button" className="mini-btn" onClick={cancelarEdicaoTrabalho}>
									Cancelar
								</button>
							)}
						</div>
					</form>

					<div className="divider" />

					<div className="resultado">
						<div className="resultado-item">
							<span className="resultado-label">Média final</span>
							<span className="resultado-valor">{boletim.notas.media ?? '—'}</span>
						</div>
						<div className="resultado-item">
							<span className="resultado-label">Situação</span>
							<StatusBadge situacao={boletim.situacaoFinal} />
						</div>
					</div>

					{boletim.reprovadoPorFalta && (
						<div className="status-row status-fail">
							<span className="status-dot" />
							Aluno reprovado por faltas ({boletim.frequencia.faltas} de {boletim.frequencia.limiteFaltas}{' '}
							permitidas) — a média não altera essa situação.
						</div>
					)}
				</>
			)}
		</div>
	);
}
