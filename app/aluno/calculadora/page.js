'use client';

import { useId, useMemo, useState } from 'react';
import NumberStepper from '../../../components/NumberStepper';
import StatusBadge from '../../../components/StatusBadge';
import { calcularSituacao, LIMITE_A3, LIMITE_FALTAS } from '../../../lib/calculoNotas';

function novoTrabalho(id) {
	return { id, valor: 0 };
}

export default function CalculadoraAlunoPage() {
	const gerarId = useId();
	const [proximoId, setProximoId] = useState(1);
	const [a1, setA1] = useState(0);
	const [a2, setA2] = useState(0);
	const [faltas, setFaltas] = useState(0);
	const [trabalhos, setTrabalhos] = useState([{ id: `${gerarId}-0`, valor: 0 }]);

	const somaTrabalhos = useMemo(
		() => trabalhos.reduce((soma, t) => soma + Number(t.valor || 0), 0),
		[trabalhos],
	);
	const estourouA3 = somaTrabalhos > LIMITE_A3;
	const a3 = Math.min(somaTrabalhos, LIMITE_A3);

	const resultado = useMemo(() => calcularSituacao({ a1, a2, a3, faltas }), [a1, a2, a3, faltas]);

	function adicionarTrabalho() {
		setTrabalhos((lista) => [...lista, novoTrabalho(`${gerarId}-${proximoId}`)]);
		setProximoId((n) => n + 1);
	}

	function atualizarTrabalho(id, valor) {
		setTrabalhos((lista) => lista.map((t) => (t.id === id ? { ...t, valor } : t)));
	}

	function removerTrabalho(id) {
		setTrabalhos((lista) => (lista.length > 1 ? lista.filter((t) => t.id !== id) : lista));
	}

	function limpar() {
		setA1(0);
		setA2(0);
		setFaltas(0);
		setTrabalhos([{ id: `${gerarId}-0`, valor: 0 }]);
		setProximoId(1);
	}

	return (
		<div className="painel">
			<h1>Calculadora de notas</h1>
			<p className="lede">
				Simulação sua, só nesta página — não salva nada, não envia nada pro professor. Serve pra
				você testar cenários antes das notas oficiais serem lançadas. Mesma regra do sistema: A1 e
				A2 são provas (0–30 cada), A3 é a soma dos trabalhos (0–40 no total), aprovado com média
				≥ 70, reprovado com mais de {LIMITE_FALTAS} faltas mesmo com média boa.
			</p>

			<div className="grid-notas grid-notas-2">
				<label className="field">
					<span>A1 — prova (0–30)</span>
					<NumberStepper value={a1} onChange={setA1} min={0} max={30} step={0.5} ariaLabel="A1" />
				</label>
				<label className="field">
					<span>A2 — prova (0–30)</span>
					<NumberStepper value={a2} onChange={setA2} min={0} max={30} step={0.5} ariaLabel="A2" />
				</label>
			</div>

			<div className="divider" />

			<h2 className="subtitulo">Trabalhos (A3)</h2>
			<p className="lede">
				A3 simulada: <strong>{a3}</strong> / {LIMITE_A3}, somando {trabalhos.length} trabalho(s).
			</p>

			<ul className="lista-trabalhos">
				{trabalhos.map((trabalho, indice) => (
					<li key={trabalho.id} className="trabalho-item">
						<span className="trabalho-descricao">Trabalho {indice + 1}</span>
						<NumberStepper
							value={trabalho.valor}
							onChange={(valor) => atualizarTrabalho(trabalho.id, valor)}
							min={0}
							max={40}
							step={0.5}
							ariaLabel={`valor do trabalho ${indice + 1}`}
						/>
						<div className="trabalho-acoes">
							<button
								type="button"
								className="mini-btn mini-btn-danger"
								onClick={() => removerTrabalho(trabalho.id)}
								disabled={trabalhos.length === 1}
							>
								Remover
							</button>
						</div>
					</li>
				))}
			</ul>

			<div className="form-trabalho-botoes">
				<button type="button" className="test-btn" onClick={adicionarTrabalho}>
					+ Adicionar trabalho
				</button>
			</div>

			{estourouA3 && (
				<div className="status-row status-fail">
					<span className="status-dot" />
					A soma dos trabalhos deu {somaTrabalhos} — passa do limite de {LIMITE_A3}. Na prática a
					A3 fica travada em {LIMITE_A3}; ajuste os valores pra simular direito.
				</div>
			)}

			<div className="divider" />

			<label className="field campo-faltas">
				<span>Faltas (simulação)</span>
				<NumberStepper value={faltas} onChange={setFaltas} min={0} max={60} step={1} ariaLabel="faltas" />
			</label>

			<div className="resultado">
				<div className="resultado-item">
					<span className="resultado-label">Média final</span>
					<span className="resultado-valor">{resultado.media}</span>
				</div>
				<div className="resultado-item">
					<span className="resultado-label">Situação</span>
					<StatusBadge situacao={resultado.situacaoFinal} />
				</div>
			</div>

			{resultado.reprovadoPorFalta && (
				<div className="status-row status-fail">
					<span className="status-dot" />
					Com {faltas} faltas (mais de {LIMITE_FALTAS}), a situação seria reprovado por frequência
					mesmo com essa média.
				</div>
			)}

			<button type="button" className="mini-btn limpar-btn" onClick={limpar}>
				Limpar tudo
			</button>
		</div>
	);
}
