'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ nome, itens, aoSair }) {
	const pathname = usePathname();

	return (
		<aside className="sidebar">
			<div className="sidebar-top">
				<img
					src="/logos/Horizontal-Sem-Decodificador.png"
					alt="FADERGS"
					className="sidebar-logo"
				/>
			</div>

			<div className="sidebar-user">
				<span className="sidebar-user-label">Logado como</span>
				<span className="sidebar-user-nome">{nome}</span>
			</div>

			<nav className="sidebar-nav">
				{itens.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
					>
						{item.label}
					</Link>
				))}
			</nav>

			<button className="sidebar-logout" onClick={aoSair}>
				Sair
			</button>
		</aside>
	);
}
