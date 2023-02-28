// imports
import { removeConsecutiveSpaces } from '$utils/stringCleaning';

// parentheses
export const regExInsideParens =  /\((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))+\)/i;

//1.  Classes
export const regExAllClassLiterals = /\.([^\s.#()]*)(?=[\s.#()]|$)/ig;
export const regExAllClassAttributesWithQuotes = /class(!?=)(['"`])(.*?)\2/ig;
export const regExAllClassAttributesWithoutQuotes = /class(!?)=[^'"`\s),]+(?=[\s),])/ig;
export const regExAllClassAttributes = new RegExp(`${regExAllClassAttributesWithQuotes.source}|${regExAllClassAttributesWithoutQuotes.source}`, 'ig')
export const regExAllClasses = new RegExp(`${regExAllClassAttributes.source}|${regExAllClassLiterals.source}`, 'ig')
export const regExAllClassDeclarations = /class!?=/ig;
export const extractAllClassesFromVug = (inputString: string) => {
	//- looks for class literals and class attributes
	//- class literals are of the form .class-name
	//- class attributes are of the form class="class-name"
	//- class attributes can also be of the form class!="{class-name}"
	//- class attributes can also be of the form class={class-name}
	//- class attributes can also be of the form class={class-name} class!="{class-name}"
	//const regex = /class!?=.*?(?=[\s)])|\.([^\s.#()]*)(?=[\s.#()]|$)/ig
	const regex =  new RegExp(`${regExAllClassAttributes.source}|${regExAllClassLiterals.source}`, 'ig')

	const matches = inputString.match(regExAllClasses);
	const valuesArray = matches ? matches.map(match => {
		//- if the match starts with a period, it's a class literal
		//- if it doesn't, it's a class attribute
		if (match[0] == '.') { return match.slice(1) }
		else {
		 //- if it's a class attribute, we need to remove the class= and the quotes
		 const matchNameRegex = /class!?=/ig;
		 const nameRemoved = match.replace(matchNameRegex, '');
		 const matchQuotesRegex = /["']/ig;
		 const quotesRemoved = nameRemoved.replace(matchQuotesRegex, '');
		 //- we also need to remove consecutive spaces
		 const scrubbed = removeConsecutiveSpaces(quotesRemoved).trim();
			return scrubbed
		}
	}) : [];
	//-
	const classes: string[] = [];
	valuesArray.forEach(item => {
		if (item.includes(' ')) {
			const split = item.split(' ');
			split.forEach(item => {
				if (item) {
					classes.push(item);
				}
			})
		} else {
			classes.push(item);
		}
	})


	//- filter out empty values
	const filterOutEmptyValues = classes.filter(item => item !== '');
	//- create a set to remove duplicates
	const set = new Set(filterOutEmptyValues);
	return set;
}

//2. Ids
//- the id attribute should only contain letters, digits, hyphens, underscores, and colons, and it should start with a letter.
export const regExIdLiteral = /#[^.\s\n\r()#]+/i;
export const regExIdAttributeWithQuotes = /id=(["'`])(.*?)\1/i;
export const regExIdAttributeWithoutQuotes = /id(!?)=[^'"`\s),]+(?=[\s),])/i;
export const regExIdAttribute = new RegExp(`${regExIdAttributeWithQuotes.source}|${regExIdAttributeWithoutQuotes.source}`, 'i');
export const regExId = new RegExp(`${regExIdLiteral.source}|${regExIdAttribute.source}`, 'i');
export function extractIdFromVug(inputString: string) {
		//- try to match the id literal first
		const literalMatches = inputString.match(regExIdLiteral);
		const literal = literalMatches ? literalMatches[0] : "";
		//- if that fails, try to match the id attribute
		if (!literal) {
			const attributeMatches = inputString.match(regExIdAttribute);
			const attributeString = attributeMatches ? attributeMatches[0] : "";
			//- remove the id= part of the attribute
			const declaration = /id(!?)=/i;
			const attribute = attributeString.replace(declaration, "");
			//- remove the quotes if they exist
			const quotes = /["'`]/g;
			const id = attribute.replace(quotes, "");
			//- scrub the id of any whitespace
			const scrubbed = id.replace(/\s/g, "");
			return scrubbed;
		} else {
			return literal;
		}
  }
//3. Attributes
// everything inside the parentheses is an attribute
export function extractParentheses(inputString: string) {
	const matches = inputString.match(regExInsideParens);
	return matches ? matches[0] : "";
}


//- ** inside quotes **
//- with equals and quotes
//- id="apple"
//- id='orange'
//- id=`passion fruit`
//- id="{x}"
export const regExAttributesWithValueInsideQuotes = /[^().,#\s<>&=]+!?=(['"`]).*?\1/ig;

//- ** inside brackets **
//- class={currentFruit}
//- class={(validated > 1) ? 'red' : 'green'}
//- class!={[{id:test},{id:'ok'}]}
//- id!={yo}
export const regexAttributesWithValueInsideBrackets = /[^\s(]+?={(?:[^{}]+|\{(?:[^{}]+|\{[^{}]*\})*\})+}/ig;

//- ** non-boolean value without quotes or brackets**
//- id=cherry
export const regExAttributesWithEqualsAndNoQuotes = /[^().,#\s<>&=]+!?=[^'"`\s,)]+(?=[\s,.)])/ig;
// export const regExAttributesWithoutQuotes = /id(!?)=[^'"`\s),]+(?=[\s),])/i;
//[^'"`\s]+(?=[\s)])

//4. Tags
export const regExVugTag = /^[^\s\.#(]+?(?=\b|[\.#\s(])/i
export function extractElementTagFromVug(elString: string) {
	const matches = elString.match(regExVugTag);
	console.log('elString', elString)
	console.log('matches', matches)
	return matches && matches[0] ? matches[0] : 'div';
}