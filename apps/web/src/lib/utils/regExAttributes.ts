// Attributes

// types
export interface ElementAttributes { [key: string]: string[]; }

// patterns
// phrase inside parentheses
// may have nested parentheses
export const regExInsideParens =  /\((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))+\)/i;

// valid attribute name characters
const validAttNameChar = /[^'"`{\t\n\r\s).#\\=]/
const validAttValueChar = '(?:[\w\n\r]|.)*?'
export const regExValidAttName = /[\b\w-_:\|]+?=/ig;

// attribute values with quotes
export const regExValQuotes = /!?=(['"`])+.*?['"`]*?.*?['"`]*?.*?\1+?/igs;
export const regExAttQuotes = /[\b\w-_:]+?!?=(['"`])+.*?['"`]*?.*?['"`]*?.*?\1+?/igs;

// attribute values with brackets
export const regExValBrackets = /!?={+.*?{*?.*?}*?.*?}+/igs;
export const regExAttBrackets = /[\b\w-_:]+?!?={+.*?{*?.*?}*?.*?}+/igs;

// attribute values with = without quotes or brackets
export const regExValBare = /!?=[\w-/:\[\]]+(?=[\W])/ig;
export const regExAttBare = /[\b\w-_:]+?!?=[\w-/:\[\]]+(?=[\W])/ig;

// attribute values with boolean
export const regExValBoolean = /[(\s\n,]{1}?[\w-:]+(?![=!-:\w()'"`{}])/ig;
export const regExAttBoolean = /[(\s\n,]{1}?[\w-:]+(?![=!-:\w()'"`{}])/ig;

// match all attribute values
export const regExAttValue = new RegExp(`${regExAttBoolean.source}|${regExAttBare.source}|${regExAttBrackets.source}|${regExAttQuotes.source}`, 'igs')

// match id literals
export const regExIdLiteral = /#[^.\s\n\r()#]+/i;

// functions
export function extractIdLiteralFromVug(literals: string) {
  const idMatches = literals.match(regExIdLiteral);
  const idLiteral = idMatches && idMatches[0] ? idMatches[0] : '';
  return idLiteral;
}
export function extractParentheses(inputString: string) {
  const matches = inputString.match(regExInsideParens);
  return matches ? matches[0] : "";
  }
export function scrubAttributeValue(value: string) {
  // no undefined value
  const noUndefinedValue = value ? value : '';

  // remove outer single and double quotes, and ticks
  const removeOuterQuotes = noUndefinedValue.replace(/^['`"]+|['`"]+$/g, '');

  // template literals are not allowed in svelte
  // attempt to convert to svelte expression
  // remove money sign
  const convertTemplateLiteral = removeOuterQuotes.replace(/\${/, '{');
  return convertTemplateLiteral;
}
export function extractAttributes(inputString: string) {
  // use regex to find all attribute declarations
  const matches = inputString.match(regExAttValue);
  const attributes = matches ? matches : [''];

  // do some cleaning
  // if the first attribute in the array is empty, remove it
  const removeEmpty = attributes[0] === '' ? attributes.slice(1) : attributes;
  const removeExclamation = removeEmpty.map((attribute) => attribute.replace(/!?(?==)/, ''));
  const removeLineBreaks = removeExclamation.map((attribute) => attribute.replace(/[\n]/g, ''));
  const trim = removeLineBreaks.map((attribute) => attribute.trim());

  // turn into key value pairs
  const pairs = trim.map(attribute => {
    const name = attribute.split('=')[0];
    const value = attribute.split('=')[1];
    const scrubbedValue = scrubAttributeValue(value);
    return [name, scrubbedValue]
  })



 const initialValue: ElementAttributes = {};
  const obj = pairs.reduce((accumulator, currentValue) => {
    const [name, value] = currentValue;
    accumulator[name] ? accumulator[name].push(value) : accumulator[name] = [value];
    return accumulator;
  }, initialValue)

  return obj;

//   return `
//   ${(obj.class && obj.class.length > 1) ? 'class="' + obj.class.join(' ') + '"' : ''}
//   ${(obj.style && obj.style.length > 1) ? 'style="' + obj.style.join(' ') + '"' : ''}
// `;
}

// export const regExAllClassLiterals = /\.([^\s.#()]*)(?=[\s.#()]|$)/ig;
// export const regExAllClassesWithQuotes = /\bclass!*=(['"`]).+?\1/ig; // with outside quotes
// export const regExAllClassesWithBrackets = /\bclass!*={{*(?:.|[\w\n\r])*}*}/ig; // with outside brackets
// export const regExAllClassesBare = /class!*=[^'"`{\s).]+(?=[\s),.])/ig;
// export const regExAllClassAttributes = new RegExp(`${regExAllClassesBare.source}|${regExAllClassesWithBrackets.source}|${regExAllClassesWithQuotes.source}`, 'ig')
// //export const regExAllClasses = new RegExp(`${regExAllClassAttributes.source}|${regExAllClassLiterals.source}`, 'ig')

// function extractAllClassLiterals(inputString: string) {
//   const matches = inputString.match(regExAllClassLiterals);
//   const literals = matches ? matches : [''];
//   return literals;
// }
// function extractAllClassAttributes(inputString: string) {
//   const matches = inputString.match(regExAllClassAttributes);
//   const attributes = matches ? matches : [''];
//   const classValues = attributes.map((attribute) => attribute.replace(/class!?=/, ''));
//   return classValues;
// }

// // functions
// export function extractAllClasses(inputString: string) {

//   // get all class literals
//   const literals = extractAllClassAttributes(inputString);
//   // trim initial dot
//   const trimmedLiterals = literals.map((literal) => literal.replace('.', ''));
//   return trimmedLiterals;
// }
// export const regExAllClassDeclarations = /class!?=/ig;
// export const extractAllClassesFromVug = (inputString: string) => {
// 	const regex =  new RegExp(`${regExAllClassAttributes.source}|${regExAllClassLiterals.source}`, 'ig')