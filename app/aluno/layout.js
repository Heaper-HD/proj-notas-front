'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obterUsuario, limparSessao } from '../../lib/api';
import Sidebar from '../../components/Sidebar';

const ITENS = [
	{ href: '/aluno/notas', label: 'Notas' },
	{ href: '/aluno/faltas', label: 'Faltas' },
	{ href: '/aluno/calculadora', label: 'Calculadora' },
];

export default function AlunoLayout({ children }) {
	const router = useRouter();
	const [usuario, setUsuario] = useState(null);

	useEffect(() => {
		const sessao = obterUsuario();
		if (!sessao || sessao.perfil !== 'aluno') {
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
