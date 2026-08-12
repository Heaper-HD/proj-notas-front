'use client';

function arredondar(valor) {
	return Math.round(valor * 100) / 100;
}

export default function NumberStepper({ value, onChange, min = 0, max, step = 1, ariaLabel }) {
	const numero = Number(value) || 0;

	function ajustar(delta) {
		let novo = arredondar(numero + delta);
		if (min !== undefined) novo = Math.max(min, novo);
		if (max !== undefined) novo = Math.min(max, novo);
		onChange(novo);
	}

	function handleInputChange(event) {
		const texto = event.target.value;
		if (texto === '') {
			onChange(0);
			return;
		}
		let novo = Number(texto);
		if (Number.isNaN(novo)) return;
		if (min !== undefined) novo = Math.max(min, novo);
		if (max !== undefined) novo = Math.min(max, novo);
		onChange(novo);
	}

	return (
		<div className="stepper">
			<button
				type="button"
				className="stepper-btn"
				onClick={() => ajustar(-step)}
				disabled={min !== undefined && numero <= min}
				aria-label={`Diminuir${ariaLabel ? ' ' + ariaLabel : ''}`}
			>
				−
			</button>
			<input
				type="number"
				className="stepper-input"
				value={value}
				min={min}
				max={max}
				step={step}
				onChange={handleInputChange}
				aria-label={ariaLabel}
			/>
			<button
				type="button"
				className="stepper-btn"
				onClick={() => ajustar(step)}
				disabled={max !== undefined && numero >= max}
				aria-label={`Aumentar${ariaLabel ? ' ' + ariaLabel : ''}`}
			>
				+
			</button>
		</div>
	);
}
