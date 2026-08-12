'use client';

const ROTULOS = {
	aprovado: 'Aprovado',
	reprovado: 'Reprovado',
	pendente: 'Pendente',
};

export default function StatusBadge({ situacao }) {
	const classe =
		situacao === 'aprovado'
			? 'badge-aprovado'
			: situacao === 'reprovado'
				? 'badge-reprovado'
				: 'badge-pendente';

	return (
		<span className={`status-badge ${classe}`}>
			{ROTULOS[situacao] ?? situacao ?? 'Pendente'}
		</span>
	);
}
