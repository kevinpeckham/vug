// parse Vug document

// import
import { parseVugElement } from '$functions/parseVugElement';

// types
interface VugNode {
	attributes?: string;
	index: number;
	indent: number;
	vugString: string;
	htmlString?: string;
	nodeType?: string;
	parentIndex?: number;
	// openTag?: string;
	// closeTag?: string;
	isSelfClosing?: boolean;
	tag?: string;
	textContent?: string;
	root?: boolean;
}

// create array to store nodes
let nodeArray: VugNode[];
$: nodeArray = [];

// regex pattern to find vug nodes and elements
// e.g. doctype node: `doctype html`
// e.g. comment node: `// comment`
// e.g. text node: `| text`
// ** elements are returned with attributes and inline text
// e.g. element: `div#id.class1.class2(id='test') text`
const vugNodes = /(?:\t*)?(?:[\w-:.#//|~◻︎]+)+(?:\(+?(.|\n)*\)+?)?(?:[^\n]*)?(?=$|\n)/ig;

// const vugElementWithPossibleInlineContent = /(?: *\t*)?(?:[\w-:.#]+)+(?:\(+?(.|\n)*\)+?)?(?:[^\n]*)?(?=$|\n)/i;
// const allVugElements =/(?: *\t*)?(?:[\w-:.#]+)+(?:\(+?(.|\n)*\)+?)?(?:[^\n]*)?(?=$|\n)/ig;

// regex pattern to match spaces or tabs at beginning of line
// const regExLeadingSpaces = /^(\s+)/g;

// functions
export function replaceDoubleSpacesWithTabs(input: string) {
	return input.replace(/  /g, '\t');
}

// export function replaceTabsWithPlaceholder(input: string) {
// 	return input.replace(/\t/g, tabPlaceholder);
// }

export function parseVugNode(node:VugNode) {
	const {index, indent, vugString, } = node;

	// if node is root node
	if (index == 0) {
		node.root = true;
	}

	// if node has an indent number equal to zero
	// then assign parent to -1
	if (indent == 0) {
		node.parentIndex = -1;
	}

	// else if node has a number sequentially higher than previous node
	// then assign parent to equal previous node
	else if (index > 0 && nodeArray[index - 1].indent < indent) {
		node.parentIndex = index - 1;
	}
	// else if node has a number equal to previous node
	// then assign parent to equal previous node's parent
	else if (index > 0 && nodeArray[index - 1].indent == indent) {
		node.parentIndex = nodeArray[index - 1].parentIndex;
	}
	// if node has a number sequentially lower than previous node but not zero
	// then we need to find the parent
	else if (index > 0 && nodeArray[index - 1].indent > indent) {
		// iterate through previous nodes
		for (let i = index - 1; i >= 0; i--) {
			// if previous node has an indent number equal to current node
			// then assign parent to equal previous node parent
			if (nodeArray[i].indent == indent) {
				// assign parent to equal previous node
				node.parentIndex = nodeArray[i].parentIndex;
				break;
			}
		}
	}

	// prepare output string
	// let outputString = '';

	// prepare tabs
	let tabs = '';

	// iterate through indent level
	for (let i = 0; i < indent; i++) {
		tabs += `\t`;
	}

	// if node is a comment node
	if (vugString.startsWith('//')) {
		// const outputString = `${tabs}`;
		// add comment
		node.htmlString = `<!-- ${vugString.replace('//', '')} -->`;
		node.nodeType = 'comment';
	}

	// else if node is a text node
	else if (vugString.startsWith('|')) {
		node.htmlString = `${vugString.replace('|', '')}`;
		node.nodeType = 'text';
	}

	else if (vugString.startsWith('doctype')) {
		if (vugString.includes('html')) {
			node.htmlString = `<!DOCTYPE html>`;
		}
		//TODO : other doctypes -- add later
		node.nodeType = 'doctype';
	}

	// else is probably an element
	else {
		// get tag, attributeString, and textcontent
		const [tag, attributes, content, isSelfClosing ] = parseVugElement(node.vugString)
		node.tag = tag;
		node.attributes = attributes;
		node.isSelfClosing = (JSON.parse(isSelfClosing));
		node.textContent = content;
	}	}

export function parseVugDocument(input: string) {

	// replace double spaces with tabs
	const doubleSpacesToTabs = replaceDoubleSpacesWithTabs(input);

	// match first element
	const matches = doubleSpacesToTabs.match(vugNodes);
	const nodes = matches ? matches : [''];

	// begin index
	let nodeIndex = 0;

	// reset node array
	nodeArray = [];

	// iterate through nodes
	nodes.forEach(node => {
		// stringify to more easily count the tabs
		const stringifiedNode = JSON.stringify(node);
		const stringifiedInitialTabs = /^"((\\)t)+/ig;
		const stringifiedTabsMatched = stringifiedNode.match(stringifiedInitialTabs);
		const sfm = stringifiedTabsMatched ? stringifiedTabsMatched[0] : '';

		// calculate the indent level
		const indentLevel = Math.floor(sfm.length/2);

		// trim tabs from string
		const vugString = node.replace(/^\t+/, '')


		const nodeObj = {
			index: nodeIndex,
			indent: indentLevel,
			vugString: vugString
		}
		nodeArray.push(nodeObj);
		nodeIndex++
	});

	// iterate back though nodes
	nodeArray.forEach(node => {
		const result = parseVugNode(node);
	});
	return JSON.stringify(nodeArray, null, 2);
	}