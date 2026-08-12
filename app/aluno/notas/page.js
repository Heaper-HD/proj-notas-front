'use client';

import { useEffect, useState } from 'react';
import { buscarMeuBoletim, ApiError } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';

export default function NotasAlunoPage() {
	const [boletim, setBoletim] = useState(null);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState(null);

	useEffect(() => {
		buscarMeuBoletim()
			.then(setBoletim)
			.catch((err) => setErro(err instanceof ApiError ? err.message : 'Falha ao carregar suas notas.'))
			.finally(() => setCarregando(false));
	}, []);

	return (
		<div className="painel">
			<h1>Minhas notas</h1>

			{carregando && <p className="lede">Carregando…</p>}

			{erro && (
				<div className="status-row status-fail">
					<span className="status-dot" />
					{erro}
				</div>
			)}

			{boletim && !carregando && (
				<>
					{boletim.statusNota === 'pendente' ? (
						<p className="lede">O professor ainda não lançou todas as suas notas.</p>
					) : (
						<div className="resultado">
							<div className="resultado-item">
								<span className="resultado-label">Situação</span>
								<StatusBadge situacao={boletim.situacaoFinal} />
							</div>
						</div>
					)}

					<div className="grid-notas grid-notas-leitura">
						<div className="nota-card">
							<span className="resultado-label">A1 (0–30)</span>
							<span className="resultado-valor">{boletim.notas.a1 ?? '—'}</span>
						</div>
						<div className="nota-card">
							<span className="resultado-label">A2 (0–30)</span>
							<span className="resultado-valor">{boletim.notas.a2 ?? '—'}</span>
						</div>
						<div className="nota-card">
							<span className="resultado-label">A3 (0–40)</span>
							<span className="resultado-valor">{boletim.notas.a3 ?? '—'}</span>
						</div>
						<div className="nota-card">
							<span className="resultado-label">Média final</span>
							<span className="resultado-valor">{boletim.notas.media ?? '—'}</span>
						</div>
					</div>

					{boletim.notas.trabalhosA3.length > 0 && (
						<>
							<h2 className="subtitulo">Trabalhos (compõem a A3)</h2>
							<ul className="lista-trabalhos">
								{boletim.notas.trabalhosA3.map((trabalho) => (
									<li key={trabalho.id} className="trabalho-item">
										<span className="trabalho-descricao">{trabalho.descricao}</span>
										<span className="trabalho-valor">{trabalho.valor}</span>
									</li>
								))}
							</ul>
						</>
					)}

					{boletim.reprovadoPorFalta && (
						<div className="status-row status-fail">
							<span className="status-dot" />
							Você está reprovado por excesso de faltas, independente da média final.
						</div>
					)}
				</>
			)}
		</div>
	);
}
