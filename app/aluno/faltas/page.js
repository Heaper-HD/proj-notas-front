'use client';

import { useEffect, useState } from 'react';
import { buscarMeuBoletim, ApiError } from '../../../lib/api';

export default function FaltasAlunoPage() {
	const [boletim, setBoletim] = useState(null);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState(null);

	useEffect(() => {
		buscarMeuBoletim()
			.then(setBoletim)
			.catch((err) => setErro(err instanceof ApiError ? err.message : 'Falha ao carregar suas faltas.'))
			.finally(() => setCarregando(false));
	}, []);

	return (
		<div className="painel">
			<h1>Minhas faltas</h1>

			{carregando && <p className="lede">Carregando…</p>}

			{erro && (
				<div className="status-row status-fail">
					<span className="status-dot" />
					{erro}
				</div>
			)}

			{boletim && !carregando && (
				<>
					<div className="resultado">
						<div className="resultado-item">
							<span className="resultado-label">Total de faltas</span>
							<span className="resultado-valor">{boletim.frequencia.faltas}</span>
						</div>
						<div className="resultado-item">
							<span className="resultado-label">Limite permitido</span>
							<span className="resultado-valor">{boletim.frequencia.limiteFaltas}</span>
						</div>
					</div>

					{boletim.reprovadoPorFalta ? (
						<div className="status-row status-fail">
							<span className="status-dot" />
							Você ultrapassou o limite de faltas e está reprovado por frequência.
						</div>
					) : (
						<div className="status-row status-ok">
							<span className="status-dot" />
							Dentro do limite de faltas permitido.
						</div>
					)}
				</>
			)}
		</div>
	);
}
