export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function apiFetch(path, init) {
	if (!API_BASE_URL) {
		throw new Error("NEXT_PUBLIC_API_BASE_URL não está definida.");
	}
	return fetch(`${API_BASE_URL}${path}`, init);
}
