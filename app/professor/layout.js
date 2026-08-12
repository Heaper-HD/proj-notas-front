'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obterUsuario, limparSessao } from '../../lib/api';
import Sidebar from '../../components/Sidebar';

const ITENS = [
	{ href: '/professor/alunos', label: 'Alunos' },
	{ href: '/professor/notas', label: 'Notas' },
	{ href: '/professor/frequencia', label: 'Frequência' },
];

export default function ProfessorLayout({ children }) {
	const router = useRouter();
	const [usuario, setUsuario] = useState(null);

	useEffect(() => {
		const sessao = obterUsuario();
		if (!sessao || sessao.perfil !== 'professor') {
			router.replace('/');
			return;
		}
		setUsuario(sessao);
	}, [router]);

	if (!usuario) return null;

	return (
		<div className="shell">
			<Sidebar
				nome={usuario.nome}
				itens={ITENS}
				aoSair={() => {
					limparSessao();
					router.replace('/');
				}}
			/>
			<main className="content">{children}</main>
		</div>
	);
}
