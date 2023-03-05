// import functions
import { get } from "svelte/store";
import { extractElementTagFromVug  } from "$utils/regExTags";
import { extractAttributes, extractIdLiteralFromVug, extractParentheses } from "$utils/regExAttributes";

// import stores
import { selfClosingTags } from "$stores/selfClosingTagsStore";

// constants
// placeholder class will be used to mark the position of the parentheses in the literals string
const placeholderClassName = '~vug~'
const specialCharacterSubstitutions = [
  { character: '(', replacement: '~op~' },
  { character: ')', replacement: '~cp~' },
  { character: '{', replacement: '~ob~' },
  { character: '}', replacement: '~cb~' },
  { character: '[', replacement: '~os~' },
  { character: ']', replacement: '~cs~' },
  { character: '.', replacement: '~dot~' },
]
const selfClosingTagsList = get(selfClosingTags);

export function parseVugElement(input:string) {

  //- trim leading and tailing space
  const trimmedInput = input.trim();

  // look for  first set of parentheses
  const parentheses = extractParentheses(trimmedInput);

  // remove the parentheses from the input
  // but mark where they were with a placeholder
  // so we can keep the same class order
  // e.g. 'div.class1.class2#id(...attributes).class3' => 'div.class1.class2#i.[placeholder].class3'
  const noParentheses = (parentheses) ? trimmedInput.replace(parentheses, `.${placeholderClassName}`) : trimmedInput;

  // look for first space or line break after the closing parentheses
  const firstSpaceIndex = noParentheses ? noParentheses.indexOf(' ') : -1;

  // separate the tag and attributes from the content
  // e.g. 'div.class1.class2#id content' => 'div.class1.class2#id' and 'content'
  const  tagAndLiterals = (firstSpaceIndex > 0) ? noParentheses.slice(0,firstSpaceIndex) : noParentheses;
  const content = (firstSpaceIndex > 0) ? noParentheses.slice(firstSpaceIndex + 1) : '';

  // get the tag name
  // e.g. 'div.class1.class2#id' => 'div'
  const tag = extractElementTagFromVug(tagAndLiterals);

  // separate the literals from the tag (if it has an explicit tag)
  // e.g. 'div.class1.class2#id' => 'class1.class2#id'
  // e.g. '.class1.class2#id' => 'class1.class2#id'
  const beginningOfString = tagAndLiterals.slice(0, tag.length);
  const literals = (beginningOfString == tag) ? tagAndLiterals.replace(tag,'') : tagAndLiterals;

  // get the id literal
  const idLiteral = extractIdLiteralFromVug(literals);
  const idLiteralValue = (idLiteral) ? idLiteral.replace('#','') : '';

  // get class literals string by removing idLiteral
  // result e.g '.class1.class2.class3'
  const classLiterals = (idLiteral) ?	literals.replace(idLiteral,'') : literals;

  //- remove initial dot so we can split class literals string on dots
  // result e.g 'class1.class2.class3'
  const classLiteralsAdjusted = classLiterals.substring(1);

  //- separate the class literals into before and after the placeholder
  //e.g 'class1.class2[placeholder].class3'

  //- before
  // e.g 'class1.class2'
  const classesSplit = classLiteralsAdjusted.split(`.${placeholderClassName}`);

  // make sure class literals before placeholder exist
  const classesBefore = (classesSplit.length > 0 && !classesSplit[0].includes(placeholderClassName)) ? classesSplit[0] : '';
  const classesBeforeArray = classesBefore ? classesBefore.split('.') : [];

  //- after
  // e.g '.class3'
  let classesAfter = '';
  if (classesBefore && classesSplit.length >= 2) classesAfter = classesSplit[1];
  else if (!classesBefore && classesSplit.length >= 1) classesAfter = classesSplit[0].replace(placeholderClassName, '');

  //- trim initial dot, then split on dots
  // e.g 'class3'
  const classesAfterTrimmed = classesAfter? classesAfter.substring(1) : '';
  const classesAfterArray= classesAfterTrimmed ? classesAfterTrimmed.split('.') : [];


  // remove parentheses from attributes string
  // e.g 'id="myId" class="myClass"'
  // const justAttributes = parentheses.replace(/[()]/g,'');
  const attributes = (extractAttributes(parentheses));


  // if there are any classes inside the parentheses, store them in a variable
  const classInsideParentheses = attributes.class ? attributes.class : [];

  // now consolidate all classes into one array
  attributes.class = [
    ...classesBeforeArray,
    ...classInsideParentheses,
    ...classesAfterArray
    ];

  // remove empty class property
  if (attributes.class.length == 0) {
    // remove class property if it's empty
    delete attributes.class;
  }

  // merge id literal
  if (idLiteralValue) {
    attributes.id = [idLiteralValue]
  }


  let attributesString = ''

  const attributeNames = Object.keys(attributes);
  attributeNames.forEach((attributeName, index) => {
    const attributeValue = attributes[attributeName];
    const attributeValueString = attributeValue.join(' ');
    attributesString += `${attributeName}="${attributeValueString}"`;
    if (index < attributeNames.length - 1) {
      attributesString += ' ';
    }
  });


  return `<${tag}${(attributesString) ? '(' + attributesString + ')' : ''}>\n\t${content}\n</${tag}>`;
  // replace special characters with placeholders
  // e.g. 'id="myId" class="myClass"' =>
  //const



  // we're going to use dom parser to create an HTML element to help us parse the attributes
  // we're not going to use the actual inputted tag in the new element
  // that would cause problems with various tags like <html>, <head>, <body>, <script>, <style>, <img>, etc.
  // instead all self-closing tags will use the <wbr> tag
  // and all other tags will use the <div> tag
  // and we'll encode the original tag in the data-vug-tag attribute to use later

  // is it a self-closing tag?
  // const tagIsSelfClosing = selfClosingTagsList.includes(tag);

  // create the template
  // const template = `
  // <${tagIsSelfClosing ? 'wbr' : 'div'}
  //   data-vug-tag="${tag}"
  //   ${attributesString}>${!tagIsSelfClosing && content ? content : ''}`;

  // create HTML
  // const parser = new DOMParser();
  // const doc = parser.parseFromString(template, 'text/html');
  // const el = doc.body.firstElementChild;

  // // if id literal exists, add it to the child
  // if (el && idLiteral) {
  //   el.id = idLiteralValue;
  // }

  // create a string to hold the final consolidated attributes
  // let attributesString = '';

  // consolidate the classes
  // if (el && (classesBeforePlaceholderArray || classesAfterPlaceholderArray)) {

  //   // first get the classes that are already on the child
  //   const elAttributeClassesArray = Array.from(el.classList);



  //   // now let's clear the child's classes
  //   //el.classList.remove(...elAttributeClassesArray);
  //   el.removeAttribute('class');

  //   // now let's start a new array to hold all the classes
  //   const allClasses: string[] = [];

  //   // add the classes before the placeholder to the array
  //   if (classesBeforePlaceholderArray.length > 0 && classesBeforePlaceholderArray[0] && classesBeforePlaceholderArray[0] != placeholderClassName) {
  //     allClasses.push(...classesBeforePlaceholderArray);
  //   }

  //   // add the classes from the child's attributes to the array
  //   if (elAttributeClassesArray.length > 0 && elAttributeClassesArray[0]) {
  //     allClasses.push(...elAttributeClassesArray);
  //   }

  //   // add the classes after the placeholder to the array
  //   if (classesAfterPlaceholderArray.length > 0 && classesAfterPlaceholderArray[0]) {
  //     allClasses.push(...classesAfterPlaceholderArray);
  //   }

  //   // add the classes from the array to the child
  //   // if (allClasses && allClasses[0]) el.classList.add(...allClasses);

  //   // instead of adding the classes to the child to be parsed as classes
  //   // we're going to encode them in an attribute called data-vug-classes
  //   if (allClasses && allClasses[0]) {
  //     el.setAttribute('data-vug-classes', allClasses.join(' '));
  //     // attributesString += `data-vug-classes="${allClasses.join(' ')}"`;
  //   }

  // }
  return '';


}
