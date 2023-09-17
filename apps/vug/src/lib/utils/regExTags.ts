// Tags

// patterns
export const regExVugTag = /^[^\s\.#(]+?(?=\b|[\.#\s(])/i

// functions
export function extractElementTagFromVug(elString: string) {
	const matches = elString.match(regExVugTag);
	return matches && matches[0] ? matches[0] : 'div';
}