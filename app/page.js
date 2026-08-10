'use client';

import { useState } from 'react';
import { API_BASE_URL } from '../lib/api';

export default function Home() {
	const [status, setStatus] = useState(null);
	const [checking, setChecking] = useState(false);

	async function testarConexao() {
		setChecking(true);
		setStatus(null);
		try {
			const res = await fetch(API_BASE_URL);
			setStatus({
				ok: true,
				message: `Respondeu com status ${res.status}`,
			});
		} catch (err) {
			setStatus({ ok: false, message: err.message });
		} finally {
			setChecking(false);
		}
	}

	return (
		<div className="page">
			<div className="card">
				<div className="card-top">
					<img
						src="/logos/Horizontal-Sem-Decodificador.png"
						alt="FADERGS"
						className="logo"
					/>
					<span className="badge">
						template-front-next-javascript
					</span>
				</div>

				<h1>Esse projeto ainda não tem interface.</h1>
				<p className="lede">
					Esta é a página padrão do template — substitua o conteúdo de{' '}
					<code>app/page.js</code> pelo que seu projeto realmente
					precisa.
				</p>

				<div className="divider" />

				<div className="api-panel">
					<span className="api-label">API configurada</span>
					<code className="api-url">
						{API_BASE_URL ||
							'(NEXT_PUBLIC_API_BASE_URL não definida)'}
					</code>
				</div>

				<button
					className="test-btn"
					onClick={testarConexao}
					disabled={!API_BASE_URL || checking}
				>
					{checking ? 'Testando…' : 'Testar conexão com a API'}
				</button>

				{status && (
					<div
						className={`status-row ${status.ok ? 'status-ok' : 'status-fail'}`}
					>
						<span className="status-dot" />
						{status.message}
					</div>
				)}
			</div>
		</div>
	);
}
