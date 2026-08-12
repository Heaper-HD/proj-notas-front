'use client';

import { useEffect, useState } from 'react';
import { listarAlunos, cadastrarAluno, ApiError } from '../../../lib/api';

export default function AlunosProfessorPage() {
	const [alunos, setAlunos] = useState([]);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState(null);
	const [sucesso, setSucesso] = useState(null);
	const [form, setForm] = useState({ ra: '', nome: '' });
	const [salvando, setSalvando] = useState(false);

	function carregar() {
		setCarregando(true);
		return listarAlunos()
			.then(setAlunos)
			.catch((err) => setErro(err instanceof ApiError ? err.message : 'Falha ao carregar alunos.'))
			.finally(() => setCarregando(false));
	}

	useEffect(() => {
		carregar();
	}, []);

	async function handleSubmit(event) {
		event.preventDefault();
		setErro(null);
		setSucesso(null);
		setSalvando(true);
		try {
			await cadastrarAluno(form);
			setSucesso(`Aluno ${form.nome} cadastrado. Ele define a própria senha em "Criar conta" com o RA ${form.ra}.`);
			setForm({ ra: '', nome: '' });
			await carregar();
		} catch (err) {
			setErro(err instanceof ApiError ? err.message : 'Não foi possível cadastrar o aluno.');
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div className="painel">
			<h1>Alunos</h1>
			<p className="lede">
				Cadastre o aluno com o RA e o nome — ele mesmo define a senha depois, na tela de login,
				em &quot;Criar conta&quot;, usando esse mesmo RA.
			</p>

			<form className="form" onSubmit={handleSubmit}>
				<div className="grid-notas grid-notas-2">
					<label className="field">
						<span>RA</span>
						<input
							type="text"
							value={form.ra}
							onChange={(e) => setForm((f) => ({ ...f, ra: e.target.value }))}
							required
						/>
					</label>
					<label className="field">
						<span>Nome</span>
						<input
							type="text"
							value={form.nome}
							onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
							required
						/>
					</label>
				</div>
				<button className="test-btn" type="submit" disabled={salvando}>
					{salvando ? 'Cadastrando…' : 'Cadastrar aluno'}
				</button>
			</form>

			{erro && (
				<div className="status-row status-fail">
					<span className="status-dot" />
					{erro}
				</div>
			)}
			{sucesso && (
				<div className="status-row status-ok">
					<span className="status-dot" />
					{sucesso}
				</div>
			)}

			<div className="divider" />

			<h2 className="subtitulo">Todos os alunos</h2>
			{carregando && <p className="lede">Carregando…</p>}
			{!carregando && alunos.length === 0 && <p className="lede">Nenhum aluno cadastrado ainda.</p>}

			{!carregando && alunos.length > 0 && (
				<ul className="lista-trabalhos">
					{alunos.map((aluno) => (
						<li key={aluno.id} className="trabalho-item">
							<span className="trabalho-descricao">
								{aluno.nome} — {aluno.matricula}
							</span>
							<span className={`status-badge ${aluno.cadastroCompleto ? 'badge-aprovado' : 'badge-pendente'}`}>
								{aluno.cadastroCompleto ? 'Cadastro completo' : 'Aguardando 1º acesso'}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
