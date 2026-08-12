'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, registrarAluno, salvarSessao, ApiError } from '../lib/api';

export default function Home() {
	const router = useRouter();
	const [perfil, setPerfil] = useState('professor');
	const [modo, setModo] = useState('login'); // 'login' | 'cadastro' (só pra aluno)
	const [identificador, setIdentificador] = useState('');
	const [nome, setNome] = useState('');
	const [senha, setSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [carregando, setCarregando] = useState(false);
	const [erro, setErro] = useState(null);

	function trocarPerfil(novoPerfil) {
		setPerfil(novoPerfil);
		setModo('login');
		setErro(null);
	}

	function trocarModo(novoModo) {
		setModo(novoModo);
		setErro(null);
	}

	async function entrar() {
		const resposta = await login({ perfil, identificador, senha });
		salvarSessao(resposta.token, resposta.usuario);
		router.push(resposta.usuario.perfil === 'professor' ? '/professor/notas' : '/aluno/notas');
	}

	async function cadastrar() {
		if (senha !== confirmarSenha) {
			setErro('As senhas não coincidem.');
			return;
		}
		const resposta = await registrarAluno({ ra: identificador, nome, senha });
		salvarSessao(resposta.token, resposta.usuario);
		router.push('/aluno/notas');
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setErro(null);
		setCarregando(true);
		try {
			if (modo === 'cadastro') {
				await cadastrar();
			} else {
				await entrar();
			}
		} catch (err) {
			setErro(err instanceof ApiError ? err.message : 'Não foi possível continuar. Tente novamente.');
		} finally {
			setCarregando(false);
		}
	}

	const rotuloIdentificador =
		perfil === 'professor' ? 'Matrícula ou e-mail' : modo === 'cadastro' ? 'RA (novo cadastro)' : 'RA';

	return (
		<div className="page">
			<div className="card">
				<div className="card-top">
					<img
						src="/logos/Horizontal-Sem-Decodificador.png"
						alt="FADERGS"
						className="logo"
					/>
					<span className="badge">FAD-Notas</span>
				</div>

				<h1>Sistema de Notas e Frequência</h1>
				<p className="lede">
					{modo === 'cadastro' ? 'Crie sua conta com o seu RA.' : 'Acesse com seu perfil para continuar.'}
				</p>

				<div className="tabs" role="tablist">
					<button
						type="button"
						role="tab"
						aria-selected={perfil === 'professor'}
						className={`tab ${perfil === 'professor' ? 'active' : ''}`}
						onClick={() => trocarPerfil('professor')}
					>
						Professor
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={perfil === 'aluno'}
						className={`tab ${perfil === 'aluno' ? 'active' : ''}`}
						onClick={() => trocarPerfil('aluno')}
					>
						Aluno
					</button>
				</div>

				<form className="form" onSubmit={handleSubmit}>
					<label className="field">
						<span>{rotuloIdentificador}</span>
						<input
							type="text"
							value={identificador}
							onChange={(e) => setIdentificador(e.target.value)}
							required
							autoComplete="username"
						/>
					</label>

					{perfil === 'aluno' && modo === 'cadastro' && (
						<label className="field">
							<span>Nome</span>
							<input
								type="text"
								value={nome}
								onChange={(e) => setNome(e.target.value)}
								required
								autoComplete="name"
							/>
						</label>
					)}

					<label className="field">
						<span>Senha</span>
						<input
							type="password"
							value={senha}
							onChange={(e) => setSenha(e.target.value)}
							required
							minLength={modo === 'cadastro' ? 6 : undefined}
							autoComplete={modo === 'cadastro' ? 'new-password' : 'current-password'}
						/>
					</label>

					{perfil === 'aluno' && modo === 'cadastro' && (
						<label className="field">
							<span>Confirmar senha</span>
							<input
								type="password"
								value={confirmarSenha}
								onChange={(e) => setConfirmarSenha(e.target.value)}
								required
								minLength={6}
								autoComplete="new-password"
							/>
						</label>
					)}

					<button className="test-btn" type="submit" disabled={carregando}>
						{carregando ? 'Enviando…' : modo === 'cadastro' ? 'Criar conta' : 'Entrar'}
					</button>
				</form>

				{perfil === 'aluno' && (
					<button
						type="button"
						className="link-btn"
						onClick={() => trocarModo(modo === 'cadastro' ? 'login' : 'cadastro')}
					>
						{modo === 'cadastro' ? 'Já tenho conta — entrar' : 'Não tenho conta — criar com meu RA'}
					</button>
				)}

				{erro && (
					<div className="status-row status-fail">
						<span className="status-dot" />
						{erro}
					</div>
				)}
			</div>
		</div>
	);
}
